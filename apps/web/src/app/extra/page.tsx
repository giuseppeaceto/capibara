import MainLayout from "@/components/MainLayout";

export default function ExtraPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <header>
          <h1 className="page-title text-4xl font-semibold">Contenuti Extra</h1>
          <p className="body-text mt-4">
            Contenuti esclusivi riservati ai membri abbonati.
          </p>
        </header>
        <div className="content-box p-8 text-center">
          <p className="body-text">
            Questa sezione è in fase di sviluppo. I contenuti extra saranno disponibili a breve.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

