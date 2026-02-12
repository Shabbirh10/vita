"use client";

import { useState } from 'react';
import ResumeUpload from '@/components/ResumeUpload';
import ResumeResults from '@/components/ResumeResults';
import { motion } from 'framer-motion';

export default function Home() {
  const [data, setData] = useState(null);

  const handleUploadSuccess = (responseData: any) => {
    setData(responseData);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-6xl flex justify-between items-center mb-12"
      >
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          NLP Resume Parser
        </h1>
        <div className="flex gap-4">
          <a
            href="https://github.com"
            target="_blank"
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            GitHub
          </a>
        </div>
      </motion.header>

      {/* Hero Section */}
      {!data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10 max-w-2xl"
        >
          <h2 className="text-5xl font-bold mb-6">Unlock Your Career Potential with AI</h2>
          <p className="text-gray-400 text-lg mb-8">
            Upload your resume and let our advanced NLP engine extract skills, analyze role fit, and visualize your professional profile in seconds.
          </p>
        </motion.div>
      )}

      {/* Upload Area */}
      {!data && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-xl"
        >
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </motion.div>
      )}

      {/* Results Section */}
      {data && (
        <div className="w-full flex flex-col items-center gap-8">
          <ResumeResults data={data} />
          <button
            onClick={() => setData(null)}
            className="text-gray-400 hover:text-white underline mt-8"
          >
            Parse Another Resume
          </button>
        </div>
      )}
    </main>
  );
}
