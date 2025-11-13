
import React, { useState, useRef } from 'react';
import type { InputType } from '../types';
import { UploadIcon, LinkIcon } from './icons';

interface InputPanelProps {
  isLoading: boolean;
  onTranscribe: (media: File | string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ isLoading, onTranscribe }) => {
  const [inputType, setInputType] = useState<InputType>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleTranscribeClick = () => {
    if (isLoading) return;
    if (inputType === 'upload' && file) {
      onTranscribe(file);
    } else if (inputType === 'url' && url.trim()) {
      onTranscribe(url.trim());
    }
  };
  
  const isTranscribeDisabled = isLoading || (inputType === 'upload' && !file) || (inputType === 'url' && !url.trim());

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 h-full flex flex-col border border-gray-700">
      <div className="flex border-b border-gray-700 mb-6">
        <TabButton
          label="Upload File"
          icon={<UploadIcon />}
          isActive={inputType === 'upload'}
          onClick={() => setInputType('upload')}
        />
        <TabButton
          label="Paste URL"
          icon={<LinkIcon />}
          isActive={inputType === 'url'}
          onClick={() => setInputType('url')}
        />
      </div>

      <div className="flex-grow">
        {inputType === 'upload' ? (
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center flex flex-col items-center justify-center h-full cursor-pointer hover:border-purple-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="audio/*,video/*"
            />
            <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
            {file ? (
              <p className="text-purple-300">{file.name}</p>
            ) : (
              <>
                <p className="font-semibold text-gray-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Audio or Video (MP3, WAV, MP4, etc.)
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-400 mb-2">
              Media URL
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/media.mp4"
              className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleTranscribeClick}
        disabled={isTranscribeDisabled}
        className="w-full mt-6 py-3 px-4 text-lg font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center"
      >
        {isLoading ? 'Transcribing...' : 'Transcribe'}
      </button>
    </div>
  );
};

interface TabButtonProps {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
        isActive
            ? 'border-purple-400 text-purple-300'
            : 'border-transparent text-gray-500 hover:text-gray-300'
        }`}
    >
        {icon}
        {label}
    </button>
)
