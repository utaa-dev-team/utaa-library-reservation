import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Çeviri metinleri
const resources = {
  en: {
    translation: {
      universityName: "University of Turkish Aeronautical Association",
      systemName: "Library Study Room Reservation System",
      secureAccess: "Secure access with Microsoft account",
      signInMicrosoft: "Sign in with Microsoft",
      onlyInstitutional: "Only institutional Microsoft accounts are allowed.",
      dataProtected: "Your data is protected.",
      footerRights: "© 2026 University of Turkish Aeronautical Association. All rights reserved.",
      loginTitle: "Login"
    }
  },
  tr: {
    translation: {
      universityName: "Türk Hava Kurumu Üniversitesi",
      systemName: "Kütüphane Çalışma Odası Rezervasyon Sistemi",
      secureAccess: "Microsoft hesabı ile güvenli erişim",
      signInMicrosoft: "Microsoft ile Giriş Yap",
      onlyInstitutional: "Sadece kurumsal Microsoft hesaplarına izin verilir.",
      dataProtected: "Verileriniz koruma altındadır.",
      footerRights: "© 2026 Türk Hava Kurumu Üniversitesi. Tüm hakları saklıdır.",
      loginTitle: "Giriş Yap"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "tr", // Varsayılan dil Türkçe
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;