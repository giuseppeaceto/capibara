import type { Course, Lesson, QuizQuestion } from "@/lib/api";

const gramsciquiz1: QuizQuestion[] = [
  {
    id: 1,
    question: "In quale anno nacque Antonio Gramsci?",
    optionA: "1881",
    optionB: "1891",
    optionC: "1901",
    optionD: "1871",
    correctAnswer: "B",
    explanation:
      "Antonio Gramsci nacque il 22 gennaio 1891 ad Ales, in Sardegna. Crebbe in condizioni di povertà, il che influenzò profondamente la sua visione politica e sociale.",
  },
  {
    id: 2,
    question: 'Cosa si intende con il concetto gramsciano di "egemonia culturale"?',
    optionA: "Il dominio militare di una nazione sulle altre",
    optionB: "La capacità della classe dominante di imporre la propria visione del mondo come senso comune",
    optionC: "La superiorità culturale dell'Occidente",
    optionD: "Il ruolo della Chiesa nella società italiana",
    correctAnswer: "B",
    explanation:
      "Per Gramsci l'egemonia culturale è il processo attraverso cui la classe dominante ottiene il consenso delle classi subalterne facendo apparire i propri valori, le proprie norme e credenze come universali e naturali, trasformandoli in 'senso comune'.",
  },
  {
    id: 3,
    question: "Dove scrisse Gramsci la maggior parte delle sue opere più importanti?",
    optionA: "All'Università di Torino",
    optionB: "In esilio a Mosca",
    optionC: "In carcere, durante la detenzione fascista",
    optionD: "Nella redazione de L'Ordine Nuovo",
    correctAnswer: "C",
    explanation:
      'I "Quaderni del carcere", opera fondamentale del pensiero gramsciano, furono scritti tra il 1929 e il 1935 durante la sua prigionia sotto il regime fascista. Gramsci fu arrestato nel 1926 e morì nel 1937.',
  },
];

const gramsciquiz2: QuizQuestion[] = [
  {
    id: 4,
    question: 'Qual è la differenza tra "intellettuale tradizionale" e "intellettuale organico" secondo Gramsci?',
    optionA: "Il tradizionale lavora nelle università, l'organico nelle fabbriche",
    optionB: "Il tradizionale si presenta come autonomo dalla classe sociale, l'organico è consapevolmente legato a una classe",
    optionC: "Il tradizionale è colto, l'organico è autodidatta",
    optionD: "Non c'è differenza sostanziale",
    correctAnswer: "B",
    explanation:
      "Gli intellettuali tradizionali si considerano indipendenti e autonomi dalle classi sociali (es. clero, letterati). Gli intellettuali organici sono invece consapevolmente legati a una classe e ne elaborano la visione del mondo, organizzandone l'egemonia o la contro-egemonia.",
  },
  {
    id: 5,
    question: 'Cosa intende Gramsci con "guerra di posizione"?',
    optionA: "Una strategia militare di trincea",
    optionB: "La conquista graduale dell'egemonia culturale nella società civile prima della presa del potere politico",
    optionC: "Lo scontro frontale con lo Stato borghese",
    optionD: "La difesa delle posizioni parlamentari del partito",
    correctAnswer: "B",
    explanation:
      'A differenza della "guerra di movimento" (assalto diretto al potere), la "guerra di posizione" è la strategia di costruzione paziente dell\'egemonia attraverso la società civile: scuole, media, associazioni, cultura. Gramsci la riteneva necessaria nelle società occidentali avanzate.',
  },
  {
    id: 6,
    question: 'Che ruolo ha la "società civile" nel pensiero di Gramsci?',
    optionA: "È irrilevante rispetto allo Stato",
    optionB: "È il luogo in cui si produce e si contesta l'egemonia culturale",
    optionC: "Coincide con la società politica",
    optionD: "È sinonimo di mercato economico",
    correctAnswer: "B",
    explanation:
      "Per Gramsci lo Stato è composto da società politica (apparato coercitivo) + società civile (scuole, chiese, media, associazioni). La società civile è il terreno fondamentale su cui si costruisce l'egemonia e il consenso, ed è lì che le classi subalterne devono combattere la loro battaglia culturale.",
  },
];

