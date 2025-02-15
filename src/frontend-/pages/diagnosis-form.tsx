import { useState, FormEvent } from 'react';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

interface Diagnosis {
  name: string;
  date: string;
  details: string;
}

export default function DiagnosisForm() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    { name: '', date: '', details: '' }
  ]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleAddDiagnosis = () => {
    setDiagnoses([...diagnoses, { name: '', date: '', details: '' }]);
  };

  const handleDiagnosisChange = (index: number, field: keyof Diagnosis, value: string) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses[index][field] = value;
    setDiagnoses(newDiagnoses);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Save diagnoses to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        diagnoses: diagnoses,
        updatedAt: new Date()
      }, { merge: true });

      router.push('/');
    } catch (error) {
      setError('Failed to save diagnoses. ' + (error as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Clinical Diagnosis Record</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {diagnoses.map((diagnosis, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">Diagnosis {index + 1}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnosis Name</label>
              <input
                type="text"
                value={diagnosis.name}
                onChange={(e) => handleDiagnosisChange(index, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnosis Date</label>
              <input
                type="date"
                value={diagnosis.date}
                onChange={(e) => handleDiagnosisChange(index, 'date', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Details</label>
              <textarea
                value={diagnosis.details}
                onChange={(e) => handleDiagnosisChange(index, 'details', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleAddDiagnosis}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Another Diagnosis
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save and Continue
          </button>
        </div>
      </form>
    </div>
  );
}
