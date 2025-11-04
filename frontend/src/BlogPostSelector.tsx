import React, { useState, useEffect } from 'react';
import './BlogPostSelector.css';

interface Post {
  id: number;
  title: string;
  content: string;
  department: string;
  author: string;
  created_at: string;
}

interface BlogPostSelectorProps {
  // Simplified props - no need for complex callbacks
}

const BlogPostSelector: React.FC<BlogPostSelectorProps> = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch all posts for dropdown on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        const startTime = Date.now();
        const response = await fetch(`${API_BASE_URL}/posts`);
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        setLastRequestTime(duration);
        
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
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle dropdown selection change
  const handlePostSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const postId = event.target.value;
    setSelectedPostId(postId);

    if (!postId) {
      setSelectedPost(null);
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
    <div className="blog-post-selector">
      <div className="selector-header">
        <h2>Select a Blog Post</h2>
      </div>

      <div className="dropdown-container">
        <label htmlFor="post-select" className="dropdown-label">
          Choose a post to read:
        </label>
        
        <select
          id="post-select"
          value={selectedPostId}
          onChange={handlePostSelection}
          disabled={loading}
          className={`post-dropdown ${loading ? 'loading' : ''}`}
        >
          <option value="">-- Select a blog post --</option>
          {posts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.title} ({post.department})
            </option>
          ))}
        </select>

        {loading && (
          <div className="loading-indicator">
            <span className="loading-text">Loading...</span>
          </div>
        )}

        {lastRequestTime !== null && !loading && (
          <div className="timing-info">
            <span className="timing-label">Request took:</span>
            <span className="timing-value">{lastRequestTime.toFixed(2)} seconds</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      {selectedPost && (
        <div className="selected-post-preview">
          <h3>{selectedPost.title}</h3>
          <div className="post-meta">
            <span className="author">Author: {selectedPost.author}</span>
            <span className="department">Department: {selectedPost.department}</span>
            <span className="date">Date: {new Date(selectedPost.created_at).toLocaleDateString()}</span>
          </div>
          <div className="post-content">
            {selectedPost.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostSelector;