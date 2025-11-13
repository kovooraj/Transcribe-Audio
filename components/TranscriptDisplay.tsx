
import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';
import { CopyIcon, DownloadIcon } from './icons';

interface TranscriptDisplayProps {
  isLoading: boolean;
  transcript: string;
  error: string;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ isLoading, transcript, error }) => {
  const [copySuccess, setCopySuccess] = useState<string>('');

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript).then(
      () => setCopySuccess('Copied!'),
      () => setCopySuccess('Failed to copy')
    );
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'transcript.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Spinner />
          <p className="mt-4 text-lg">Generating transcript...</p>
          <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400">
          <p>{error}</p>
        </div>
      );
    }

    if (transcript) {
        const formattedTranscript = transcript.split('\n').map((line, index) => {
            if (line.match(/^Speaker [A-Z0-9]:/i)) {
                return (
                    <p key={index} className="mb-2">
                        <span className="font-bold text-purple-300">{line.split(':')[0]}:</span>
                        <span>{line.substring(line.indexOf(':') + 1)}</span>
                    </p>
                );
            }
            return <p key={index} className="mb-2">{line}</p>
        });

      return (
          <div className="font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
            {formattedTranscript}
          </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="w-16 h-16 bg-gray-700 rounded-lg mb-4"></div>
        <p className="text-lg font-medium">Your transcript will appear here</p>
        <p className="text-sm">Upload a file or paste a URL to get started.</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 h-full flex flex-col border border-gray-700 min-h-[400px] lg:min-h-0">
      <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
        <h2 className="text-xl font-bold text-gray-200">Transcript</h2>
        {transcript && !isLoading && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              title="Copy to clipboard"
            >
              <CopyIcon />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              title="Download .txt"
            >
              <DownloadIcon />
            </button>
            {copySuccess && <span className="text-sm text-purple-400">{copySuccess}</span>}
          </div>
        )}
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};
