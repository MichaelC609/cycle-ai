import './Navbar.css';
import Link from 'next/link';

function Navbar()
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
          <button className="login-btn">Log in</button>
          <button className="signup-btn">Sign up</button>
        </div>
    </header>
    </div>
  );
}

export default Navbar