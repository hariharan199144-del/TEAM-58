import React, { useState, useRef, useEffect } from 'react';

interface RecorderProps {
  onAnalysisStart: (blob: Blob) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onAnalysisStart }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setElapsedTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleReRecord = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsedTime(0);
    chunksRef.current = [];
  };

  const handleAnalyze = () => {
    if (audioBlob) {
      onAnalysisStart(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-8 animate-fade-in">
      
      {/* Visualizer / Status Area */}
      <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
        {isRecording && (
           <>
            <div className="absolute w-full h-full rounded-full border-4 border-cherry/20 animate-pulse-slow"></div>
            <div className="absolute w-48 h-48 rounded-full border-4 border-cherry/40 animate-pulse-slow delay-75"></div>
           </>
        )}
        
        <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
          isRecording ? 'bg-red-600 scale-110' : 'bg-slate-800'
        }`}>
           <i className={`fa-solid ${isRecording ? 'fa-microphone-lines' : 'fa-microphone'} text-4xl text-white mb-2`}></i>
           <span className="text-white font-mono text-xl">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2 text-center">
        {isRecording ? 'Recording...' : audioBlob ? 'Recording Complete' : 'Studio Record'}
      </h2>
      <p className="text-slate-400 mb-8 text-center">
        {isRecording ? 'Speak clearly into your microphone' : audioBlob ? 'Review your recording below' : 'Tap the button to start recording your lecture or notes.'}
      </p>

      {/* Controls */}
      <div className="w-full space-y-4">
        {!audioBlob && !isRecording && (
           <button 
             onClick={startRecording}
             className="w-full py-4 bg-cherry text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-95"
           >
             Start Recording
           </button>
        )}

        {isRecording && (
          <button 
            onClick={stopRecording}
            className="w-full py-4 bg-slate-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-600 transition-all active:scale-95 border border-slate-600"
          >
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 animate-slide-up">
            <audio src={audioUrl!} controls className="w-full h-10 block rounded mb-4" />
            
            <div className="flex gap-4">
              <button 
                onClick={handleReRecord}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-500 text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-colors"
              >
                Re-record
              </button>
              <button 
                onClick={handleAnalyze}
                className="flex-1 py-3 px-4 rounded-xl bg-tan text-slate-900 font-bold hover:bg-[#dcd1a2] transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>Analyze</span>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;