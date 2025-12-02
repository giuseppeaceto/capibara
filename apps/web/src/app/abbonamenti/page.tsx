import MainLayout from "@/components/MainLayout";
import { Check, Star, Zap, Crown } from "lucide-react";
import Link from "next/link";

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  popular?: boolean;
  accent: string;
};

const plans: PricingPlan[] = [
  {
    name: "Base",
    description: "Per chi vuole iniziare",
    price: "9",
    period: "mese",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Accesso a tutti i video pubblici",
      "Accesso a tutti i podcast pubblici",
      "Newsletter settimanale",
      "Supporto via email",
    ],
    cta: "Inizia ora",
    accent: "from-blue-500/30 via-indigo-500/20 to-purple-900/40",
  },
  {
    name: "Premium",
    description: "Il piano più popolare",
    price: "19",
    period: "mese",
    icon: <Star className="h-6 w-6" />,
    features: [
      "Tutto del piano Base",
      "Accesso a contenuti premium",
      "Newsletter esclusive",
      "Articoli approfonditi",
      "Accesso anticipato ai nuovi contenuti",
      "Supporto prioritario",
    ],
    cta: "Scegli Premium",
    popular: true,
    accent: "from-amber-500/30 via-orange-500/20 to-red-900/40",
  },
  {
    name: "Pro",
    description: "Per i veri appassionati",
    price: "39",
    period: "mese",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Tutto del piano Premium",
      "Contenuti esclusivi Pro",
      "Accesso a eventi live",
      "Community privata",
      "Contenuti scaricabili",
      "Merchandise esclusivo",
      "Supporto dedicato 24/7",
    ],
    cta: "Diventa Pro",
    accent: "from-purple-500/30 via-fuchsia-500/20 to-pink-900/40",
  },
];

export default function AbbonamentiPage() {
  return (
    <MainLayout>
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="page-title text-5xl font-semibold">Scegli il tuo abbonamento</h1>
          <p className="body-text-lg text-xl max-w-2xl mx-auto">
            Accedi a contenuti esclusivi, approfondimenti e una community di appassionati
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? "pricing-card-popular" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                    Più Popolare
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r ${plan.accent} text-white`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="pricing-title">{plan.name}</h3>
                    <p className="body-text-sm meta-text mt-1">{plan.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="pricing-price">€{plan.price}</span>
                    <span className="meta-text">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Annullabile in qualsiasi momento
                  </p>
                </div>

                <ul className={`space-y-3 pt-4 pricing-features-border`}>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="pricing-feature">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-full px-6 py-3 font-semibold text-sm transition ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                      : "bg-white/90 text-black hover:bg-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-box space-y-6">
          <h2 className="faq-title">Domande frequenti</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="faq-question">Posso cambiare piano in qualsiasi momento?</h3>
              <p className="body-text-sm">
                Sì, puoi aggiornare o modificare il tuo abbonamento in qualsiasi momento dal tuo profilo.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="faq-question">Cosa succede se annullo?</h3>
              <p className="body-text-sm">
                Mantieni l'accesso fino alla fine del periodo pagato. Dopo non avrai più accesso ai contenuti premium.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="faq-question">I pagamenti sono sicuri?</h3>
              <p className="body-text-sm">
                Utilizziamo Stripe per processare i pagamenti in modo sicuro. Non conserviamo i dati della tua carta.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="faq-question">Offrite sconti annuali?</h3>
              <p className="body-text-sm">
                Sì! I piani annuali includono uno sconto del 20%. Contattaci per maggiori informazioni.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="body-text">
            Hai bisogno di aiuto?{" "}
            <Link href="/" className="page-title underline hover:opacity-80">
              Contattaci
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

