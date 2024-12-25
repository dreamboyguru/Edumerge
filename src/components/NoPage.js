import React from "react";

const NoPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-1 text-danger">404</h1>
      <h2 className="text-secondary">Page Not Found</h2>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary mt-3">
        Go Home
      </a>
    </div>
  );
};

export default NoPage;
