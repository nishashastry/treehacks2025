import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/config';
import Layout from '../components/layout';
import '../components/styles.css';

const noAuthRequired = ['/login', '/signup'];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && !noAuthRequired.includes(router.pathname)) {
        router.push('/');  // Redirect to landing page if not logged in
      } else if (user && noAuthRequired.includes(router.pathname)) {
        router.push('/dashboard');  // Redirect to dashboard if already logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
