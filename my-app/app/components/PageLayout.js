'use client';

import Navbar from './Navbar';

export default function PageLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .main-content {
          flex: 1;
          margin-left: 250px;
          padding: 40px;
          background-color: white;
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 200px;
            padding: 20px;
          }
        }

        @media (max-width: 600px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}