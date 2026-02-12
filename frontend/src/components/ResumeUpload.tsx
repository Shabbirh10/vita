"use client";

import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ResumeUploadProps {
    onUploadSuccess: (data: any) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFile = async (file: File) => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using 127.0.0.1 to avoid local lookup issues
            const response = await axios.post('http://127.0.0.1:8000/api/resumes/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadSuccess(response.data);
        } catch (error: any) {
            console.error("Upload failed details:", error.response?.data || error.message);
            alert(`Upload failed: ${error.response?.data?.detail || error.message}`);
        } finally {

            setLoading(false);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
        ${isDragOver ? 'border-blue-500 bg-blue-50/10' : 'border-gray-600 hover:border-blue-400'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFile(e.dataTransfer.files[0]);
            }}
        >
            <input
                type="file"
                className="hidden"
                id="resume-upload"
                accept=".pdf"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />

            {loading ? (
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            ) : (
                <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-300">
                        Drag & drop your resume here
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        or click to browse (PDF only)
                    </p>
                </label>
            )}
        </div>
    );
}
