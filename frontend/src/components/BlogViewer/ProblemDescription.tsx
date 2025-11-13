import React from 'react';

const ProblemDescription: React.FC = () => {
  return (
    <div className="description">
      <p>
        Our blog system is experiencing significant performance problems that are affecting user experience.
        Users report that loading blog posts takes several seconds, regardless of how many times it is acessed, 
        leading to frustration and reduced content engagement.
      </p>
      <p>
        Select a blog post from the dropdown below to experience the performance issue firsthand.
        Pay attention to the load time displayed after each request. The system needs investigation
        to identify why response times are so slow.
      </p>
    </div>
  );
};

export default ProblemDescription;
