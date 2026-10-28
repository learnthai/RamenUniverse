import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }



  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in app:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('ramen_desu_v4');
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--cream, #FAF6EE)',
          color: 'var(--ink, #2A2218)',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍜</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            頁面載入遇到問題
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(42,34,24,0.6)', maxWidth: '300px', marginBottom: '24px', lineHeight: 1.5 }}>
            畫面暫時無法顯示，請點擊下方按鈕重新整理。
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                borderRadius: '100px',
                border: '1.5px solid var(--ink, #2A2218)',
                background: 'var(--red, #E8442A)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '2px 3px 0 1px var(--ink, #2A2218)'
              }}
            >
              重新整理
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: '100px',
                border: '1.5px solid var(--ink, #2A2218)',
                background: '#fff',
                color: 'var(--ink, #2A2218)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '2px 3px 0 1px var(--ink, #2A2218)'
              }}
            >
              重置快取
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
