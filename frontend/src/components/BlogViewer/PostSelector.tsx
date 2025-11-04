import React from 'react';

interface Post {
  id: number;
  title: string;
  department: string;
}

interface PostSelectorProps {
  posts: Post[];
  selectedPostId: string;
  loading: boolean;
  onPostSelect: (postId: string) => void;
}

const PostSelector: React.FC<PostSelectorProps> = ({
  posts,
  selectedPostId,
  loading,
  onPostSelect,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPostSelect(event.target.value);
  };

  return (
    <div className="dropdownContainer">
      <label htmlFor="post-select" className="dropdownLabel">
        Choose a blog post:
      </label>
      <select
        id="post-select"
        value={selectedPostId}
        onChange={handleChange}
        disabled={loading}
        className="dropdown"
      >
        <option value="">-- Select a blog post --</option>
        {posts.map((post) => (
          <option key={post.id} value={post.id}>
            {post.title} ({post.department})
          </option>
        ))}
      </select>
    </div>
  );
};

export default PostSelector;
