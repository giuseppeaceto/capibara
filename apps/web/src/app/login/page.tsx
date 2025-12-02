"use client";

import MainLayout from "@/components/MainLayout";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    void signIn("google", { callbackUrl: "/" });
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center gap-8 py-16">
        <div className="space-y-3 text-center max-w-xl">
          <h1 className="login-title">Accedi a Capibara</h1>
          <p className="login-description">
            Entra con il tuo account Google per salvare preferiti, gestire
            l&apos;abbonamento e accedere ai contenuti riservati.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100"
        >
          Continua con Google
        </button>

        <p className="text-xs text-zinc-500 max-w-sm text-center">
          Cliccando su &quot;Continua con Google&quot; accetti i nostri Termini
          di servizio e l&apos;Informativa sulla privacy.
        </p>
      </div>
    </MainLayout>
  );
}



