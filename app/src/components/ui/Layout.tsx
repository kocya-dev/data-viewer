import type { ReactNode } from 'react';
import { AppBar, Box, Container, Toolbar, Typography, useTheme } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: '1024px', // 最小幅を追加
        overflowX: 'auto', // 横スクロールを有効化
      }}
    >
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <BarChartIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
            }}
          >
            GitHub Organization 課金可視化
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.grey[50],
          py: 3,
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: '1024px',
            minWidth: '1024px', // 最小幅を追加
            margin: '0 auto',
            px: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          bgcolor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: '1024px',
            margin: '0 auto',
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 GitHub Organization Cost Visualization App
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export { Layout };
