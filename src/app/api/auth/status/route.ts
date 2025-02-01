// app/api/status/route.ts

import { NextRequest } from "next/server";
import { status } from "@/controllers/authController"; // Importa el controlador

export async function GET(req: NextRequest) {
  // Llamamos al controlador status para manejar la solicitud GET
  return status(req);
}
