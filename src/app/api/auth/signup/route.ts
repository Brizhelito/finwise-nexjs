// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { register } from "@/controllers/authController"; // Ajusta la ruta según corresponda

export const POST = async (req: NextRequest) => {
  return register(req);
};
