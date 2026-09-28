import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#14b8a6', dark: '#0d9488', contrastText: '#000000' },
    secondary: { main: '#111111' },
    text: { primary: '#111111', secondary: '#555555' },
    background: { default: '#fafafa', paper: '#ffffff' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
})
