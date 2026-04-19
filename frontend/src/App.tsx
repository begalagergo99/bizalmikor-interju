import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './app/theme';
import { AppRouter } from './app/Router';
import { GlobalSnackbar } from './shared/components/GlobalSnackbar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      <GlobalSnackbar />
    </ThemeProvider>
  );
}

export default App;
