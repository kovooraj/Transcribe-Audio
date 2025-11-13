
import React, { useState, useCallback } from 'react';
import { InputPanel } from './components/InputPanel';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { generateTranscript } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleTranscribe = useCallback(async (media: File | string) => {
    setIsLoading(true);
    setTranscript('');
    setError('');

    if (typeof media === 'string') {
      setError('Transcription from a URL is not supported. Please download the media and upload the file directly.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateTranscript(media);
      setTranscript(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Transcription failed: ${e.message}`);
      } else {
        setError('An unknown error occurred during transcription.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 font-sans text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            AI Media Transcriber
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Get instant, AI-powered transcripts from any audio or video source.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:order-1">
            <InputPanel isLoading={isLoading} onTranscribe={handleTranscribe} />
          </div>
          <div className="lg:order-2">
            <TranscriptDisplay
              isLoading={isLoading}
              transcript={transcript}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
