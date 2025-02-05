// app/reset-password/page.tsx

"use client";

import React, { Suspense } from "react";
import ResetPassword from "@/components/reset-password"; // Asumiendo que tienes ResetPassword en un archivo separado

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