const gramsciquiz3: QuizQuestion[] = [
  {
    id: 7,
    question: 'Cosa significa la celebre frase di Gramsci "Pessimismo dell\'intelletto, ottimismo della volontà"?',
    optionA: "Bisogna essere pessimisti nella teoria e ottimisti nella pratica senza un legame tra le due",
    optionB: "L'analisi lucida e critica della realtà deve accompagnarsi alla determinazione nell'agire per cambiarla",
    optionC: "Gli intellettuali sono pessimisti, il popolo è ottimista",
    optionD: "La volontà prevale sempre sull'intelletto",
    correctAnswer: "B",
    explanation:
      "Questa massima, attribuita a Romain Rolland e ripresa da Gramsci, esprime la necessità di combinare un'analisi rigorosa e senza illusioni della realtà (pessimismo dell'intelletto) con la ferma volontà di agire per trasformarla (ottimismo della volontà).",
  },
  {
    id: 8,
    question: "Qual è la rilevanza del pensiero di Gramsci per i movimenti sociali contemporanei?",
    optionA: "Nessuna, il suo pensiero è datato e inapplicabile",
    optionB: "Il concetto di egemonia culturale spiega come i movimenti possano sfidare le narrative dominanti attraverso la cultura e l'educazione",
    optionC: "Solo i partiti comunisti possono applicare il suo pensiero",
    optionD: "È utile solo per capire la storia italiana del Novecento",
    correctAnswer: "B",
    explanation:
      "Il pensiero di Gramsci resta attualissimo. Concetti come egemonia culturale, intellettuale organico e guerra di posizione sono strumenti analitici usati dai movimenti per i diritti civili, dal femminismo, dai movimenti decoloniali e da chi oggi lavora nel giornalismo indipendente e nell'attivismo culturale.",
  },
  {
    id: 9,
    question: 'Cosa sono le "classi subalterne" nel pensiero gramsciano?',
    optionA: "Le classi medie della società",
    optionB: "I gruppi sociali esclusi dall'egemonia dominante, privati di voce e rappresentazione",
    optionC: "I militari di grado inferiore",
    optionD: "Gli studenti universitari",
    correctAnswer: "B",
    explanation:
      "Le classi subalterne sono i gruppi subordinati nella società — operai, contadini, emarginati — che non hanno accesso al potere culturale e politico. Gramsci studiava come queste classi potessero sviluppare una propria coscienza e costruire una contro-egemonia.",
  },
];

const gramscilesson1: Lesson = {
  title: "Chi era Antonio Gramsci: vita e contesto storico",
  slug: "chi-era-gramsci",
  order: 1,
  durationMinutes: 20,
  isFree: true,
  body: `## Antonio Gramsci: una vita tra Sardegna, Torino e il carcere fascista

Antonio Gramsci (1891–1937) è stato uno dei pensatori politici più influenti del XX secolo. Nato ad Ales, in Sardegna, in una famiglia di modeste condizioni, fin da giovane sperimentò sulla propria pelle le disuguaglianze sociali che avrebbe poi analizzato nelle sue opere.

### Gli anni della formazione

Nel 1911 si trasferì a **Torino** per studiare Lettere all'università, dove entrò in contatto con il movimento operaio delle fabbriche FIAT. Torino era allora il cuore dell'industria italiana, e il giovane Gramsci vi trovò un laboratorio di conflitto sociale e innovazione politica.

### Il giornalismo e la politica

Gramsci divenne giornalista e fondò nel 1919 la rivista **L'Ordine Nuovo**, che divenne un punto di riferimento per il movimento dei consigli di fabbrica. Nel 1921 fu tra i fondatori del **Partito Comunista d'Italia** e nel 1924 ne divenne segretario.

### L'arresto e i Quaderni del carcere

Nel 1926, nonostante l'immunità parlamentare, il regime fascista di Mussolini lo fece arrestare. Il procuratore fascista dichiarò: *"Dobbiamo impedire a questo cervello di funzionare per vent'anni."*

Ma in carcere Gramsci scrisse oltre **3.000 pagine** di analisi politica, filosofica e culturale — i celebri **Quaderni del carcere** — che sarebbero diventati tra le opere più studiate al mondo.

### Perché studiare Gramsci oggi?

Il pensiero di Gramsci offre strumenti per capire:
- Come il **potere** non sia solo coercizione, ma anche **consenso culturale**
- Perché le persone spesso accettano condizioni che le danneggiano
- Come i **media**, la **scuola** e la **cultura popolare** formano il "senso comune"
- Quali strategie possono usare i movimenti dal basso per costruire un'alternativa

In un'epoca di disinformazione, polarizzazione e crisi della democrazia, Gramsci è più attuale che mai.`,
  quiz: gramsciquiz1,
};

