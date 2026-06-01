import { useState, useEffect } from 'react';
import { useUser, MOCK_USERS } from '@/store';
import { apiGet } from '@/lib/httpClient';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, MapPin, Phone, Globe, Save, Shield, LayoutGrid, Clock, MessageSquare, Sprout } from 'lucide-react';
import ArchitectureMap from '@/components/ArchitectureMap';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { DISTRICTS } from '@/data/masterData';

export default function Profile() {
  const { user, profile, updateProfile, switchUser } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    location: '',
    language_preference: 'en',
  });
  const [posts, setPosts] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
  }>>([]);
  const [farms, setFarms] = useState<Array<{
    id: string;
    name: string;
    areaAcres: number;
    location: string;
    cropFocus?: string;
  }>>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        language_preference: profile.language_preference || 'en',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      void loadUserPosts(1);
      void loadUserFarms();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadUserFarms = async () => {
    setLoadingFarms(true);
    try {
      const data = await apiGet(`/api/farms`);
      setFarms(data || []);
    } catch (error) {
      console.error('Failed to load farms', error);
    } finally {
      setLoadingFarms(false);
    }
  };

  const loadUserPosts = async (nextPage: number) => {
    if (!user?.id) return;
    setLoadingPosts(true);
    try {
      const data = await apiGet(`/api/posts?userId=${user.id}&page=${nextPage}&limit=${PAGE_SIZE}`);
      
      if (nextPage === 1) setPosts(data || []);
      else setPosts((prev) => [...prev, ...(data || [])]);
      setPage(nextPage);
    } catch (error) {
      const err = error as { message?: string };
      toast({ title: 'Error loading posts', description: err.message ?? 'Failed to load', variant: 'destructive' });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Error updating profile',
        description: err.message ?? 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-24">
          <p className="text-gold-100/40 font-medium italic">Please sign in to view your profile architecture.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4 btn-gold">Authenticate</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gold-400/10 border-4 border-gold-400/20 flex items-center justify-center text-gold-400 shadow-premium">
               <User className="h-10 w-10" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black text-gold-100 tracking-tight">My Profile</h1>
              <p className="text-gold-100/40 text-sm font-bold uppercase tracking-[0.2em] mt-1">Settings</p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Navigation Sidebar */}
           <div className="space-y-4">
              <ScrollReveal direction="left" delay={0.2}>
                 <Card className="card-premium p-1.5 bg-earth-elevated/50 border-none shadow-premium">
                    <Button variant="ghost" className="w-full justify-start text-gold-400 bg-gold-400/10 font-bold h-11 rounded-lg">
                       <User className="h-4 w-4 mr-3" /> Profile Details
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gold-100/40 hover:text-gold-100 h-11 rounded-lg mt-1" onClick={() => navigate('/my-farm')}>
                       <Sprout className="h-4 w-4 mr-3" /> My Farms
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gold-100/40 hover:text-gold-100 h-11 rounded-lg mt-1" onClick={() => navigate('/community')}>
                       <MessageSquare className="h-4 w-4 mr-3" /> My Posts
                    </Button>
                 </Card>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.3}>
                 <Card className="card-premium p-6 border-gold-400/10 bg-gold-400/5">
                    <CardHeader className="p-0 mb-4">
                       <CardTitle className="text-xs font-black uppercase tracking-widest text-gold-400 flex items-center">
                          <Shield className="h-3 w-3 mr-2" /> Switch User
                       </CardTitle>
                    </CardHeader>
                    <div className="space-y-2">
                       {['dev_user', 'user_a', 'user_b'].map((id) => (
                          <button
                             key={id}
                             onClick={() => switchUser?.(id)}
                             className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tighter transition-all border ${
                                user.id === id 
                                ? 'bg-gold-400 text-earth-main border-gold-400' 
                                : 'bg-earth-main text-gold-100/40 border-earth-border hover:border-gold-400/30'
                             }`}
                          >
                             {id.replace('_', ' ')}
                          </button>
                       ))}
                    </div>
                 </Card>
              </ScrollReveal>
           </div>

           {/* Main Content Areas */}
           <div className="lg:col-span-2 space-y-8">
              <ScrollReveal direction="up" delay={0.4}>
                 <Card className="card-premium">
                    <CardHeader className="border-b border-earth-border/50">
                       <CardTitle className="text-gold-100 font-black tracking-tight flex items-center">
                          <LayoutGrid className="h-5 w-5 mr-3 text-gold-400" /> Profile Details
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                       <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Primary Email</Label>
                                <div className="flex items-center gap-3 bg-earth-main/50 p-3 rounded-xl border border-earth-border text-gold-100/30 text-sm">
                                   <Mail size={14} /> {user.email}
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Username Handle</Label>
                                <Input
                                  id="username"
                                  value={formData.username}
                                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                  className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-11 rounded-xl"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Full Name</Label>
                                <Input
                                  id="full_name"
                                  value={formData.full_name}
                                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                  className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-11 rounded-xl"
                                />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Phone</Label>
                                <Input
                                  id="phone"
                                  placeholder="+91 0000000000"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-11 rounded-xl"
                                />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">District</Label>
                              <Select
                                value={formData.location}
                                onValueChange={(val) => setFormData({ ...formData, location: val })}
                              >
                                <SelectTrigger id="location" className="bg-earth-main border-earth-border focus:ring-gold-400 text-gold-100 rounded-xl h-11 uppercase text-[11px] font-bold tracking-widest notranslate" translate="no">
                                  <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                                <SelectContent className="bg-earth-elevated border-earth-border max-h-[300px] notranslate" translate="no">
                                  {Object.keys(DISTRICTS).map((d) => (
                                    <SelectItem key={d} value={d} className="text-gold-100/80 hover:bg-earth-card hover:text-gold-100">
                                      {d}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-gold-100/40">Language</Label>
                             <Select
                               value={formData.language_preference}
                               onValueChange={(value) => setFormData({ ...formData, language_preference: value })}
                             >
                               <SelectTrigger className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 h-11 rounded-xl">
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-earth-elevated border-earth-border">
                                 {['en', 'kn', 'hi', 'pa', 'bn', 'mr', 'ta', 'te', 'gu'].map((lang) => (
                                    <SelectItem key={lang} value={lang} className="text-gold-100 uppercase text-xs font-bold">{lang === 'en' ? 'English' : lang === 'kn' ? 'Kannada' : lang}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                          </div>

                          <Button type="submit" disabled={loading} className="btn-gold w-full h-12 shadow-gold-glow">
                             {loading ? 'Loading...' : 'Save'}
                          </Button>
                       </form>
                    </CardContent>
                 </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.5}>
                 <Card className="card-premium">
                    <CardHeader className="border-b border-earth-border/50">
                       <CardTitle className="text-gold-100 font-black tracking-tight flex items-center">
                          <Sprout className="h-5 w-5 mr-3 text-gold-400" /> My Farms
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                       {loadingFarms ? (
                          <div className="p-4 animate-pulse bg-earth-elevated/50 rounded-xl border border-earth-border"></div>
                       ) : farms.length === 0 ? (
                          <EmptyState
                             icon={Sprout}
                             title="No farms added yet"
                             description="Add your farm to analyze soil and get crop recommendations."
                             action={{
                                label: "Add Farm",
                                onClick: () => navigate('/my-farm')
                             }}
                          />
                       ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {farms.map((farm) => (
                                <div key={farm.id} className="p-4 bg-earth-elevated rounded-2xl border border-earth-border hover:border-gold-400/30 transition-all cursor-pointer group" onClick={() => navigate('/my-farm')}>
                                   <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-black text-gold-100 group-hover:text-gold-400 transition-colors uppercase tracking-tight text-sm">{farm.name}</h4>
                                      <MapPin size={12} className="text-gold-400/40" />
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <Badge className="bg-gold-400/10 text-gold-400 border-none text-[10px]">{farm.areaAcres || 0} Acres</Badge>
                                      <span className="text-[10px] text-gold-100/40 font-bold uppercase tracking-tighter">{farm.location}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </CardContent>
                 </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.6}>
                 <Card className="card-premium">
                    <CardHeader className="border-b border-earth-border/50">
                       <CardTitle className="text-gold-100 font-black tracking-tight flex items-center">
                          <Clock className="h-5 w-5 mr-3 text-gold-400" /> My Posts
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                       {loadingPosts && posts.length === 0 ? (
                          <div className="p-4 animate-pulse bg-earth-elevated/50 rounded-xl border border-earth-border"></div>
                       ) : posts.length === 0 ? (
                          <EmptyState
                             icon={MessageSquare}
                             title="No posts found"
                             description="Share harvest updates, agricultural questions, or advice with other farmers."
                             action={{
                                label: "Share Post",
                                onClick: () => navigate('/community')
                             }}
                          />
                       ) : (
                          <div className="space-y-4">
                             {posts.map((p) => (
                                <div key={p.id} className="p-4 bg-earth-elevated rounded-2xl border border-earth-border hover:border-gold-400/30 transition-all group cursor-pointer" onClick={() => navigate(`/post/${p.id}`)}>
                                   <div className="flex justify-between items-center mb-2">
                                      <h4 className="text-xs font-black text-gold-100 uppercase tracking-widest">{p.category || 'General'}</h4>
                                      <span className="text-[10px] text-gold-100/30 font-bold">{new Date(p.created_at).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-sm text-gold-100/60 group-hover:text-gold-100 transition-colors line-clamp-2 leading-relaxed italic">"{p.content}"</p>
                                   <div className="mt-3 flex items-center gap-4 text-[10px] font-black text-gold-400/40 uppercase tracking-tighter">
                                      <span>{p.likes_count} Likes</span>
                                      <span>{p.comments_count} Comments</span>
                                   </div>
                                </div>
                             ))}
                             <Button variant="ghost" className="w-full text-gold-400 hover:bg-gold-400/5 text-[10px] font-black uppercase tracking-[0.2em]" onClick={() => loadUserPosts(page + 1)} disabled={loadingPosts}>
                                {loadingPosts ? 'Loading...' : 'Load more'}
                             </Button>
                          </div>
                       )}
                    </CardContent>
                 </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.7}>
                 <Card className="card-premium overflow-hidden border-none shadow-premium bg-earth-elevated/20">
                    <CardHeader className="bg-earth-elevated border-b border-earth-border p-6">
                       <CardTitle className="text-xl font-black text-gold-100 tracking-tight">About</CardTitle>
                       <CardDescription className="text-gold-100/40 font-medium">Technology stack powering the Agri Compass ecosystem</CardDescription>
                    </CardHeader>
                    <div className="p-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
                       <ArchitectureMap />
                    </div>
                 </Card>
              </ScrollReveal>
           </div>
        </div>
      </div>
    </Layout>
  );
}

