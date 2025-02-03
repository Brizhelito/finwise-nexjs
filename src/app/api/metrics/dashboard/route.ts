import { NextResponse } from "next/server";
import { getFinancialMetrics } from "@/utils/metrics";
import {cookies} from "next/headers";
export async function GET() {
  // Obtenemos los parámetros de la URL
  const cookieStore = await cookies();

  const userId = cookieStore.get("x-user-id")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "El parámetro userId es requerido" },
      { status: 400 }
    );
  }

  const userIdNumber = Number(userId);
  if (isNaN(userIdNumber)) {
    return NextResponse.json(
      { error: "El parámetro userId debe ser un número" },
      { status: 400 }
    );
  }

  try {
    const financialMetrics = await getFinancialMetrics(userIdNumber);
    return NextResponse.json(financialMetrics);
  } catch (error) {
    console.error("Error al obtener las métricas financieras:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
