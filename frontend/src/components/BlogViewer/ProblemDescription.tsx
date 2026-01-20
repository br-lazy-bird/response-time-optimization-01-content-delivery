import React from 'react';

const ProblemDescription: React.FC = () => {
  return (
    <div className="description">
      <div className="dialogue">
        <img src="/lazy-bird.png" alt="Lazy Bird" className="mascot-icon" />
        <p>
          "So, this is the blog platform I mentioned in the <a href="https://github.com/br-lazy-bird/response-time-optimization-01-content-delivery/blob/main/README.md#the-problem" target="_blank" rel="noopener noreferrer">README</a>...
          Users are complaining that loading posts is super slow. Every. Single. Time.
          I tried loading the same post twice and it takes forever both times. Like, why? It's the same post!
          There's definitely something weird going on in the backend. But I just found a really comfortable spot in the sun, so...
          could you load some posts and see what's happening? Thanks!"
        </p>
      </div>
    </div>
  );
};

export default ProblemDescription;
