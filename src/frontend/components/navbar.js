import { useRouter } from 'next/router';
import { FaCommentDots  } from 'react-icons/fa';

function Navbar() {
  const router = useRouter();

  return (
    <header className="header">
        <button className="nav-button" onClick={() => router.push('/dashboard')}>
          <img src="/logo_black.png" alt="MedMentor Logo" width={70} height='90%' />
        </button>
      <nav className="nav">
        <button className="nav-button" onClick={() => router.push('/chatbot')}>
          <FaCommentDots style={{ fontSize: '30px', color: 'white' }} />
        </button>
        <button className="nav-button" onClick={() => router.push('/settings')}>
          <img src="/profile.png" alt="Profile" width={40} height={40} />
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
