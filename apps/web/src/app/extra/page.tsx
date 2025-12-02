import MainLayout from "@/components/MainLayout";

export default function ExtraPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-4xl font-semibold text-white">Contenuti Extra</h1>
          <p className="mt-4 text-zinc-400">
            Contenuti esclusivi riservati ai membri abbonati.
          </p>
        </header>
        <div className="rounded-3xl border border-white/10 p-8 text-center">
          <p className="text-zinc-400">
            Questa sezione è in fase di sviluppo. I contenuti extra saranno disponibili a breve.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

