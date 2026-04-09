import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Avatar, Container, Paper, Checkbox, Button, Stack,
  useTheme, IconButton, Tooltip, CircularProgress, Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { useSession, signOut } from "next-auth/react";
import api from '../api';
import { useNavigate } from 'react-router-dom';

function parseRules(content) {
  if (!content) return [];
  const blocks = content.split(/\n(?=\d+\.\s)/).filter(Boolean);
  return blocks.map((block) => {
    const match = block.match(/^(\d+)\.\s+(.+?)(?:\n)([\s\S]*)$/);
    if (!match) return null;
    return { id: parseInt(match[1], 10), title: match[2].trim(), desc: match[3].trim() };
  }).filter(Boolean);
}

const RulesAcceptance = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: session, status, update } = useSession();

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [agreementLoading, setAgreementLoading] = useState(true);
  const [agreementError, setAgreementError] = useState(null);

  const rules = useMemo(() => parseRules(agreement?.content), [agreement]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { navigate('/'); return; }

    api.get('/agreements/active')
      .then(res => {
        setAgreement(res.data);
        setAgreementLoading(false);

        if (
          session?.user?.acceptedAgreementVersion &&
          session.user.acceptedAgreementVersion === res.data.version
        ) {
          navigate('/dashboard');
        }
      })
      .catch(err => {
        const msg = err.response?.status === 404
          ? t('agreementNotFound')
          : t('agreementError');
        setAgreementError(msg);
        setAgreementLoading(false);
      });
  }, [status, session, navigate, t]);

  const handleContinue = async () => {
    if (!accepted || !agreement) return;
    setSubmitting(true);
    try {
      const res = await api.post('/user/accept-rules');
      await update({ acceptedAgreementVersion: res.data.acceptedVersion });
      navigate('/dashboard');
    } catch (error) {
      console.error("Sözleşme kabul hatası:", error);
      alert(t('agreementError'));
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: 'http://localhost:5173/' });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  if (status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (agreement && session?.user?.acceptedAgreementVersion === agreement.version) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>

      {/* --- HEADER --- */}
      <Paper elevation={0} sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100, borderBottom: '1px solid', borderColor: 'divider', px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
            <SchoolIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('universityName')}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('systemName')}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Change Language">
            <IconButton onClick={toggleLanguage} size="small">
              <LanguageIcon fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>{i18n.language.toUpperCase()}</Typography>
            </IconButton>
          </Tooltip>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Avatar src={session?.user?.image} alt={session?.user?.name || "User"} sx={{ width: 32, height: 32, bgcolor: 'grey.300' }} />
            <Typography variant="body2" fontWeight={500}>{session?.user?.name || "Öğrenci"}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* --- CONTENT --- */}
      <Box sx={{ flexGrow: 1, pt: { xs: '100px', md: '100px' }, pb: { xs: '180px', md: '140px' }, overflowY: 'auto' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, lg: 8 } }}>

          {agreementLoading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 8 }}>
              <CircularProgress />
              <Typography variant="body1" color="text.secondary">{t('agreementLoading')}</Typography>
            </Box>
          )}

          {agreementError && (
            <Alert severity="error" sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>{agreementError}</Alert>
          )}

          {agreement && !agreementLoading && (
            <>
              <Box sx={{ textAlign: 'center', mb: 6, maxWidth: '800px', mx: 'auto' }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '1.75rem', md: '3rem' } }}>
                  {agreement.title}
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, lineHeight: 1.6 }}>
                  {t('rulesSubtitle')}
                </Typography>
              </Box>

              <Stack spacing={4} sx={{ maxWidth: '900px', mx: 'auto' }}>
                {rules.map((rule) => (
                  <Box key={rule.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48, height: 48, flexShrink: 0, borderRadius: '50%',
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1.35rem',
                      }}>
                        {rule.id}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        {rule.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ pl: { xs: 0, sm: '56px' }, color: 'text.secondary', fontSize: '1.125rem', lineHeight: 1.6 }}>
                      {rule.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Typography variant="caption" display="block" align="center" sx={{ mt: 8, color: 'text.disabled' }}>
                {t('footerRights')}
              </Typography>
            </>
          )}
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      {agreement && !agreementLoading && (
        <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, borderTop: '1px solid', borderColor: 'divider', p: { xs: 3, md: 4 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} sx={{ mt: -0.5 }} disabled={submitting} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', cursor: 'pointer' }} onClick={() => !submitting && setAccepted(!accepted)}>{t('iRead')}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>{t('byContinuing')}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2 }}>
                <Button variant="outlined" size="large" color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} disabled={submitting} sx={{ flex: { sm: '0 0 auto' }, borderColor: 'divider', color: 'text.primary' }}>{t('logout')}</Button>
                <Button variant="contained" size="large" fullWidth disabled={!accepted || submitting} onClick={handleContinue} endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />} sx={{ py: 1.5, fontSize: '1rem', boxShadow: accepted ? 4 : 0 }}>{submitting ? "Processing..." : t('continueBtn')}</Button>
              </Box>
            </Box>
          </Container>
        </Paper>
      )}
    </Box>
  );
};

export default RulesAcceptance;
