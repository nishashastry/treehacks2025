import globalStyles from '../components/global';
import Navbar from '../components/navbar';
import { useRouter } from 'next/router';

function Layout(props) {
  const router = useRouter();
  const isExcludedPage = ['/login', '/signup', '/'].includes(router.pathname);

  return (
    <div className="page-layout">
      {!isExcludedPage && <Navbar />}
      {props.children}
      <style jsx global>
        {globalStyles}
      </style>
    </div>
  );
}

export default Layout;
