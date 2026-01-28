import React, { useState, useEffect } from 'react'; // Hook'lar eklendi
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Divider, 
  Avatar, 
  IconButton,
  Tooltip
} from '@mui/material';
import WindowIcon from '@mui/icons-material/Window'; 
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles'; // Logo parlaması için
import axios from 'axios'; // Token çekmek için

const Login = () => {
  const { t, i18n } = useTranslation();
  
  // 1. CSRF Token'ı tutacak state
  const [csrfToken, setCsrfToken] = useState('');

  // 2. Sayfa açıldığında Backend'den güvenlik anahtarını al
  useEffect(() => {
    // Vite proxy ayarı sayesinde /api isteği localhost:3000'e gider
    axios.get('/api/auth/csrf')
      .then((response) => {
        if(response.data && response.data.csrfToken) {
           setCsrfToken(response.data.csrfToken);
           console.log("Güvenlik anahtarı alındı.");
        }
      })
      .catch((error) => console.error("CSRF Token alınamadı:", error));
  }, []);

  // Dil değiştirme fonksiyonu
  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 4 },
        position: 'relative'
      }}
    >
      
      {/* Dil Değiştirme Butonu */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <Tooltip title={i18n.language === 'tr' ? "Switch to English" : "Türkçe'ye Geç"}>
            <IconButton onClick={toggleLanguage} color="primary">
                <LanguageIcon />
                <Typography variant="button" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                    {i18n.language.toUpperCase()}
                </Typography>
            </IconButton>
        </Tooltip>
      </Box>

      {/* Login Kartı */}
      <Card
        elevation={0}
        sx={{
          maxWidth: 440,
          width: '100%',
          borderRadius: 3,
          position: 'relative',
          overflow: 'visible', // Logo yukarı taşsın diye visible
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          mt: 4 
        }}
      >
        {/* Üstteki Mavi Çizgi */}
        <Box 
            sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: 6, 
                bgcolor: 'primary.main',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
            }} 
        />

        <CardContent sx={{ p: { xs: 4, sm: 5 }, pt: { xs: 6, sm: 6 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* --- FLOATING LOGO TASARIMI --- */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -8, mb: 1 }}> 
            <Box
                sx={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    border: '4px solid white', 
                    outline: '2px solid',      
                    outlineColor: 'primary.main', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Mavi parlama efekti
                    boxShadow: (theme) => `0px 10px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
                    zIndex: 10
                }}
            >
                 <Avatar 
                    src="https://upload.wikimedia.org/wikipedia/tr/4/4f/T%C3%BCrk_Hava_Kurumu_%C3%9Cniversitesi_logo.png" 
                    alt="THK Logo"
                    sx={{ width: 85, height: 85 }} 
                    imgProps={{ style: { objectFit: 'contain' } }}
                 />
            </Box>
          </Box>

          {/* Başlıklar */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {t('universityName')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', opacity: 0.9, lineHeight: 1.3 }}>
              {t('systemName')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              {t('secureAccess')}
            </Typography>
          </Box>

          {/* Aksiyon Bölümü */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            
            {/* --- GÜNCELLENEN POST FORM --- */}
            <form 
              action="http://localhost:3000/api/auth/signin/azure-ad" 
              method="POST"
            >
                {/* Dashboard'a dönüş linki */}
                <input type="hidden" name="callbackUrl" value="http://localhost:5173/dashboard" />
                
                {/* Güvenlik Anahtarı (Token) */}
                <input type="hidden" name="csrfToken" value={csrfToken} />
                
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={!csrfToken} // Token gelmeden butona basılmasın
                    startIcon={<WindowIcon sx={{ fontSize: 28 }} />}
                    sx={{
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(0, 118, 255, 0.23)',
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    {t('signInMicrosoft')}
                </Button>
            </form>
            {/* ----------------------------- */}

            <Box sx={{ textAlign: 'center' }}>

                <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mb: 1 }}>
                    {t('onlyInstitutional')}
                </Typography>
            </Box>

          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box component="footer" sx={{ mt: 4, textAlign: 'center', px: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('footerRights')}
        </Typography>
      </Box>

    </Box>
  );
};

export default Login;