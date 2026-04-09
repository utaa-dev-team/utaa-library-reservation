import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { checkRulesAcceptance } from "@/middleware/checkRulesAcceptance";

const DEFAULT_MIN = 2;
const DEFAULT_MAX = 7;
const EXCLUDED_STATUSES = ["CANCELLED", "NO_SHOW"];

export async function POST(request) {
  const rulesCheck = await checkRulesAcceptance(request);
  if (rulesCheck) return rulesCheck;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { roomId, reservationDate, startTime, endTime, purpose, participantEmails = [] } = body;

    if (!roomId || !reservationDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Eksik alanlar var." }, { status: 400 });
    }

    const creator = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });
    if (!creator) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const cleanedEmails = [...new Set(
      participantEmails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e && e !== creator.email.toLowerCase())
    )];

    // --- Kural kontrolu ---
    const rulesRows = await prisma.reservationRule.findMany({
      where: {
        isActive: true,
        ruleName: { in: ["MIN_PARTICIPANTS", "MAX_PARTICIPANTS"] },
      },
      select: { ruleName: true, ruleValue: true },
    });
    const rulesMap = Object.fromEntries(rulesRows.map((r) => [r.ruleName, r.ruleValue]));
    const minP = rulesMap.MIN_PARTICIPANTS?.value ?? DEFAULT_MIN;
    const maxP = rulesMap.MAX_PARTICIPANTS?.value ?? DEFAULT_MAX;

    const totalParticipants = cleanedEmails.length + 1;
    if (totalParticipants < minP || totalParticipants > maxP) {
      return NextResponse.json(
        { error: `Toplam katılımcı sayısı ${minP} ile ${maxP} arasında olmalıdır. Şu an: ${totalParticipants}` },
        { status: 400 }
      );
    }

    // --- E-posta dogrulama ---
    if (cleanedEmails.length > 0) {
      const foundUsers = await prisma.user.findMany({
        where: { email: { in: cleanedEmails } },
        select: { id: true, email: true },
      });

      const foundSet = new Set(foundUsers.map((u) => u.email.toLowerCase()));
      const missingEmails = cleanedEmails.filter((e) => !foundSet.has(e));

      if (missingEmails.length > 0) {
        return NextResponse.json(
          { error: "Şu e-postalar sisteme kayıtlı değil", missingEmails },
          { status: 400 }
        );
      }

      // --- Cakisma kontrolu (odanin o tarih/saatte baska rezervasyonu var mi) ---
      const dateObj = new Date(reservationDate + "T00:00:00Z");
      const startObj = new Date(`1970-01-01T${startTime}:00Z`);
      const endObj = new Date(`1970-01-01T${endTime}:00Z`);

      const overlapping = await prisma.reservation.findFirst({
        where: {
          roomId,
          reservationDate: dateObj,
          status: { notIn: EXCLUDED_STATUSES },
          AND: [
            { startTime: { lt: endObj } },
            { endTime: { gt: startObj } },
          ],
        },
        select: { id: true },
      });

      if (overlapping) {
        return NextResponse.json(
          { error: "Bu oda seçilen tarih ve saat aralığında zaten rezerve edilmiş." },
          { status: 409 }
        );
      }

      // --- Olustur ---
      const participantUsers = foundUsers;

      const reservation = await prisma.reservation.create({
        data: {
          roomId,
          userId: creator.id,
          reservationDate: dateObj,
          startTime: startObj,
          endTime: endObj,
          purpose: purpose || null,
          status: "PENDING",
          participants: {
            create: participantUsers.map((u) => ({
              userId: u.id,
              status: "PENDING",
            })),
          },
        },
        include: {
          room: { select: { roomNumber: true, name: true } },
          participants: {
            include: { user: { select: { email: true, fullName: true } } },
          },
        },
      });

      return NextResponse.json(reservation, { status: 201 });
    }

    // Katilimci yoksa (sadece kurallar izin veriyorsa, min=1 gibi)
    const dateObj = new Date(reservationDate + "T00:00:00Z");
    const startObj = new Date(`1970-01-01T${startTime}:00Z`);
    const endObj = new Date(`1970-01-01T${endTime}:00Z`);

    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId,
        reservationDate: dateObj,
        status: { notIn: EXCLUDED_STATUSES },
        AND: [
          { startTime: { lt: endObj } },
          { endTime: { gt: startObj } },
        ],
      },
      select: { id: true },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Bu oda seçilen tarih ve saat aralığında zaten rezerve edilmiş." },
        { status: 409 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        userId: creator.id,
        reservationDate: dateObj,
        startTime: startObj,
        endTime: endObj,
        purpose: purpose || null,
        status: "PENDING",
      },
      include: {
        room: { select: { roomNumber: true, name: true } },
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Reservation create error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET() {
  const rulesCheck = await checkRulesAcceptance();
  if (rulesCheck) return rulesCheck;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      include: {
        room: { select: { roomNumber: true, name: true } },
        participants: {
          include: { user: { select: { email: true, fullName: true } } },
        },
      },
      orderBy: { reservationDate: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Reservations fetch error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
