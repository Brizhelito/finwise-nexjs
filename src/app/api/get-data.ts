// pages/api/get-data.ts
import type { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Definir el objeto JSON que quieres devolver
  const data = {
    message: "Hola desde Next.js!",
    success: true,
    data: {
      id: 1,
      name: "Usuario de prueba",
    },
  };

  // Enviar la respuesta con el JSON
  res.status(200).json(data);
};

export default handler;
