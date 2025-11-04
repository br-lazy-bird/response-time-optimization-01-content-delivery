import React from 'react';
import ProblemDescription from './ProblemDescription';
import BlogPostSelector from './BlogPostSelector';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="container">
        <ProblemDescription />
        <BlogPostSelector />
      </div>
    </div>
  );
}

export default App;