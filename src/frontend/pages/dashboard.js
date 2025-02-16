import { useRouter } from 'next/router';
import Layout from '../components/layout';

// Function to generate random diagnoses
const generateDiagnoses = () => {
  const diagnoses = [
    { date: "2025-01-10", diagnosis: "Type 2 Diabetes - Newly Diagnosed", doctor: "Dr. Smith" },
    { date: "2024-11-25", diagnosis: "Hypertension (High Blood Pressure)", doctor: "Dr. Johnson" },
    { date: "2024-08-30", diagnosis: "Peripheral Neuropathy", doctor: "Dr. Lee" },
    { date: "2023-12-12", diagnosis: "Retinopathy - Early Stages", doctor: "Dr. Brown" },
  ];
  return diagnoses.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent diagnosis first
};

// Function to generate random upcoming medications
const generateMedications = () => {
  const medications = [
    { name: "Metformin", dosage: "500mg", schedule: "Once in the morning" },
    { name: "Lisinopril", dosage: "10mg", schedule: "Once daily" },
    { name: "Gabapentin", dosage: "300mg", schedule: "Twice daily for nerve pain" },
    { name: "Amlodipine", dosage: "5mg", schedule: "Once daily for hypertension" },
    { name: "Insulin Glargine", dosage: "20 units", schedule: "Once at night" },
  ];
  return medications;
};

export default function Dashboard() {
  const router = useRouter();
  const diagnoses = generateDiagnoses();
  const medications = generateMedications();

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-container">
          <h1 className="page-title">Health Dashboard</h1>
          <div className="dashboard-content">
            <div className="dashboard-box">
              <h2 className="section-title">Recent Diagnoses</h2>
              <ul>
                {diagnoses.map((item, index) => (
                  <li key={index}>
                    <strong>{item.diagnosis}</strong><br />
                    <span>{item.date}</span><br />
                    <em>Doctor: {item.doctor}</em>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dashboard-box">
              <h2 className="section-title">Upcoming Medications</h2>
              <ul>
                {medications.map((med, index) => (
                  <li key={index}>
                    <strong>{med.name}</strong><br />
                    <span>Dosage: {med.dosage}</span><br />
                    <em>Schedule: {med.schedule}</em>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
