import { createTheme } from '@mui/material/styles';
import { trTR, enUS } from '@mui/material/locale'; // İngilizce (enUS) eklendi

// 1. Tasarım Ayarları (Dil bağımsız)
// Renkler, fontlar ve bileşen stilleri burada tanımlanır.
const themeOptions = {
  palette: {
    // Birincil Renk (Kurumsal Açık Mavi)
    primary: {
      main: '#4A90E2', 
      contrastText: '#ffffff',
    },
    // İkincil Renk (Koyu Lacivert)
    secondary: {
      main: '#1F3A52',
      contrastText: '#ffffff',
    },
    // Arka Plan Renkleri
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    // Metin Renkleri
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
    // Durum Renkleri
    success: {
      main: '#2ECC71',
      contrastText: '#ffffff',
    },
    error: {
      main: '#34495E',
    },
    warning: {
      main: '#95A5A6',
    },
    // Özel Renkler
    action: {
      hover: '#E3F2FD',
      selected: '#E3F2FD',
    },
  },
  
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { color: '#1F3A52', fontWeight: 600 },
    h2: { color: '#1F3A52', fontWeight: 600 },
    h3: { color: '#1F3A52', fontWeight: 600 },
    h4: { color: '#1F3A52', fontWeight: 600 },
    h5: { color: '#1F3A52', fontWeight: 500 },
    h6: { color: '#1F3A52', fontWeight: 500 },
    subtitle1: { color: '#2C3E50' },
    subtitle2: { color: '#7F8C8D' },
    body1: { color: '#2C3E50' },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#4A90E2',
          '&:hover': {
            backgroundColor: '#357ABD',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E3F2FD',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: '#E3F2FD',
            borderLeft: '4px solid #4A90E2',
            '&:hover': {
              backgroundColor: '#BBDEFB',
            },
          },
          '&:hover': {
            backgroundColor: '#F1F8FF',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#E3F2FD',
          color: '#1F3A52',
          border: '1px solid #90CAF9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F3A52',
          color: '#ffffff',
        },
      },
    },
  },
};

// 2. Tema Oluşturucu Fonksiyon
// Bu fonksiyon, istenen dili parametre olarak alır ve ona uygun temayı döner.
// language parametresi 'tr' veya 'en' olabilir.
export const getAppTheme = (language = 'tr') => {
  const selectedLocale = language === 'en' ? enUS : trTR;
  
  return createTheme(themeOptions, selectedLocale);
};

// Varsayılan olarak Türkçe temayı dışarı aktarır (Eski kodun bozulmaması için)
const theme = getAppTheme('tr');
export default theme;