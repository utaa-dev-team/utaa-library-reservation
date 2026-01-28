import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/db";

export const authOptions = {
  debug: true,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: { 
        params: {
            scope: "openid profile email User.Read",
            prompt: "login",
        }, 
    },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔵 Microsoft'tan gelen kullanıcı verisi:", user.email); // User objesini komple yazdırma, logları kirletmesin

      if (!user?.email) {
        console.error("❌ HATA: Kullanıcının emaili gelmedi!");
        return false;
      }

      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            lastLoginAt: new Date(),
            // Resmi sadece veritabanına kaydediyoruz
            avatarUrl: user.image || null, 
            fullName: user.name || "İsimsiz Kullanıcı", 
          },
          create: {
            email: user.email,
            fullName: user.name || "İsimsiz Kullanıcı",
            avatarUrl: user.image || null,
            role: "STUDENT",
            isActive: true,
            lastLoginAt: new Date(),
          },
        });

        console.log("✅ Veritabanı işlemi başarılı.");
        return true; 
      } catch (error) {
        console.error("❌ KRİTİK HATA (Veritabanı):", error);
        return false; 
      }
    },

    // 👇 EKLENEN KISIM: JWT Callback
    async jwt({ token, user, trigger, session }) {
      // Kullanıcı ilk kez giriş yaptığında 'user' dolu gelir
      if (user) {
        // Resim verisi çok büyük olduğu için token'dan siliyoruz!
        // Zaten veritabanında var, session callback'te oradan çekeceğiz.
        delete token.picture; 
        delete token.image;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        // Kullanıcı verisini veritabanından taze çekiyoruz
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true, studentNumber: true, avatarUrl: true } // Sadece gerekenleri çek
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.studentNumber = dbUser.studentNumber;
          // Frontend'de resmi göstermek için veritabanındaki veriyi kullan
          session.user.image = dbUser.avatarUrl; 
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };