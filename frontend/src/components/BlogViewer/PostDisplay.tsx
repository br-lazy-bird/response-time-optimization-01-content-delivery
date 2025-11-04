import React from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  department: string;
  author: string;
  created_at: string;
}

interface PostDisplayProps {
  post: Post;
  loadTime: number;
}

const PostDisplay: React.FC<PostDisplayProps> = ({ post, loadTime }) => {
  return (
    <div className="postDisplay">
      <h3 className="postTitle">{post.title}</h3>
      <div className="postMeta">
        <div className="metaItem">
          <span className="metaLabel">Author:</span>
          <span className="metaValue">{post.author}</span>
        </div>
        <div className="metaItem">
          <span className="metaLabel">Department:</span>
          <span className="metaValue">{post.department}</span>
        </div>
        <div className="metaItem">
          <span className="metaLabel">Date:</span>
          <span className="metaValue">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="postContent">{post.content}</div>
      <div className="loadTimeFooter">
        <span className="loadTimeLabel">Load time:</span>
        <span className="loadTimeValue">{loadTime.toFixed(2)}s</span>
      </div>
    </div>
  );
};

export default PostDisplay;
