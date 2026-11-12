import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { evidenceService } from '../../services/evidenceService';

interface AudioWaveformProps {
  emergencySessionId?: string;
  onUploaded?: () => void;
  autoStart?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  emergencySessionId,
  onUploaded,
  autoStart = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startRecording = async () => {
    try {
      setUploadStatus(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio Context for visual waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleUpload(audioBlob, recordingSeconds);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      drawWaveform();
    } catch (err: any) {
      console.warn('Microphone permission or access error:', err.message);
      setUploadStatus('Microphone permission required for audio recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleUpload = async (blob: Blob, duration: number) => {
    setIsUploading(true);
    setUploadStatus('Encrypting and uploading evidence...');
    try {
      const formData = new FormData();
      formData.append('audio', blob, `emergency-recording-${Date.now()}.webm`);
      formData.append('durationSeconds', String(duration));
      if (emergencySessionId) {
        formData.append('emergencySessionId', emergencySessionId);
      }
      formData.append('notes', 'Automated ambient emergency microphone capture.');

      await evidenceService.uploadAudio(formData);
      setUploadStatus('Evidence uploaded and safely locked.');
      if (onUploaded) onUploaded();
    } catch (err: any) {
      setUploadStatus('Failed to upload evidence. Retrying on reconnection.');
    } finally {
      setIsUploading(false);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#DC2626'; // Red
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    render();
  };

  useEffect(() => {
    if (autoStart) {
      startRecording();
    }
    return () => {
      clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-600'
            }`}
          />
          <h4 className="text-sm font-semibold tracking-wide">Emergency Audio Evidence</h4>
        </div>
        <span className="font-mono text-sm font-bold text-red-400">
          {formatSeconds(recordingSeconds)}
        </span>
      </div>

      <div className="h-14 bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden mb-4 p-1">
        {isRecording ? (
          <canvas ref={canvasRef} width={280} height={50} className="w-full h-full" />
        ) : (
          <span className="text-xs text-slate-500">Audio visualizer inactive</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isUploading}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition"
          >
            <Mic className="w-4 h-4" />
            <span>START MIC CAPTURE</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
          >
            <Square className="w-4 h-4" />
            <span>STOP & SAVE RECORDING</span>
          </button>
        )}
      </div>

      {uploadStatus && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-cyan-400">
          <UploadCloud className="w-3.5 h-3.5 animate-pulse" />
          <span>{uploadStatus}</span>
        </div>
      )}

      <p className="mt-3 text-[11px] text-slate-500 leading-tight">
        * Web audio requires user permission and an active browser tab due to standard mobile OS privacy policies.
      </p>
    </div>
  );
};
