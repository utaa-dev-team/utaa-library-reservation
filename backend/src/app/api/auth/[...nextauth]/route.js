import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import prisma from "@/lib/db";

const STUDENT_EMAIL_REGEX = /^s(\d+)@stu\.thk\.edu\.tr$/i;

function extractStudentNumber(email) {
  const match = email?.match(STUDENT_EMAIL_REGEX);
  return match ? match[1] : null;
}

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
    async signIn({ user }) {
      if (!user?.email) {
        console.error("❌ HATA: Kullanıcının emaili gelmedi!");
        return false;
      }

      try {
        const studentNumber = extractStudentNumber(user.email);

        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            lastLoginAt: new Date(),
            avatarUrl: user.image || null,
            fullName: user.name || "İsimsiz Kullanıcı",
            ...(studentNumber && { studentNumber }),
          },
          create: {
            email: user.email,
            fullName: user.name || "İsimsiz Kullanıcı",
            avatarUrl: user.image || null,
            studentNumber,
            role: "STUDENT",
            isActive: true,
            lastLoginAt: new Date(),
          },
        });

        return true;
      } catch (error) {
        console.error("❌ KRİTİK HATA (Veritabanı):", error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            role: true,
            studentNumber: true,
            avatarUrl: true,
            acceptedAgreementVersion: true,
          },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.studentNumber = dbUser.studentNumber;
          token.avatarUrl = dbUser.avatarUrl;
          token.acceptedAgreementVersion = dbUser.acceptedAgreementVersion;
        }

        delete token.picture;
        delete token.image;
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.studentNumber = token.studentNumber;
        session.user.image = token.avatarUrl;
        session.user.acceptedAgreementVersion = token.acceptedAgreementVersion;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      const allowedFrontend = "http://localhost:5173";
      if (url.startsWith(allowedFrontend)) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
