"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'framer-motion';

interface ResumeResultsProps {
    data: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ResumeResults({ data }: ResumeResultsProps) {
    const { name, email, skills } = data;

    // Mock score for demo purposes (real world would need job description matching)
    const matchScore = [
        { name: 'Match', value: 85 },
        { name: 'Gap', value: 15 },
    ];

    // Mock skill grouping for Radar chart
    const skillData = [
        { subject: 'Frontend', A: skills.includes('React') ? 100 : 50, fullMark: 100 },
        { subject: 'Backend', A: skills.includes('Django') || skills.includes('Python') ? 90 : 40, fullMark: 100 },
        { subject: 'AI/ML', A: skills.includes('Spacy') || skills.includes('Scikit-Learn') ? 80 : 30, fullMark: 100 },
        { subject: 'DevOps', A: skills.includes('Docker') ? 70 : 20, fullMark: 100 },
        { subject: 'Database', A: skills.includes('SQL') ? 85 : 40, fullMark: 100 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl"
        >
            {/* Profile Card */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Parsed Profile</h2>
                <div className="space-y-3 text-gray-300">
                    <p><span className="font-semibold text-blue-400">Name:</span> {name || "Not Found"}</p>
                    <p><span className="font-semibold text-blue-400">Email:</span> {email || "Not Found"}</p>
                    <div>
                        <span className="font-semibold text-blue-400">Top Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map((skill: string, idx: number) => (
                                <span key={idx} className="bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
                <h2 className="text-xl font-bold text-white mb-4">Role Fit Analysis</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                            <PolarGrid stroke="#4B5563" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
