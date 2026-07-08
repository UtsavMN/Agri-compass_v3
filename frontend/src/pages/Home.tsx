import { useState, useEffect } from 'react';
import { useUser } from '@/store';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToKannada, containsKannada } from '@/lib/ai/translator';
import { cropRecommender, DetailedCropData } from '@/lib/ai/cropRecommender';
import { PostsAPI, Post } from '@/lib/api/posts';
import Onboarding from '@/components/Onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/ui/post-card';
import { PostListSkeleton } from '@/components/ui/post-skeleton';
import { CropCard } from '@/components/ui/crop-card';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal, StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/animations';
import { Sprout, Search, Plus, MessageCircle, Heart, Globe, Leaf, TrendingUp, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useUser();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const { language, toggleLanguage: globalToggleLanguage } = useLanguage();
  const [translating, setTranslating] = useState(false);
  const [detailedCrops, setDetailedCrops] = useState<DetailedCropData[]>([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);


  useEffect(() => {
    // Check if onboarding should be shown
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadDetailedCrops();
  }, [user]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPosts();
    }, 300);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, cropFilter, locationFilter, userFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.q = searchTerm;
      if (cropFilter) filters.crop = cropFilter;
      if (locationFilter) filters.location = locationFilter;
      if (userFilter) filters.user = userFilter;

      const data = await PostsAPI.getPosts(filters);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error loading posts',
        description: 'Failed to load community posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedCrops = async () => {
    try {
      const crops = await cropRecommender.getAllCrops();
      // Show first 6 crops for the home page
      setDetailedCrops(crops.slice(0, 6));
    } catch (error) {
      console.error('Error loading detailed crops:', error);
    } finally {
      setCropsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to like posts',
        variant: 'destructive',
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await PostsAPI.toggleLike(postId, user.id);

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, _count: { ...p._count!, likes: p._count!.likes + (p.isLiked ? -1 : 1) } }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      await PostsAPI.addComment(postId, user.id, content);

      // Update comment count
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, _count: { ...p._count!, comments: p._count!.comments + 1 } }
          : p
      ));

      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Post link has been copied to clipboard.',
    });
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;

    try {
      await PostsAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleToggleLanguage = async () => {
    setTranslating(true);
    try {
      globalToggleLanguage(); // This will change the context state
      const newLanguage = language === 'en' ? 'kn' : 'en';

      // Translate posts if switching to Kannada
      if (newLanguage === 'kn') {
        const translatedPosts = await Promise.all(
          posts.map(async (post) => {
            if (!post.kn_caption && !containsKannada(post.body || post.content || '')) {
              const translated = await translateToKannada(post.body || post.content || '');
              return { ...post, kn_caption: translated };
            }
            return post;
          })
        );
        setPosts(translatedPosts);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCropFilter('');
    setLocationFilter('');
    setUserFilter('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Agri Compass
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => window.location.href = '/auth'}>Sign In</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/auth'}>Get Started</Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Welcome to Agri Compass
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Karnataka's AI-powered agricultural platform connecting farmers, experts, and communities
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              onClick={() => window.location.href = '/auth'}
            >
              Join Our Community
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <div className="space-y-6">
        <ScrollReveal>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-gradient">
                {language === 'kn' ? 'ಕೃಷಿ ಸಮುದಾಯ' : 'Farmer Community'}
              </h1>
              <p className="text-gray-600 mt-2">
                {language === 'kn' ? 'ಕೃಷಿಕರೊಂದಿಗೆ ಜ್ಞಾನ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಸಂಪರ್ಕಿಸಿ' : 'Share knowledge and connect with fellow farmers'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleToggleLanguage}
                disabled={translating}
                className="flex items-center gap-2 transition-smooth hover:scale-105"
              >
                <Globe className="h-4 w-4" />
                {translating ? 'Translating...' : (language === 'en' ? 'ಕನ್ನಡ' : 'English')}
              </Button>

              <Button className="btn-primary card-interactive" onClick={() => window.location.href = '/community'}>
                <Plus className="mr-2 h-4 w-4" />
                {language === 'kn' ? 'ಪೋಸ್ಟ್ ಮಾಡಿ' : 'New Post'}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Search and Filters */}
        <ScrollReveal delay={0.2}>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-leaf-600" />
                {language === 'kn' ? 'ಶೋಧ ಮತ್ತು ಫಿಲ್ಟರ್' : 'Search & Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={language === 'kn' ? 'ಕೀವರ್ಡ್ ಹುಡುಕಿ...' : 'Search keywords...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Input
                  placeholder={language === 'kn' ? 'ಬೆಳೆ ಹುಡುಕಿ...' : 'Filter by crop...'}
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                />

                <Input
                  placeholder={language === 'kn' ? 'ಸ್ಥಳ ಹುಡುಕಿ...' : 'Filter by location...'}
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />

                <Input
                  placeholder={language === 'kn' ? 'ಬಳಕೆದಾರ ಹುಡುಕಿ...' : 'Filter by user...'}
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />

                <Button variant="outline" onClick={clearFilters}>
                  {language === 'kn' ? 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear Filters'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Detailed Crop Information Section */}
        <ScrollReveal delay={0.3}>
          <Card className="mb-6 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Leaf className="h-6 w-6 mr-2 text-leaf-600 animate-bounce-gentle" />
                {language === 'kn' ? 'ವಿವರವಾದ ಬೆಳೆ ಮಾಹಿತಿ' : 'Detailed Crop Information'}
              </CardTitle>
              <CardDescription>
                {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಬೆಳೆಗಳ ಬಗ್ಗೆ ವಿವರವಾದ ಮಾಹಿತಿ ಪಡೆಯಿರಿ' : 'Get detailed information about major crops in Karnataka'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cropsLoading ? (
                <div className="text-center py-8">
                  <div className="loading-shimmer h-32 rounded-lg mb-4"></div>
                  <p className="text-gray-600">{language === 'kn' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading crops...'}</p>
                </div>
              ) : (
                <StaggerContainer>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detailedCrops.map((crop) => (
                      <StaggerItem key={crop.crop}>
                        <CropCard
                          crop={crop}
                          onViewDetails={(_crop) => {
                            // Handle view details - could open modal or navigate

                          }}
                        />
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Posts Feed */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="space-y-4">
              {loading ? (
                <PostListSkeleton />
              ) : posts.length === 0 ? (
                <ScrollReveal delay={0.4}>
                  <Card className="text-center py-12 card-hover">
                    <CardContent>
                      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse-soft" />
                      <h3 className="text-xl font-semibold mb-2">
                        {language === 'kn' ? 'ಇನ್ನೂ ಪೋಸ್ಟ್ ಇಲ್ಲ' : 'No posts yet'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {language === 'kn' ? 'ಮೊದಲ ಪೋಸ್ಟ್ ಮಾಡಿ!' : 'Be the first to share something!'}
                      </p>
                      <Button onClick={() => window.location.href = '/community'}>
                        {language === 'kn' ? 'ಪೋಸ್ಟ್ ರಚಿಸಿ' : 'Create Post'}
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ) : (
                <StaggerContainer staggerDelay={0.1}>
                  {posts.map((post) => (
                    <StaggerItem key={post.id}>
                      <PostCard
                        post={{
                          id: post.id,
                          content: post.body || post.content || '',
                          kn_caption: post.kn_caption || undefined,
                          images: post.images,
                          video_url: post.video_url ?? undefined,
                          created_at: post.created_at,
                          user: post.user,
                          _count: post._count,
                          isLiked: post.isLiked,
                        }}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onDelete={handleDelete}
                        currentUserId={user.id}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <ScrollReveal delay={0.6} direction="right">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-leaf-600" />
                    {language === 'kn' ? 'ನಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ' : 'Trending in Community'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <FadeIn delay={0.1}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-leaf-50 transition-colors cursor-pointer">
                        <Heart className="h-4 w-4 text-red-500 animate-pulse-soft" />
                        <span>{language === 'kn' ? 'ಅತ್ಯಂತ ಲೈಕ್ ಆದ ಪೋಸ್ಟ್' : 'Most liked post'}</span>
                      </div>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-leaf-50 transition-colors cursor-pointer">
                        <MessageCircle className="h-4 w-4 text-blue-500 animate-pulse-soft" />
                        <span>{language === 'kn' ? 'ಅತ್ಯಂತ ಚರ್ಚಿತ ಪೋಸ್ಟ್' : 'Most discussed post'}</span>
                      </div>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-leaf-50 transition-colors cursor-pointer">
                        <Sprout className="h-4 w-4 text-green-500 animate-bounce-gentle" />
                        <span>{language === 'kn' ? 'ಈ ವಾರದ ಟಿಪ್' : 'Tip of the week'}</span>
                      </div>
                    </FadeIn>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

