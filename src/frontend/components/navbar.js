import { useRouter } from 'next/router';

function Navbar() {
  const router = useRouter();

  return (
    <header className="header">
      <div>
        <img src="/logo_black.png" alt="MedMentor Logo" width={90} height={55} />
      </div>
      <nav className="nav">
        <button className="nav-button" onClick={() => router.push('/dashboard')}>Home</button>
        <button className="nav-button" onClick={() => router.push('/chatbot')}>Chatbot</button>
        <button className="nav-button" onClick={() => router.push('/clinical-notes')}>Live Clinical Notes</button>
        <button className="nav-button" onClick={() => router.push('/settings')}>
          <img src="/profile.png" alt="Profile" width={40} height={40} />
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
