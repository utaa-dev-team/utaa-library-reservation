import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Avatar, IconButton, Badge, Button,
  Paper, Container, Menu, MenuItem, Divider
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

const NAV_LINKS = [
  { labelKey: 'navDashboard', path: '/dashboard' },
  { labelKey: 'navStudyRooms', path: '/reserve' },
  { labelKey: 'navMyBookings', path: '/bookings' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky', top: 0, zIndex: 1100,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', borderRadius: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Left - Logo */}
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          >
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 2,
              bgcolor: 'action.hover', color: 'primary.main',
            }}>
              <SchoolIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2, display: { xs: 'none', sm: 'block' } }}>
                {t('navUniversity')}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                {t('navSystem')}
              </Typography>
            </Box>
          </Box>

          {/* Center - Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {NAV_LINKS.map(item => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? 'text.primary' : 'text.secondary',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  fontSize: '0.875rem', px: 2,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {t(item.labelKey)}
              </Button>
            ))}
          </Box>

          {/* Right - Notifications + User */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
            <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'action.hover' } }}>
              <Badge variant="dot" sx={{ '& .MuiBadge-badge': { backgroundColor: '#ef4444', border: `2px solid ${theme.palette.background.paper}`, width: 10, height: 10, borderRadius: '50%' } }}>
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: { xs: 1.5, sm: 2.5 }, borderLeft: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, color: 'text.primary' }}>
                  {session?.user?.name}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.2 }}>
                  {t('studentId')}: {session?.user?.studentNumber || '—'}
                </Typography>
              </Box>
              <Avatar
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                src={session?.user?.image}
                alt={session?.user?.name}
                sx={{
                  width: 36, height: 36, cursor: 'pointer',
                  outline: menuAnchor ? `2.5px solid ${theme.palette.primary.main}` : '2.5px solid transparent',
                  outlineOffset: 2,
                  transition: 'outline-color 0.2s ease',
                  '&:hover': { outline: `2.5px solid ${alpha(theme.palette.primary.main, 0.5)}`, outlineOffset: 2 },
                }}
              />
            </Box>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              onClick={() => setMenuAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1, minWidth: 160, borderRadius: '10px', overflow: 'hidden', py: 0.5,
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
                  },
                },
              }}
            >
              <MenuItem onClick={() => navigate('/profile')} sx={{ py: 0.75, px: 2, gap: 1, minHeight: 0 }}>
                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{t('profile')}</Typography>
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')} sx={{ py: 0.75, px: 2, gap: 1, minHeight: 0 }}>
                <SettingsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{t('settings')}</Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={() => signOut({ callbackUrl: 'http://localhost:5173/' })} sx={{ py: 0.75, px: 2, gap: 1, minHeight: 0, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) } }}>
                <LogoutIcon sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'error.main' }}>{t('logout')}</Typography>
              </MenuItem>
            </Menu>
          </Box>

        </Box>
      </Container>
    </Paper>
  );
}
