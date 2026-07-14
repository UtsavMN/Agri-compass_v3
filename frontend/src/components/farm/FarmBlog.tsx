import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { apiGet, apiPost } from '@/lib/httpClient';
import { FarmUpdateCard } from './FarmUpdateCard';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2, Send } from 'lucide-react';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface FarmBlogProps {
  farmId: string;
  ownerId: string;
  isOwner?: boolean;
}

export function FarmBlog({ farmId, ownerId, isOwner: isOwnerProp }: FarmBlogProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // If isOwnerProp is provided, use it. Otherwise, compute it.
  const isOwner = isOwnerProp !== undefined ? isOwnerProp : (user?.id === ownerId);

  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, [farmId]);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/farms/${farmId}/updates`);
      setUpdates(data || []);
    } catch (error) {
      console.error('Failed to load farm updates', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPostText.trim() && !selectedFile) return;
    setIsPosting(true);
    try {
      const token = await getToken();
      let imageUrls = '[]';
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'agri-compass/farm-updates');
        // Need custom fetch for FormData to /api/upload
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          imageUrls = JSON.stringify([uploadData.url]);
        }
      }

      const newUpdate = await apiPost(`/api/farms/${farmId}/updates`, {
        post_text: newPostText,
        image_urls: imageUrls,
        clerk_user_id: user?.id
      }, token);

      setUpdates([newUpdate, ...updates]);
      setNewPostText('');
      setSelectedFile(null);
      setShowPostForm(false);
    } catch (error) {
      console.error('Failed to post update', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdateChanged = (updatedItem: any) => {
    setUpdates(updates.map(u => u.id === updatedItem.id ? updatedItem : u));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Farm Timeline</h4>
        {isOwner && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowPostForm(!showPostForm)}
            className="h-6 w-6 text-gold-100/40 hover:text-gold-400 hover:bg-gold-400/10 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOwner && showPostForm && (
        <div className="bg-earth-elevated border border-earth-border rounded-[1.5rem] p-5 shadow-inner mb-6">
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share an update, milestone, or challenge on this farm..."
            className="w-full bg-transparent border-none outline-none text-gold-100 text-sm placeholder:text-gold-100/30 resize-none min-h-[80px]"
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-earth-border/50">
            <div>
              <label className="cursor-pointer text-gold-100/40 hover:text-gold-400 transition-colors flex items-center gap-2 text-xs">
                <ImageIcon size={16} />
                {selectedFile ? <span className="text-gold-400 font-medium truncate max-w-[150px]">{selectedFile.name}</span> : <span>Attach Photo</span>}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <Button 
              size="sm" 
              className="bg-gold-400 text-black hover:bg-gold-500 rounded-xl px-5 h-9"
              onClick={handlePost}
              disabled={isPosting || (!newPostText.trim() && !selectedFile)}
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Post Update
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gold-400" /></div>
        ) : updates.length > 0 ? (
          updates.map((update) => (
            <FarmUpdateCard key={update.id} update={update} onUpdate={handleUpdateChanged} />
          ))
        ) : (
          <EmptyState 
            title="No Updates Yet" 
            description={isOwner ? "Share your first farm update above to start your timeline." : "The owner hasn't shared any updates for this farm yet."}
            icon="Sprout"
          />
        )}
      </div>
    </div>
  );
}
