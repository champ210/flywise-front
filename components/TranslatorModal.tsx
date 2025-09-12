import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { TranslationResult } from '../types';
import { translateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface TranslatorModalProps {
  onClose: () => void;
}

const TranslatorModal: React.FC<TranslatorModalProps> = ({ onClose }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            setError("Could not access camera. Please check permissions.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setStream(null);
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const handleCaptureAndTranslate = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();

        setIsLoading(true);
        setError(null);
        setTranslationResult(null);
        try {
            const base64 = dataUrl.split(',')[1];
            const result = await translateImage(base64, 'image/jpeg');
            setTranslationResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to translate image.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        setTranslationResult(null);
        setError(null);
        startCamera();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">Real-Time Translator</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100"><Icon name="x-mark" className="h-6 w-6" /></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6">
                    {error && <div className="text-center text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</div>}
                    
                    {!translationResult && !isLoading && (
                        <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center p-4 h-64 flex flex-col justify-center items-center">
                            <LoadingSpinner />
                            <p className="mt-2 text-slate-600">Translating text from image...</p>
                        </div>
                    )}
                    
                    {translationResult && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">Original</h3>
                                <div className="bg-slate-100 p-3 rounded-md text-sm h-48 overflow-y-auto whitespace-pre-wrap">{translationResult.originalText}</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">Translation (English)</h3>
                                <div className="bg-blue-50 p-3 rounded-md text-sm h-48 overflow-y-auto whitespace-pre-wrap">{translationResult.translatedText}</div>
                            </div>
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t bg-slate-50 flex justify-center gap-4">
                    {capturedImage ? (
                        <button onClick={handleRetake} className="px-6 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-200 hover:bg-slate-300">
                            Translate Another
                        </button>
                    ) : (
                        <button onClick={handleCaptureAndTranslate} disabled={!stream || isLoading} className="px-8 py-3 text-base font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                            Translate
                        </button>
                    )}
                </footer>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default TranslatorModal;