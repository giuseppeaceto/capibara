import MainLayout from "@/components/MainLayout";

export default function PartnerPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <header>
          <h1 className="page-title text-4xl font-semibold">Partner</h1>
          <p className="body-text mt-4">
            Scopri i nostri partner e sponsor che supportano Capibara.
          </p>
        </header>
        <div className="content-box p-8 text-center">
          <p className="body-text">
            Questa sezione è in fase di sviluppo. Le informazioni sui partner saranno disponibili a breve.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

