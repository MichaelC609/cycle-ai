'use client';

import Navbar from './Navbar/Navbar';

export default function PageLayout({ children }) {
  return (
    <div className="app-container">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}