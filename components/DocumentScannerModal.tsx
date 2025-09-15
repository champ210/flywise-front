import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/common/Icon';
import { DocumentScanResult } from '@/types';
import { parseDocumentFromImage } from '@/services/geminiService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface DocumentScannerModalProps {
  onClose: () => void;
  onSaveDocument?: (document: DocumentScanResult) => void;
}

const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({ onClose, onSaveDocument }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Could not access the camera. Please check permissions.");
            console.error("Camera access error:", err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();

        // Process with AI
        setIsLoading(true);
        setError(null);
        setScanResult(null);
        try {
            const mimeType = 'image/jpeg';
            const base64 = dataUrl.split(',')[1];
            const result = await parseDocumentFromImage(base64, mimeType);
            setScanResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to scan document.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        setScanResult(null);
        setError(null);
        startCamera();
    };

    const handleSave = () => {
        if (scanResult && onSaveDocument) {
            onSaveDocument(scanResult);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">Scan Travel Document</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100"><Icon name="x-mark" className="h-6 w-6" /></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6">
                    {error && <div className="text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                    <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured document" className="w-full h-full object-contain" />
                        ) : (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        )}
                    </div>

                    {scanResult ? (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                            <h3 className="font-bold text-lg text-blue-600">{scanResult.documentType}</h3>
                            <div className="mt-2 text-sm space-y-1">
                                {scanResult.confirmationNumber && <p><strong>Confirmation #:</strong> {scanResult.confirmationNumber}</p>}
                                {scanResult.passengerName && <p><strong>Name:</strong> {scanResult.passengerName}</p>}
                                {Object.entries(scanResult.details).map(([key, value]) => (
                                    <p key={key}><strong>{key}:</strong> {value}</p>
                                ))}
                            </div>
                        </div>
                    ) : isLoading && (
                        <div className="text-center p-4">
                            <LoadingSpinner />
                            <p className="mt-2 text-slate-600">Analyzing document...</p>
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t bg-slate-50 flex justify-center gap-4">
                    {capturedImage ? (
                        <>
                            <button onClick={handleRetake} className="px-6 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-200 hover:bg-slate-300">
                                Retake Photo
                            </button>
                            {scanResult && onSaveDocument && (
                                <button onClick={handleSave} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                    Save to Active Trip
                                </button>
                            )}
                        </>
                    ) : (
                        <button onClick={handleCapture} disabled={!stream} className="px-8 py-3 text-base font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                            Capture
                        </button>
                    )}
                </footer>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default DocumentScannerModal;