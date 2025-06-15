import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // エラーログの出力（実際のプロダクションではエラー監視サービスに送信）
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={this.handleReload}>
              ページを再読み込み
            </Button>
            <Button variant="outlined" onClick={this.handleRetry}>
              再試行
            </Button>
          </Box>

          {import.meta.env.DEV && this.state.error && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                maxWidth: 800,
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                開発環境のエラー詳細:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {this.state.error.stack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
