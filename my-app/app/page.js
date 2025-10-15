'use client';

import PageLayout from "./components/PageLayout";

export default function Home() {
  return (
    <PageLayout>
      <div className="home-content">
        <h1>Welcome to Cycle AI</h1>
        <p>Your intelligent cycling route optimization platform</p>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Smart Route Planning</h3>
            <p>Get the most optimal cycling routes based on your preferences</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-content {
          max-width: 800px;
        }

        .home-content h1 {
          font-size: 48px;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: bold;
        }

        .home-content > p {
          font-size: 20px;
          color: #7f8c8d;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .feature-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid #ecf0f1;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .feature-card h3 {
          color: #2c3e50;
          font-size: 20px;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .feature-card p {
          color: #7f8c8d;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .home-content h1 {
            font-size: 36px;
          }

          .feature-cards {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </PageLayout>
  );
}

