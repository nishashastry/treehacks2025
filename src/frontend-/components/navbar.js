import { useRouter } from 'next/router';

function Navbar() {
  const router = useRouter();

  return (
    <header className="header">
      <h1 className="title">MedMentor</h1>
      <nav className="nav">
        <button className="nav-button" onClick={() => router.push('/dashboard')}>Home</button>
        <button className="nav-button" onClick={() => router.push('/chatbot')}>Chatbot</button>
        <button className="nav-button" onClick={() => router.push('/clinical-notes')}>Live Clinical Notes</button>
        <button className="nav-button" onClick={() => router.push('/settings')}>Settings</button>
      </nav>
    </header>
  );
}

export default Navbar;
