import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PostsAPI, Post } from '@/lib/api/posts';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadPost = async () => {
      setLoading(true);
      try {
        const data = await PostsAPI.getPostById(id);
        setPost(data);
      } catch (error) {
        console.error('Error loading post detail:', error);
        toast({
          title: 'Unable to load post',
          description: 'Please try again or return to community.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    void loadPost();
  }, [id, toast]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {loading ? (
          <Card className="p-6">
            <CardContent>
              <p className="text-secondary">Loading post details…</p>
            </CardContent>
          </Card>
        ) : post ? (
          <Card className="overflow-hidden">
            <CardHeader className="bg-leaf-600 text-white">
              <CardTitle>{post.user.full_name || post.user.username}</CardTitle>
              <CardDescription>{format(new Date(post.created_at), 'PPPP')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.user.avatar_url} />
                  <AvatarFallback>{post.user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">@{post.user.username}</p>
                  <p className="text-sm text-tertiary">Post ID: {post.id}</p>
                </div>
              </div>

              <div className="prose prose-lg text-body">
                <p>{post.body || post.content}</p>
              </div>

              {post.images?.length ? (
                <div className="grid gap-4">
                  {post.images.map((image, index) => (
                    <img key={index} src={image} alt={`Post media ${index + 1}`} className="rounded-lg w-full object-cover" />
                  ))}
                </div>
              ) : null}

              {post.video_url ? (
                <video controls src={post.video_url} className="w-full rounded-lg" />
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6">
            <CardContent>
              <p className="text-secondary">Post not found. Please return to the community page.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
