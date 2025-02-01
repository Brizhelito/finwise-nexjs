import { login } from "@/controllers/authController"; // Ajusta la ruta según corresponda
import { NextRequest } from "next/server";
export const POST = async (req: NextRequest) => {
  return login(req);
};
