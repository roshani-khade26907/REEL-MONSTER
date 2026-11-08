import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderOpen,
  X,
  FileText,
  Boxes
} from 'lucide-react';
import { PROJECT_SOURCE_FILES, generateProjectZip } from '../utils/projectZip';

interface CodeExplorerProps {
  onClose: () => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState(PROJECT_SOURCE_FILES[3]); // Default to AndroidManifest or Service
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ReelMonster_Native_Android_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error creating zip', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-slate-900 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden text-white font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-600 rounded-xl">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Native Android Studio Source Explorer</h2>
              <p className="text-[11px] text-slate-400">
                Kotlin 2.0 • Jetpack Compose • WindowManager Overlay • Room DB • AGP 8.3.2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Packing ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 min-h-0">
          {/* File Tree Sidebar */}
          <div className="w-72 bg-slate-950/80 border-r border-slate-800 p-3 overflow-y-auto space-y-1 text-xs">
            <div className="px-2 py-1 font-bold text-[10px] text-pink-400 uppercase tracking-wider">
              Project Structure
            </div>

            {PROJECT_SOURCE_FILES.map(file => {
              const isSelected = selectedFile.path === file.path;
              const isKt = file.path.endsWith('.kt');
              const isXml = file.path.endsWith('.xml');
              const isGradle = file.path.endsWith('.kts');

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2 rounded-xl flex items-start gap-2 transition-all ${
                    isSelected
                      ? 'bg-pink-600 text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isSelected ? 'text-white' : isKt ? 'text-pink-400' : isXml ? 'text-amber-400' : 'text-blue-400'
                  }`} />
                  <div className="truncate">
                    <p className="truncate leading-tight">{file.path.split('/').pop()}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-pink-200' : 'text-slate-500'}`}>
                      {file.path}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
            {/* File Info Bar */}
            <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="font-mono text-pink-300 font-semibold">{selectedFile.path}</span>
                <span className="text-slate-500 text-[11px] ml-2">— {selectedFile.description}</span>
              </div>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 font-semibold text-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Output */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200 bg-slate-950/90 select-text">
              <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
            </div>
          </div>
        </div>

        {/* Footer Build Command */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-pink-400 uppercase">CLI Build:</span>
            <code className="bg-slate-900 text-emerald-400 px-2 py-0.5 rounded font-mono text-[11px]">
              ./gradlew assembleDebug
            </code>
          </div>
          <span>Output: app/build/outputs/apk/debug/app-debug.apk</span>
        </div>
      </div>
    </div>
  );
};
