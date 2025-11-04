import React from 'react';
import './ProblemDescription.css';

const ProblemDescription: React.FC = () => {
  return (
    <div className="problem-description">
      <div className="problem-header">
        <h1>Blog Performance Issue</h1>
      </div>
      
      <div className="problem-content">
        <div className="issue-summary">
          <h2>Current System Status</h2>
          <p>
            Our blog system is experiencing significant performance problems that are affecting user experience. 
            Users are reporting slow loading times when accessing blog posts, and our analytics show concerning 
            response time metrics.
          </p>
        </div>

        <div className="reported-issues">
          <h3>Reported Issues</h3>
          <ul>
            <li>Blog posts take several seconds to load</li>
            <li>Users are experiencing delays when switching between different posts</li>
            <li>The system feels unresponsive during normal browsing</li>
            <li>Page load times are significantly above industry standards</li>
          </ul>
        </div>

        <div className="impact-assessment">
          <h3>Business Impact</h3>
          <p>
            These performance issues are directly impacting user engagement and satisfaction. 
            Slow loading times can lead to increased bounce rates and reduced content consumption. 
            The system needs immediate investigation and optimization to restore acceptable performance levels.
          </p>
        </div>

        <div className="investigation-needed">
          <h3>Your Task</h3>
          <p>
            Please investigate the current system performance and identify the root cause of these delays. 
            Use the blog interface below to experience the performance issues firsthand, then analyze 
            the system architecture to determine what optimizations are needed.
          </p>
          <p>
            Focus on understanding why each request takes so long and what changes could improve 
            the overall system responsiveness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;