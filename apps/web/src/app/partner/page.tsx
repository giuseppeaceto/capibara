import MainLayout from "@/components/MainLayout";

export default function PartnerPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-4xl font-semibold text-white">Partner</h1>
          <p className="mt-4 text-zinc-400">
            Scopri i nostri partner e sponsor che supportano Capibara.
          </p>
        </header>
        <div className="rounded-3xl border border-white/10 p-8 text-center">
          <p className="text-zinc-400">
            Questa sezione è in fase di sviluppo. Le informazioni sui partner saranno disponibili a breve.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

