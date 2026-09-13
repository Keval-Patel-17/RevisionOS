import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Sparkles } from 'lucide-react';
import { DocumentMetadata } from '../../types';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  metadata: DocumentMetadata | null;
  onRemoveFile: () => void;
  isLoading: boolean;
  onProceed: () => void;
  onTryDemo: () => void;
  isDemoLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelected,
  metadata,
  onRemoveFile,
  isLoading,
  onProceed,
  onTryDemo,
  isDemoLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!metadata ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 bg-white ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/40 shadow-md scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70 shadow-xs'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-xs group-hover:scale-105 transition-transform">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {isLoading ? 'Extracting Lecture Material...' : 'Drop lecture files here or browse'}
          </h3>
          <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
            Upload course slides, syllabus, or lecture notes. RevisionOS extracts grounded concepts and constructs your study pack.
          </p>

          {/* Formats badges */}
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-600 mb-6">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono font-semibold text-rose-700">PDF</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono font-semibold text-blue-700">DOCX</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono font-semibold text-amber-700">PPTX</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono font-semibold text-purple-700">TXT</span>
            <span className="text-slate-500 text-[11px] ml-1">Up to 25MB</span>
          </div>

          {/* Try Demo Shortcut */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-3">
            <span className="text-xs text-slate-500">No lecture file on hand?</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTryDemo();
              }}
              disabled={isDemoLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isDemoLoading ? 'Loading Sample...' : 'Try Demo: CPU Scheduling (16 Pages)'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Uploaded File Review Card */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-base tracking-tight">{metadata.filename}</h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {metadata.file_type}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                  <span>{formatBytes(metadata.file_size_bytes)}</span>
                  <span>&bull;</span>
                  <span>{metadata.page_count} {metadata.file_type === 'PPTX' ? 'slides' : 'pages/sections'}</span>
                  <span>&bull;</span>
                  <span>{metadata.char_count.toLocaleString()} characters analyzed</span>
                </div>
              </div>
            </div>

            <button
              onClick={onRemoveFile}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove File"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Text preview snippet */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 font-mono line-clamp-2">
            <span className="text-slate-500 uppercase font-sans text-[10px] font-bold block mb-1">Source Preview</span>
            "{metadata.extracted_preview}"
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              onClick={onRemoveFile}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Choose Different File
            </button>
            <button
              onClick={onProceed}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2"
            >
              <span>Set Preferences & Generate</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
