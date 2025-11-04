import React from 'react';
import BlogViewer from './components/BlogViewer/BlogViewer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="container">
      <div className="app-wrapper">
        <h1 className="page-title">Lazy Bird</h1>
        <BlogViewer />
      </div>
    </div>
  );
};

export default App;