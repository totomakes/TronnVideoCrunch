'use client';

import React, { useState, useRef } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Upload, FileVideo, CheckCircle, Download, Play } from 'lucide-react';

export default function VideoProcessor() {
    const { loaded, progress, isProcessing, processVideo } = useFFmpeg();
    const [file, setFile] = useState<File | null>(null);
    const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setOutputBlob(null);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        const blob = await processVideo(file);
        if (blob) {
            setOutputBlob(blob);
        }
    };

    const handleDownload = () => {
        if (!outputBlob) return;
        const url = URL.createObjectURL(outputBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `3-panel-${file?.name || 'video.mp4'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="processor-container">
            <div className="glass-card">
                <h1 className="title">TRONN</h1>
                <p className="subtitle">Mobile-First 3-Panel Processor</p>

                {!loaded ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Initializing FFmpeg Core...</p>
                    </div>
                ) : (
                    <div className="ready-state">
                        {!file ? (
                            <div
                                className="drop-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="icon-circle">
                                    <Upload size={32} />
                                </div>
                                <p>Select Video</p>
                                <span>Tap to choose from Library</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="video/*"
                                    hidden
                                />
                            </div>
                        ) : (
                            <div className="file-info">
                                <div className="file-box">
                                    <FileVideo size={24} color="#888" />
                                    <div className="text">
                                        <p className="filename">{file.name}</p>
                                        <p className="filesize">{(file.size / (1024 * 1024)).toFixed(1)}MB</p>
                                    </div>
                                    {!isProcessing && !outputBlob && (
                                        <button className="remove-btn" onClick={() => setFile(null)}>×</button>
                                    )}
                                </div>

                                {!isProcessing && !outputBlob && (
                                    <button className="process-btn" onClick={handleProcess}>
                                        <Play size={18} fill="currentColor" />
                                        Process 3-Panel
                                    </button>
                                )}

                                {isProcessing && (
                                    <div className="progress-container">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="progress-text">Crunching pixels... {progress}%</p>
                                    </div>
                                )}

                                {outputBlob && (
                                    <div className="success-container">
                                        <div className="success-icon">
                                            <CheckCircle size={56} color="#10b981" />
                                        </div>
                                        <p style={{ marginBottom: '20px', fontWeight: 600 }}>Output Ready!</p>
                                        <button className="download-btn" onClick={handleDownload}>
                                            <Download size={18} />
                                            Save 1280x256
                                        </button>
                                        <button className="reset-btn" onClick={() => { setFile(null); setOutputBlob(null); }} style={{ marginTop: '12px' }}>
                                            Start New
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
