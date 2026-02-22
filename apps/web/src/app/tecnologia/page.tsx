import type { Metadata } from "next";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tecnologia",
  description:
    "Come usiamo la tecnologia dentro Capibara: scelte politiche, infrastrutture digitali e il nostro Manifesto tecnologico.",
};

export default function TecnologiaPage() {
  return (
    <MainLayout>
      <div className="space-y-12">
        <section className="space-y-4">
          <p className="eyebrow eyebrow--page">Tecnologia &amp; politica</p>
          <h1 className="page-title text-4xl font-semibold">
            La tecnologia non è neutrale. È una scelta politica.
          </h1>
          <p className="body-text-lg">
            Capibara nasce dall&apos;intreccio tra giornalismo, attivismo e
            organizzazione. Questo vale anche per l&apos;infrastruttura
            tecnologica che usiamo ogni giorno:{" "}
            <span className="font-semibold">
              non è un dettaglio tecnico, ma una parte del progetto politico
              complessivo
            </span>
            .
          </p>
          <p className="body-text-lg">
            Vogliamo che i nostri strumenti digitali siano coerenti con quello
            che raccontiamo: conflitti, diritti, lavoro, clima, mutualismo. Per
            questo proviamo a costruire, per quanto possibile, pun ecosistema
            che non scarichi costi sociali, ambientali o militari su altre
            persone, altri territori, altri corpi.
          </p>
          <p className="body-text-sm">
            In questa pagina raccontiamo{" "}
            <span className="font-semibold">
              come pensiamo la tecnologia, quali scelte facciamo ogni giorno e
              perché chiediamo il tuo supporto economico
            </span>{" "}
            per continuare a farlo. Se vuoi andare dritto al punto, puoi{" "}
            <Link
              href="#manifesto-tecnologico"
              className="font-semibold underline underline-offset-4"
            >
              leggere il nostro Manifesto tecnologico
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="page-heading text-2xl font-semibold">
              Tecnologia come bene comune, non come dominio
            </h2>
            <p className="body-text-sm">
              Non crediamo a una tecnologia neutrale. Ogni piattaforma,
              algoritmo, infrastruttura porta con sé un&apos;idea di mondo: chi
              decide, chi controlla, chi può partecipare, chi viene escluso.
            </p>
            <p className="body-text-sm">
              Per noi la tecnologia è{" "}
              <span className="font-semibold">
                uno strumento per allargare diritti, conoscenza e possibilità
              </span>
              , non per concentrare potere in poche mani. Per questo difendiamo{" "}
              <span className="font-semibold">il software libero e open source</span>
              , l&apos;interoperabilità, la possibilità per comunità, movimenti e
              istituzioni di capire, modificare e condividere gli strumenti che
              usano.
            </p>
            <p className="body-text-sm">
              Significa anche scegliere di non sostenere aziende coinvolte in
              guerra, sorveglianza di massa, repressione o violazioni dei
              diritti umani, e rifiutare modelli basati sull&apos;estrazione
              indiscriminata di dati e sull&apos;opacità decisionale.
            </p>
            <p className="body-text-sm">
              È una scelta che ha conseguenze geopolitiche: proviamo a non
              rafforzare, con i nostri abbonamenti software e le nostre
              infrastrutture, attori economici che alimentano guerre, occupazioni
              o apparati di sicurezza repressivi.{" "}
              <span className="font-semibold">
                Il boicottaggio tecnologico, per noi, è uno degli strumenti
                pratici con cui ridurre – anche se in piccola scala – il sostegno
                materiale a queste architetture di potere
              </span>
              .
            </p>
          </div>

          <div className="content-box space-y-4 p-6">
            <h3 className="page-heading text-lg font-semibold">
              Cosa significa nella pratica
            </h3>
            <ul className="body-text-sm space-y-2">
              <li>
                • Privilegiamo software libero e open source, quando possibile,
                e contribuiamo – nel nostro piccolo – alla loro diffusione.
              </li>
              <li>
                • Scegliamo servizi e fornitori che non basano il proprio
                modello sul tracciamento aggressivo degli utenti.
              </li>
              <li>
                • Prestiamo attenzione all&apos;impatto ambientale delle
                infrastrutture che usiamo, alle condizioni di lavoro nella
                filiera digitale, alle ricadute psicologiche degli strumenti che
                adottiamo.
              </li>
              <li>
                • Mettiamo al centro la sovranità digitale di chi ci legge:
                possibilità di capire cosa succede ai propri dati, limitarne
                l&apos;uso, scegliere consapevolmente.
              </li>
            </ul>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="page-heading text-2xl font-semibold">
              Perché ti chiediamo di sostenerci economicamente
            </h2>
            <p className="body-text-sm">
              Costruire e mantenere infrastrutture tecnologiche coerenti con i
              nostri principi{" "}
              <span className="font-semibold">
                costa tempo, competenze e risorse
              </span>
              . È più facile e spesso più economico appoggiarsi a grandi
              piattaforme proprietarie che vivono di pubblicità, sorveglianza e
              sfruttamento dei dati.
            </p>
            <p className="body-text-sm">
              Scegliere un altro modello – più trasparente, più etico, più
              controllabile – significa rifiutare scorciatoie e accettare che
              alcuni percorsi siano più lenti o più complessi. Per farlo abbiamo
              bisogno di una comunità che consideri anche questo un pezzo della
              lotta politica.
            </p>
            <p className="body-text-sm">
              Abbonarsi a Capibara non serve solo a finanziare articoli,
              inchieste, podcast e video.{" "}
              <span className="font-semibold">
                Serve anche a tenere in piedi un&apos;infrastruttura tecnologica
                che prova, ogni giorno, a non essere complice di ciò che racconta
                criticamente
              </span>
              .
            </p>
          </div>

          <div className="content-box space-y-4 p-6">
            <h3 className="page-heading text-lg font-semibold">
              Sottoscrizione come strumento di lotta
            </h3>
            <p className="body-text-sm">
              Quando ti abboni, partecipi alla costruzione di un ecosistema
              mediatico e tecnologico diverso,{" "}
              <span className="font-semibold">
                che prova a sottrarsi – per quanto possibile – alle logiche di
                guerra, sfruttamento e sorveglianza
              </span>
              .
            </p>
            <p className="body-text-sm">
              Il tuo contributo ci permette di scegliere fornitori più etici,
              dedicare tempo allo sviluppo e alla manutenzione delle
              infrastrutture,{" "}
              <span className="font-semibold">
                sperimentare strumenti che mettono al centro benessere,
                accessibilità e autonomia delle persone
              </span>
              .
            </p>
            <p className="body-text-sm font-semibold">
              Vuoi sostenerci concretamente e permetterci di scegliere
              infrastrutture coerenti con questo manifesto?
            </p>
            <Link
              href="/abbonamenti"
              className="mt-1 inline-flex w-full sm:w-auto items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-black bg-[#f87171] hover:bg-[#fb7185] dark:text-black transition-colors shadow-sm"
            >
              Abbonati e sostieni il nostro attivismo tecnologico →
            </Link>
          </div>
        </section>

        <section
          id="manifesto-tecnologico"
          className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-8 space-y-8 text-zinc-900 shadow-sm dark:border-zinc-900 dark:from-black dark:via-black dark:to-black dark:text-zinc-100"
        >
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
            <div className="space-y-4">
              <p className="eyebrow eyebrow--page">Manifesto tecnologico</p>
              <h2 className="page-heading text-2xl font-semibold">
                MANIFESTO TECNOLOGICO v.0.1
              </h2>
              <p className="body-text-sm max-w-3xl">
                Questo manifesto è una versione in divenire. Lo aggiorneremo
                insieme a chi lavora con noi, a chi ci legge e a chi costruisce
                tecnologie per i movimenti sociali, i sindacati, le comunità
                organizzate.
              </p>
              <div className="border-l-4 border-zinc-900/80 dark:border-white/80 pl-4 py-2">
                <p className="text-sm italic text-zinc-700 dark:text-zinc-300">
                  «La tecnologia è una scelta culturale e politica. Capibara
                  Media sceglie una tecnologia aperta, etica e al servizio delle
                  persone.»
                </p>
              </div>
            </div>

            <div className="tech-axes-box">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/60 dark:text-red-100 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                I nostri assi politici
              </div>
              <ul className="body-text-sm space-y-2">
                <li>• Tecnologia come bene comune, non come dominio.</li>
                <li>• Trasparenza, ispezionabilità, responsabilità degli strumenti.</li>
                <li>• Rifiuto della neutralità tecnologica e delle industrie di guerra.</li>
                <li>• Benessere, riduzione dello stress e delle disuguaglianze.</li>
                <li>• Sovranità digitale di individui e comunità.</li>
              </ul>
            </div>
          </div>

          <div className="body-text-sm max-w-4xl">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="tech-manifesto-card flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  1
                </div>
                <p>
                  Crediamo in una tecnologia che sia{" "}
                  <span className="font-semibold">bene comune</span>, non
                  strumento di dominio. Un mezzo per ampliare diritti,
                  conoscenza e possibilità, non per concentrare potere.
                </p>
              </div>

              <div className="tech-manifesto-card flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  2
                </div>
                <p>
                  Sosteniamo{" "}
                  <span className="font-semibold">
                    la trasparenza come principio fondante
                  </span>
                  : gli strumenti digitali che incidono sulla vita dei cittadini
                  devono essere comprensibili, ispezionabili e responsabili. Per
                  questo difendiamo il software libero e open source, perché
                  garantisce libertà di scelta, sicurezza reale,
                  interoperabilità e collaborazione tra individui, comunità e
                  istituzioni.
                </p>
              </div>

              <div className="tech-manifesto-card flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  3
                </div>
                <p>
                  Rifiutiamo{" "}
                  <span className="font-semibold">
                    la retorica della neutralità tecnologica
                  </span>
                  . Ogni infrastruttura, algoritmo o piattaforma porta con sé
                  una visione del mondo. Per questo non sosteniamo aziende che
                  alimentano conflitti armati, guerra, sorveglianza di massa,
                  repressione o violazioni dei diritti umani, né modelli
                  economici basati sull’estrazione indiscriminata di dati e
                  sull’opacità decisionale.
                </p>
              </div>

              <div className="tech-manifesto-card flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  4
                </div>
                <p>
                  Promuoviamo una tecnologia{" "}
                  <span className="font-semibold">
                    orientata al benessere dei cittadini
                  </span>
                  , che riduca lo stress, la complessità inutile e le
                  disuguaglianze sociali. Una tecnologia che favorisca l’accesso
                  equo alla conoscenza, alla cultura, alla salute,
                  all’educazione e ai servizi pubblici, rafforzando il tessuto
                  democratico e la partecipazione attiva.
                </p>
              </div>

              <div className="tech-manifesto-card flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  5
                </div>
                <p>
                  Crediamo in un’innovazione{" "}
                  <span className="font-semibold">
                    umana, inclusiva e sostenibile
                  </span>
                  , attenta all’impatto ambientale, sociale e psicologico dei
                  sistemi digitali. Progettiamo e sosteniamo soluzioni che
                  rispettano il tempo, l’attenzione e la dignità delle persone.
                </p>
              </div>

              <div className="tech-manifesto-card flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  6
                </div>
                <p>
                  Difendiamo{" "}
                  <span className="font-semibold">la sovranità digitale</span> di
                  individui e comunità: il diritto di comprendere, scegliere,
                  modificare e controllare gli strumenti tecnologici che
                  utilizziamo ogni giorno.
                </p>
              </div>

              <div className="tech-manifesto-card flex gap-3 md:col-span-2">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  7
                </div>
                <p>
                  Per noi il progresso non si misura solo in prestazioni o
                  scalabilità, ma nella capacità di generare{" "}
                  <span className="font-semibold">valore sociale</span>, fiducia
                  e relazioni sane. La tecnologia è una scelta culturale e
                  politica. Capibara Media sceglie una tecnologia{" "}
                  <span className="font-semibold">aperta, etica</span> e al
                  servizio delle persone.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

