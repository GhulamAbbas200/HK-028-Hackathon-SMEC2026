
import React, { useState, useCallback } from 'react';
import { fetchLyricsAndAnalyze } from './services/geminiService.ts';
import { AnalysisResult } from './types.ts';
import WordCloud from './components/WordCloud.tsx';

const App: React.FC = () => {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song.trim() || !artist.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchLyricsAndAnalyze(song, artist);
      setResult(data);
      setHistory(prev => {
        const filtered = prev.filter(h => h.metadata.title.toLowerCase() !== data.metadata.title.toLowerCase());
        return [data, ...filtered.slice(0, 7)];
      });
      setSong('');
      setArtist('');
    } catch (err: any) {
      console.error("Search Error:", err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  }, [song, artist]);

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="gradient-text" style={{fontSize: '3.5rem', marginBottom: '1rem'}}>
          LyricalCloud
        </h1>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>
          Visualize the soul of music. Enter any song to map its thematic landscape.
        </p>
      </header>

      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-group">
            <i className="fas fa-compact-disc"></i>
            <input
              type="text"
              placeholder="Song Title (e.g. Believer)"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <i className="fas fa-user-astronaut"></i>
            <input
              type="text"
              placeholder="Artist (e.g. Imagine Dragons)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Analyze Song'}
          </button>
        </form>
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}
      </section>

      {loading && (
        <div className="loader fade-in">
          <div className="spinner"></div>
          <p style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>Synthesizing poetic data...</p>
        </div>
      )}

      {result && !loading && (
        <main className="results-grid fade-in">
          <div className="card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h2 style={{fontSize: '2rem', color: 'white'}}>{result.metadata.title}</h2>
                <p style={{color: 'var(--accent-color)', fontWeight: '600'}}>by {result.metadata.artist}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <span className="stat-label">Release</span>
                <span className="stat-value">{result.metadata.year || 'N/A'}</span>
              </div>
            </div>

            <WordCloud words={result.wordFrequencies} />

            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Primary Mood</span>
                <span className="stat-value">{result.metadata.mood || 'Vibrant'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Main Theme</span>
                <span className="stat-value">{result.metadata.theme || 'Abstract'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Vocabulary</span>
                <span className="stat-value">{result.wordFrequencies.length} Unique</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lyrics Size</span>
                <span className="stat-value">{result.metadata.lyrics.length} Chars</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <i className="fas fa-scroll" style={{color: 'var(--accent-color)'}}></i>
              Analyzed Content
            </h3>
            <div className="lyrics-box">
              {result.metadata.lyrics}
            </div>
          </div>
        </main>
      )}

      {!result && !loading && (
        <div className="empty-state">
          <i className="fas fa-waveform"></i>
          <p style={{fontSize: '1.5rem', fontWeight: '300'}}>Ready to parse your next earworm.</p>
        </div>
      )}

      {history.length > 0 && (
        <section className="history-section fade-in">
          <h3 style={{color: 'var(--text-muted)', marginBottom: '1rem'}}>Recently Analyzed</h3>
          <div className="history-grid">
            {history.map((item, idx) => (
              <button key={idx} className="history-card" onClick={() => setResult(item)}>
                <p style={{fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.metadata.title}</p>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{item.metadata.artist}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer style={{marginTop: '100px', paddingBottom: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
        <p>Built with Gemini 3 Flash & D3 Visualization Studio</p>
      </footer>
    </div>
  );
};

export default App;