const gramscilesson2: Lesson = {
  title: "Egemonia culturale, intellettuali e società civile",
  slug: "egemonia-culturale",
  order: 2,
  durationMinutes: 25,
  isFree: false,
  body: `## I concetti chiave del pensiero gramsciano

### Egemonia culturale

Il concetto più noto di Gramsci è quello di **egemonia culturale**. A differenza di Marx, che enfatizzava il dominio economico come base del potere, Gramsci mostrò come la classe dominante mantenga il controllo non solo con la forza, ma soprattutto attraverso il **consenso**.

L'egemonia si realizza quando le idee, i valori e le credenze della classe dominante diventano il **"senso comune"** — ciò che tutti considerano ovvio, naturale, "come stanno le cose". Questo avviene attraverso:

- Il **sistema educativo**
- I **media** e l'industria culturale
- Le **istituzioni religiose**
- Le **pratiche quotidiane** e i costumi sociali

> *"Ogni rapporto di egemonia è necessariamente un rapporto pedagogico."* — A. Gramsci

### Intellettuali organici vs. intellettuali tradizionali

Gramsci distingue due tipi di intellettuali:

**Intellettuali tradizionali**: si presentano come indipendenti e al di sopra delle classi sociali (accademici, clero, letterati). In realtà, secondo Gramsci, svolgono spesso una funzione conservatrice.

**Intellettuali organici**: sono consapevolmente legati a una classe sociale e ne elaborano la visione del mondo. Ogni classe che aspira all'egemonia deve produrre i propri intellettuali organici — giornalisti, insegnanti, attivisti, artisti — che diano forma e coerenza alla propria cultura.

### Società civile e società politica

Per Gramsci lo **Stato** non è solo l'apparato di governo e le forze dell'ordine (società politica). Lo Stato in senso ampio include la **società civile**: scuole, chiese, media, associazioni, partiti, sindacati.

È nella società civile che si gioca la partita dell'egemonia. Chi controlla la cultura controlla il consenso, e chi controlla il consenso governa senza bisogno della sola coercizione.

### Guerra di posizione vs. guerra di movimento

- **Guerra di movimento**: assalto diretto al potere (la rivoluzione russa del 1917)
- **Guerra di posizione**: conquista graduale dell'egemonia nella società civile, costruendo istituzioni culturali alternative, media indipendenti, educazione popolare

Gramsci riteneva che nelle società occidentali avanzate, dove la società civile è forte e articolata, la guerra di posizione fosse la strategia necessaria.`,
  quiz: gramsciquiz2,
};

