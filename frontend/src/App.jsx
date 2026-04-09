import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useSession } from 'next-auth/react';
import Login from './pages/Login';     
import Dashboard from './pages/Dashboard'; 
import RulesAcceptance from './pages/RulesAcceptance';
import StudyRooms from './pages/StudyRooms';
import ReserveForm from './pages/ReserveForm';
import Profile from './pages/Profile';

function App() {
  const { update } = useSession();
  const navigate = useNavigate();

  // ✅ Global event listener: API'den "kurallar kabul edilmemiş" hatası gelirse
  useEffect(() => {
    const handleRulesRejected = async () => {
      console.warn("⚠️ Kurallar kabul edilmemiş, yönlendiriliyor...");
      
      // Session'ı güncelle
      await update({ acceptedAgreementVersion: null });
      
      // Rules sayfasına yönlendir
      navigate('/rules');
    };

    window.addEventListener('rulesRejected', handleRulesRejected);

    return () => {
      window.removeEventListener('rulesRejected', handleRulesRejected);
    };
  }, [update, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/rules" element={<RulesAcceptance />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reserve" element={<StudyRooms />} />
      <Route path="/reserve/new" element={<ReserveForm />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
