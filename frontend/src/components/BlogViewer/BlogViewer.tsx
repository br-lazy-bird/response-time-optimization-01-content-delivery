import React, { useState, useEffect } from 'react';
import ProblemDescription from './ProblemDescription';
import PostSelector from './PostSelector';
import PostDisplay from './PostDisplay';

interface Post {
  id: number;
  title: string;
  content: string;
  department: string;
  author: string;
  created_at: string;
}

const BlogViewer: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch all posts for dropdown on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setInitialLoading(true);
        const response = await fetch(`${API_BASE_URL}/posts`);

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        const postsData = await response.json();
        setPosts(postsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
        console.error('Error fetching posts:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostSelection = async (postId: string) => {
    setSelectedPostId(postId);

    if (!postId) {
      setSelectedPost(null);
      setLastRequestTime(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      setLastRequestTime(duration);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const postData = await response.json();
      setSelectedPost(postData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
      console.error('Error fetching post:', err);
      setSelectedPost(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="title">Blog Content Delivery</h2>

      <ProblemDescription />

      {initialLoading ? (
        <div className="loadingContainer">
          <div className="loadingSpinner" />
          <p className="loadingText">Loading blog posts...</p>
        </div>
      ) : (
        <>
          <PostSelector
            posts={posts}
            selectedPostId={selectedPostId}
            loading={loading}
            onPostSelect={handlePostSelection}
          />

          {loading && (
            <div className="loadingContainer">
              <div className="loadingSpinner" />
              <p className="loadingText">Loading post...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {selectedPost && lastRequestTime !== null && !loading && (
            <PostDisplay post={selectedPost} loadTime={lastRequestTime} />
          )}
        </>
      )}
    </div>
  );
};

export default BlogViewer;
