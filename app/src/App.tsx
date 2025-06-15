import { Suspense, lazy } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Layout } from './components/ui/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { theme } from './utils/theme';

// Lazy loading for Dashboard component
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
