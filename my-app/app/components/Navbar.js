'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="sidebar">
        <div className="logo">
          <h2>Cycle AI</h2>
        </div>
        <ul className="nav-menu">
          <li className={pathname === '/' ? 'active' : ''}>
            <Link href="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              Home
            </Link>
          </li>
          <li className={pathname === '/frontend/route-optimizer' ? 'active' : ''}>
            <Link href="/frontend/route-optimizer" className="nav-link">
              <span className="nav-icon">🗺️</span>
              Route Optimizer
            </Link>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        .sidebar {
          width: 250px;
          background-color: #2c3e50;
          color: #ffffffff;
          padding: 20px 0;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          box-shadow: 2px 0 5px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .logo {
          padding: 0 20px 30px 20px;
          border-bottom: 1px solid #34495e;
          margin-bottom: 30px;
        }

        .logo h2 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #3498db;
        }

        .nav-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-menu li {
          margin-bottom: 5px;
        }

        .nav-link {
          width: 100%;
          padding: 15px 20px;
          background: none;
          border: none;
          color: white !important;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          text-decoration: none;
          font-size: 16px;
        }

        .nav-link:hover {
          background-color: #ffffffff !important;
          color: yellow !important;
        }

        .nav-menu li.active .nav-link {
          background-color: #ffffffff !important;
          color: white !important;
        }

        .nav-icon {
          margin-right: 12px;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }
        }

        @media (max-width: 600px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
          }

          .nav-menu {
            display: flex;
            overflow-x: auto;
          }

          .nav-menu li {
            margin-bottom: 0;
            margin-right: 5px;
            flex-shrink: 0;
          }
        }
      `}</style>
    </>
  );
}