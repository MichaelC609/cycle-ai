import './Navbar.css';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Navbar()
{
  const { user, logout, loggingOut } = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState(null);

  const handleLogout = async () => {
    try {
      setLogoutError(null);
      await logout();
      
      // Force full page reload to home page to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to home even on error since local state is cleared
      window.location.href = '/';
    }
  };

  if(!user)
  {
    return (
      <div className="container">
        <header>
          <h1>Cycle AI</h1>
          <nav>
            <ul className="nav-link">
              <li>
                <Link href="/">
                  <h2>Home</h2>
                </Link>
              </li>
              
              <li>
                <Link href="/frontend/route-optimizer">
                  <h2>Add a Route</h2>
                </Link>
              </li>

              <li>
                <Link href="/savedRoutes">
                      <h2>Your Routes</h2>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="buttons">
              <button className="login-btn"><Link href="/login">Login</Link></button>
          </div>
      </header>
      </div>
    );
  }

  else
  {
    return (
      <div className="container">
        <header>
          <h1>Cycle AI</h1>
          <nav>
            <ul className="nav-link">
              <li>
                <Link href="/">
                  <h2>Home</h2>
                </Link>
              </li>
              
              <li>
                <Link href="/frontend/route-optimizer">
                  <h2>Add a Route</h2>
                </Link>
              </li>

              <li>
                <Link href="/savedRoutes">
                      <h2>Your Routes</h2>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="buttons">
            <button 
              className="login-btn" 
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
            {logoutError && (
              <span className="logout-error">{logoutError}</span>
            )}
          </div>
      </header>
      </div>
    );
  }
}

export default Navbar