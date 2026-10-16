import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handlePopState = this.handlePopState.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Check for dynamic import failure / stale chunk after new deployments
    const errorMsg = (error?.message || '').toLowerCase();
    const isChunkError = 
      error?.name === 'ChunkLoadError' ||
      errorMsg.includes('dynamically imported module') ||
      errorMsg.includes('loading chunk') ||
      errorMsg.includes('failed to fetch') ||
      errorMsg.includes('importing a module script failed');

    if (isChunkError && typeof window !== 'undefined') {
      const lastReload = sessionStorage.getItem('chunk_reload_ts');
      const now = Date.now();
      // Only auto-reload if we haven't done so in the past 10 seconds
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('chunk_reload_ts', String(now));
        window.location.reload();
        return { hasError: false, error: null };
      }
    }

    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidMount() {
    // When user navigates back or forward with browser buttons, reset error state
    window.addEventListener('popstate', this.handlePopState);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  componentDidUpdate(prevProps) {
    // If location or key prop changed (route transition), reset error
    if (this.state.hasError && this.props.locationKey !== prevProps.locationKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handlePopState() {
    if (this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          textAlign: 'center',
          padding: '2rem',
          background: '#f8fafc'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            padding: '2.5rem 2rem',
            maxWidth: '480px',
            width: '100%'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '28px'
            }}>
              ⚠️
            </div>
            <h1 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              We're sorry, but the application encountered an unexpected issue while loading this page.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.7rem 1.4rem',
                  fontSize: '0.95rem',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
                }}
              >
                Refresh Page
              </button>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/';
                  }
                }}
                style={{
                  padding: '0.7rem 1.4rem',
                  fontSize: '0.95rem',
                  backgroundColor: '#fff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
