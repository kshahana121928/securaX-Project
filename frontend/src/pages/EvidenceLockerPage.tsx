import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Mic,
  Play,
  Pause,
  Download,
  Trash2,
  Clock,
  ShieldAlert,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { evidenceService } from '../services/evidenceService';
import { EvidenceFile } from '../types';

export const EvidenceLockerPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const loadEvidence = async () => {
    try {
      const res = await evidenceService.getEvidenceList();
      if (res.success) {
        setEvidenceList(res.evidence);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
    return () => {
      if (activeAudio) activeAudio.pause();
    };
  }, []);

  const handlePlayPause = (file: EvidenceFile) => {
    if (playingId === file._id) {
      activeAudio?.pause();
      setPlayingId(null);
      return;
    }

    if (activeAudio) {
      activeAudio.pause();
    }

    const audio = new Audio(file.filePath);
    audio.play();
    audio.onended = () => setPlayingId(null);
    setActiveAudio(audio);
    setPlayingId(file._id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this emergency evidence record?')) {
      if (playingId === id && activeAudio) {
        activeAudio.pause();
        setPlayingId(null);
      }
      await evidenceService.deleteEvidence(id);
      loadEvidence();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <FolderLock className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Encrypted Emergency Evidence Locker</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Protected vault containing ambient audio evidence, emergency timestamps, and incident logs.
          </p>
        </div>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Legal Notice:</strong> SecuraX captures and stores audio recordings, telemetry, and timestamps under user authorization. SecuraX makes no legal guarantees that digital browser evidence satisfies forensic chain-of-custody requirements without court validation.
        </div>
      </div>

      {/* Evidence Table / Cards */}
      {evidenceList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Evidence Recordings Stored Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Audio captured during an active emergency SOS or recorded via the microphone tool will securely appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evidenceList.map((file) => (
            <div
              key={file._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm truncate max-w-[160px]">
                        {file.originalName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Math.round(file.sizeBytes / 1024)} KB • {file.durationSeconds || 0}s duration
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {file.fileType}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recorded At:</span>
                    <span className="font-mono text-slate-700">
                      {new Date(file.recordedAt).toLocaleString()}
                    </span>
                  </div>
                  {file.notes && (
                    <p className="text-[11px] text-slate-500 pt-1 italic line-clamp-2">
                      "{file.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() => handlePlayPause(file)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                    playingId === file._id
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {playingId === file._id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{playingId === file._id ? 'Pause' : 'Play Audio'}</span>
                </button>

                <a
                  href={file.filePath}
                  download={file.originalName}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleDelete(file._id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition"
                  title="Delete Evidence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
