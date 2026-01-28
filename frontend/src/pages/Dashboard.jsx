import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Backend'den odaları çek
    axios.get('/api/rooms')
      .then(response => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Veri çekme hatası:", err);
        setError("Odalar yüklenirken bir hata oluştu.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'secondary.main', fontWeight: 'bold' }}>
        <MeetingRoomIcon fontSize="large" color="primary" />
        Kütüphane Çalışma Odaları
      </Typography>
      
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} key={room.id}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Typography variant="h6" component="div" color="secondary.main" fontWeight="bold">
                  {room.roomNumber}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {room.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Kapasite: {room.capacity} Kişi
                </Typography>
                
                {/* Özellikleri göster (Wifi, Tahta vb.) */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                  {room.amenities && Object.keys(room.amenities).map((key) => (
                    <Chip key={key} label={key} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;