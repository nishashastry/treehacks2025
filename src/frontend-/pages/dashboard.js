import { useRouter } from 'next/router';
import Layout from '../components/layout'; // Assuming the Layout component is in the components folder

export default function Dashboard() {
  const router = useRouter();

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-container">
          <h1 className="page-title">Health Dashboard</h1>
          <div className="dashboard-content">
            <div className="dashboard-box">
              <h2 className="section-title">Recent Diagnoses</h2>
              {/* Add your diagnosis data here */}
            </div>
            <div className="dashboard-box">
              <h2 className="section-title">Upcoming Medications</h2>
              {/* Add your medications data here */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
