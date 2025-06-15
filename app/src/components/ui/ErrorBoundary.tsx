import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Typography, Alert, Collapse, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // エラーログ出力（開発環境のみ）
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      showDetails: false 
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              エラーが発生しました
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              アプリケーションで予期しないエラーが発生しました。
              <br />
              ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
            </Typography>

            {/* エラー詳細表示トグル */}
            {(error || errorInfo) && (
              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={this.toggleDetails}
                  size="small"
                  sx={{ 
                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {showDetails ? '詳細を非表示' : '詳細を表示'}
                </Typography>
              </Box>
            )}

            {/* エラー詳細 */}
            <Collapse in={showDetails}>
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                {error && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      エラーメッセージ:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        p: 1,
                        borderRadius: 1,
                        wordBreak: 'break-all'
                      }}
                    >
                      {error.message}
                    </Typography>
                  </Box>
                )}
                
                {errorInfo?.componentStack && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      コンポーネントスタック:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        p: 1,
                        borderRadius: 1,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      {errorInfo.componentStack}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Alert>

          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
            >
              再試行
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              ページを再読み込み
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
