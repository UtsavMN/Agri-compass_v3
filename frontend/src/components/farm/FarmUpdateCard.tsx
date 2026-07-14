import { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Edit2, Image as ImageIcon, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { apiPut } from '@/lib/httpClient';

interface FarmUpdate {
  id: string;
  farm_id: string;
  clerk_user_id: string;
  post_text: string;
  image_urls: string; // JSON array string
  created_at: string;
  updated_at: string;
}

interface FarmUpdateCardProps {
  update: FarmUpdate;
  onUpdate: (updated: FarmUpdate) => void;
}

export function FarmUpdateCard({ update, onUpdate }: FarmUpdateCardProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === update.clerk_user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(update.post_text || '');
  const [isSaving, setIsSaving] = useState(false);

  const images: string[] = update.image_urls ? JSON.parse(update.image_urls) : [];

  const handleSave = async () => {
    if (!editText.trim()) return;
    setIsSaving(true);
    try {
      const token = await getToken();
      const updated = await apiPut(`/api/farm-updates/${update.id}`, { post_text: editText }, token);
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReply = () => {
    const text = update.post_text || '';
    const preview = text.substring(0, 50) + (text.length > 50 ? '...' : '');
    const date = update.created_at ? new Date(update.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    const prefill = `> Re: Farm Update (${date}): "${preview}"\n\n`;
    navigate(`/messages/${update.clerk_user_id}`, { state: { prefill } });
  };

  return (
    <div className="p-5 bg-earth-main/30 rounded-[1.5rem] border border-earth-border shadow-sm mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-[10px] text-gold-100/40 uppercase tracking-widest font-bold">
          {update.created_at && formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
        </div>
        {isOwner && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-gold-100/40 hover:text-gold-400 transition-colors">
            <Edit2 size={14} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-earth-elevated border border-earth-border rounded-xl p-3 text-gold-100 text-sm focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/10 outline-none resize-none min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent border-earth-border text-gold-100" onClick={() => setIsEditing(false)}>
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs bg-gold-400 text-black hover:bg-gold-500" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gold-100/80 text-sm leading-relaxed whitespace-pre-wrap">{update.post_text}</p>
      )}

      {images.length > 0 && !isEditing && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-earth-border/50">
              <img src={url} alt="Farm update" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      {!isOwner && (
        <div className="mt-4 pt-4 border-t border-earth-border/50 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReply} className="bg-transparent border-gold-400/20 text-gold-400 hover:bg-gold-400/10 text-xs h-8">
            <MessageSquare className="w-3 h-3 mr-2" /> Reply to Owner
          </Button>
        </div>
      )}
    </div>
  );
}
