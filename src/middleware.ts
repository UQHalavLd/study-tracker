import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Root middleware invocation error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki path'ler HARİÇ tüm istekleri eşleştir:
     * - _next/static (statik dosyalar)
     * - _next/image (görsel optimizasyonu)
     * - favicon.ico (favicon dosyası)
     * - public klasöründeki dosyalar
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