const gramscilesson3: Lesson = {
  title: "Gramsci oggi: applicazioni contemporanee",
  slug: "gramsci-oggi",
  order: 3,
  durationMinutes: 20,
  isFree: false,
  body: `## Il pensiero di Gramsci nel mondo contemporaneo

### "Pessimismo dell'intelletto, ottimismo della volontà"

Questa celebre massima, ripresa da Gramsci, sintetizza il suo approccio: analizzare la realtà senza illusioni, ma agire con determinazione per cambiarla. Un atteggiamento fondamentale per chiunque faccia giornalismo indipendente, attivismo o lavoro culturale.

### Gramsci e i media contemporanei

I concetti gramsciani sono straordinariamente utili per capire:

**Le "bolle informative"**: i social media creano camere d'eco che rinforzano il senso comune dominante. Gramsci ci aiuta a capire come queste bolle non siano casuali, ma riflettano strutture di potere.

**La concentrazione dei media**: quando pochi gruppi controllano l'informazione, controllano anche la produzione del senso comune. Il giornalismo indipendente diventa allora una forma di contro-egemonia.

**La cultura pop come terreno di lotta**: serie TV, musica, meme, influencer — Gramsci ci insegna che la cultura popolare non è "intrattenimento innocuo" ma un campo di battaglia dove si producono e si contestano significati.

### Gramsci e i movimenti sociali

Molti movimenti contemporanei hanno applicato (spesso inconsapevolmente) le idee di Gramsci:

- **I movimenti per i diritti civili**: Martin Luther King e il movimento afroamericano non lottavano solo per leggi, ma per cambiare il senso comune sulla razza
- **Il femminismo**: ha contestato l'egemonia patriarcale mostrando come il "naturale" fosse in realtà costruito culturalmente
- **I movimenti decoloniali**: hanno smascherato l'egemonia dell'eurocentrismo nella cultura, nell'educazione e nei media
- **Il giornalismo indipendente**: piattaforme come Capibara sono esempio di "intellettuali organici" che costruiscono contro-narrative

### Le classi subalterne oggi

Chi sono le classi subalterne nel XXI secolo?

- I **lavoratori precari** della gig economy
- I **migranti** privi di rappresentanza politica
- Le **comunità indigene** le cui culture sono marginalizzate
- Tutti coloro che sono **esclusi dalle narrative dominanti** dei media mainstream

Gramsci ci insegna che queste classi non sono passive: hanno cultura, resistenza e capacità di organizzazione. Ma hanno bisogno di strumenti — educazione, media indipendenti, organizzazione — per trasformare la loro esperienza in consapevolezza e azione politica.

### Esercizio di riflessione

Prova a rispondere a queste domande:
1. Quali idee del "senso comune" nella tua vita quotidiana potresti ricondurre a un'egemonia culturale?
2. Conosci esempi di "intellettuali organici" nel mondo contemporaneo?
3. In che modo il giornalismo indipendente può essere una forma di "guerra di posizione"?`,
  quiz: gramsciquiz3,
};

export const GRAMSCI_COURSE: Course = {
  title: "Gramsci: egemonia, cultura e potere",
  slug: "gramsci-egemonia-cultura-potere",
  description:
    "Un percorso formativo per scoprire il pensiero di Antonio Gramsci e capire come le sue idee su egemonia culturale, intellettuali organici e classi subalterne siano strumenti essenziali per leggere il presente.",
  body: `Questo corso introduce il pensiero di **Antonio Gramsci** (1891-1937), uno dei pensatori politici più influenti del Novecento.

Attraverso tre lezioni ricche di contenuti e quiz interattivi, esploreremo:
- La **vita** di Gramsci dalla Sardegna al carcere fascista
- I concetti chiave: **egemonia culturale**, **intellettuali organici**, **guerra di posizione**
- L'attualità del pensiero gramsciano per il **giornalismo indipendente** e i **movimenti sociali** del XXI secolo

Il corso è pensato per chi vuole capire come il potere non si esercita solo con la forza, ma attraverso la cultura — e come costruire alternative.`,
  level: "base",
  category: "filosofia",
  isPremium: false,
  isFeatured: true,
  estimatedHours: 2,
  publishDate: "2026-02-21T10:00:00.000Z",
  heroImage: null,
  author: null,
  lessons: {
    data: [
      { id: 1, attributes: gramscilesson1 },
      { id: 2, attributes: gramscilesson2 },
      { id: 3, attributes: gramscilesson3 },
    ],
  },
  tags: {
    data: [
      { attributes: { name: "Filosofia", slug: "filosofia" } },
      { attributes: { name: "Politica", slug: "politica" } },
      { attributes: { name: "Formazione", slug: "formazione" } },
    ],
  },
  seo: null,
};

export const SEED_COURSES: Course[] = [GRAMSCI_COURSE];

export function getSeedCourses() {
  return SEED_COURSES;
}

export function getSeedCourseBySlug(slug: string) {
  return SEED_COURSES.find((c) => c.slug === slug) ?? null;
}

export function getSeedLessonBySlug(courseSlug: string, lessonSlug: string) {
  const course = getSeedCourseBySlug(courseSlug);
  if (!course?.lessons?.data) return null;
  const lessonItem = course.lessons.data.find(
    (l) => (l.attributes?.slug ?? (l as any).slug) === lessonSlug,
  );
  return lessonItem?.attributes ?? lessonItem ?? null;
}
