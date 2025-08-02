import React, { useState } from 'react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with Supabase to register/save user
    console.log({ email, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-white p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <label className="block mb-2">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="college email"
          />
        </label>
        <label className="block mb-4">
          Role
          <select
            value={role}
            onChange={e => setRole(e.target.value as any)}
            className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </label>
        <button type="submit" className="w-full py-2 bg-red-500 rounded font-semibold hover:bg-red-600">
          Continue
        </button>
      </form>
    </div>
  );
};

export default Register;
