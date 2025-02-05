// app/activate-account/page.tsx

"use client";

import React, { Suspense } from "react";
import ActivateAccount from "@/components/activate-account"; // Asumiendo que tienes ResetPassword en un archivo separado

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivateAccount />
    </Suspense>
  );
}
