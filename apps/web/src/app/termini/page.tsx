import MainLayout from "@/components/MainLayout";

export default function TerminiPage() {
  return (
    <MainLayout>
      <div className="space-y-10">
        <section className="space-y-4">
          <p className="eyebrow eyebrow--page">Termini di utilizzo</p>
          <h1 className="page-title text-3xl font-semibold">
            Condizioni d&apos;uso del sito e dei contenuti
          </h1>
          <p className="body-text-sm max-w-3xl">
            Qui trovi le regole di base per usare Capibara in modo corretto e
            rispettoso. Il linguaggio è volutamente semplice: vogliamo che i
            termini siano comprensibili, non nascosti in gergo legale.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="page-heading text-xl font-semibold">Uso personale</h2>
          <p className="body-text-sm">
            Puoi usare il sito e i contenuti per informarti, studiare, discutere
            e condividere link sui tuoi canali. Non è consentito rivendere o
            ripubblicare sistematicamente i contenuti di Capibara come se fossero
            un tuo prodotto editoriale.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="page-heading text-xl font-semibold">
            Contenuti accessibili solo agli abbonati
          </h2>
          <p className="body-text-sm">
            Alcuni contenuti (articoli, newsletter, podcast o video) sono
            riservati a chi ha un abbonamento attivo. Condividere occasionalmente
            un estratto va bene; condividere in massa PDF, testi integrali o
            registrazioni private con persone non abbonate significa indebolire
            il progetto che stai sostenendo.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="page-heading text-xl font-semibold">
            Comportamenti non ammessi
          </h2>
          <ul className="body-text-sm space-y-2">
            <li>• Tentare di forzare i sistemi di accesso o aggirare i paywall.</li>
            <li>• Usare Capibara per attività illegali, discriminatorie o di odio.</li>
            <li>• Spacciare per propri i nostri contenuti o il nostro marchio.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="page-heading text-xl font-semibold">Limitazioni di responsabilità</h2>
          <p className="body-text-sm">
            Lavoriamo per offrire informazioni accurate e verificate, ma errori e
            imprecisioni possono capitare. Ti invitiamo sempre a usare spirito
            critico e, quando prendi decisioni importanti, a confrontare più
            fonti. Possiamo aggiornare o rimuovere contenuti senza preavviso se
            li riteniamo non più corretti o adeguati.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="page-heading text-xl font-semibold">Modifiche ai termini</h2>
          <p className="body-text-sm">
            Potremmo aggiornare questi termini man mano che il progetto cresce o
            cambia forma. Quando le modifiche saranno rilevanti, lo segnaleremo
            sul sito o nelle newsletter principali.
          </p>
          <p className="text-xs text-zinc-500">
            Ultimo aggiornamento: {new Date().getFullYear()}
          </p>
        </section>
      </div>
    </MainLayout>
  );
}


