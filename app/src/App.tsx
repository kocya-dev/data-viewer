import { ThemeProvider, CssBaseline } from '@mui/material';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { theme } from './utils/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Layout>
          <Dashboard />
        </Layout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
