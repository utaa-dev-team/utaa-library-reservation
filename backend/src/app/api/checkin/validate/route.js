import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import redis from "@/lib/redis";

const TOLERANCE_MINUTES = 15;
const REDIS_KEY = "kiosk:current_token";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
  }

  try {
    const currentToken = await redis.get(REDIS_KEY);
    if (!currentToken || currentToken !== token) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş QR kod." },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentUserId = session.user.id;

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const winStartMinutes = Math.max(0, nowTotalMinutes - TOLERANCE_MINUTES);
    const winEndMinutes = Math.min(24 * 60 - 1, nowTotalMinutes + TOLERANCE_MINUTES);

    const windowStart = new Date(Date.UTC(1970, 0, 1,
      Math.floor(winStartMinutes / 60), winStartMinutes % 60, 0));
    const windowEnd = new Date(Date.UTC(1970, 0, 1,
      Math.floor(winEndMinutes / 60), winEndMinutes % 60, 59));

    const reservation = await prisma.reservation.findFirst({
      where: {
        reservationDate: todayStart,
        status: "CONFIRMED",
        startTime: { gte: windowStart, lte: windowEnd },
        OR: [
          { userId: currentUserId },
          {
            participants: {
              some: { userId: currentUserId, status: "ACCEPTED" },
            },
          },
        ],
      },
      include: {
        room: { select: { id: true, roomNumber: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Şu an için başlayan aktif bir rezervasyonunuz bulunamadı." },
        { status: 404 }
      );
    }

    const startHour = new Date(reservation.startTime).getUTCHours();
    const startMin = new Date(reservation.startTime).getUTCMinutes();
    const endHour = new Date(reservation.endTime).getUTCHours();
    const endMin = new Date(reservation.endTime).getUTCMinutes();

    const fmtTime = (h, m) =>
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    const startTimeStr = fmtTime(startHour, startMin);
    const endTimeStr = fmtTime(endHour, endMin);

    const reservationStartMinutes = startHour * 60 + startMin;
    const isEarly = reservationStartMinutes > nowTotalMinutes;

    const response = {
      success: true,
      reservationId: reservation.id,
      room: reservation.room,
      startTime: startTimeStr,
      endTime: endTimeStr,
      isEarly,
    };

    if (isEarly) {
      response.warningMessage =
        `Girişiniz onaylandı! Ancak odanız saat ${startTimeStr}'a kadar dolu olabilir. Lütfen saatiniz gelene kadar bekleyiniz.`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check-in validate error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
