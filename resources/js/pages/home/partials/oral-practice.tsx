import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    AudioLines,
    ChevronLeft,
    Headphones,
    Lightbulb,
    Mic,
    MicOff,
    RotateCcw,
    Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Level = "A1" | "A2" | "B1" | "B2";
type Challenge = {
    question: string;
    prompt: string;
    example: string;
    translation: string;
    hints: string[];
};

const challenges: Record<Level, Challenge[]> = {
    A1: [
        {
            question: "Wie heißt du und woher kommst du?",
            prompt: "Dis ton prénom et d'où tu viens.",
            example: "Ich heiße Alex und komme aus Lagos.",
            translation: "Je m'appelle Alex et je viens de Lagos.",
            hints: ["Ich heiße …", "Ich komme aus …"],
        },
        {
            question: "Was machst du gern in deiner Freizeit?",
            prompt: "Parle d'une activité que tu aimes faire.",
            example: "Ich lese gern und höre Musik.",
            translation: "J'aime lire et écouter de la musique.",
            hints: ["Ich … gern", "In meiner Freizeit …"],
        },
    ],
    A2: [
        {
            question: "Was hast du gestern gemacht?",
            prompt: "Raconte une chose que tu as faite hier.",
            example: "Gestern habe ich mit Freunden gekocht.",
            translation: "Hier, j'ai cuisiné avec des amis.",
            hints: ["Gestern habe ich …", "Danach bin ich …"],
        },
        {
            question: "Wie sieht dein idealer Urlaub aus?",
            prompt: "Décris tes vacances idéales en quelques phrases.",
            example: "Ich möchte ans Meer fahren und viel schwimmen.",
            translation: "Je voudrais aller à la mer et beaucoup nager.",
            hints: ["Ich möchte …", "Am liebsten …"],
        },
    ],
    B1: [
        {
            question: "Warum lernst du Deutsch?",
            prompt: "Donne une raison et explique ton choix.",
            example:
                "Ich lerne gern Deutsch, weil ich neue Menschen kennenlernen möchte.",
            translation:
                "J'aime apprendre l'allemand parce que je voudrais rencontrer de nouvelles personnes.",
            hints: ["Ich lerne Deutsch, weil …", "Außerdem …"],
        },
        {
            question: "Was sind die Vorteile von öffentlichen Verkehrsmitteln?",
            prompt: "Donne ton avis et justifie-le.",
            example:
                "Öffentliche Verkehrsmittel sind praktisch, weil sie oft günstiger sind.",
            translation:
                "Les transports publics sont pratiques parce qu'ils sont souvent moins chers.",
            hints: ["Meiner Meinung nach …", "Ein Vorteil ist …"],
        },
    ],
    B2: [
        {
            question: "Was ist beim Deutschlernen besonders wichtig?",
            prompt: "Exprime deux aspects de cette question.",
            example:
                "Einerseits ist regelmäßiges Üben wichtig, andererseits braucht man auch Geduld.",
            translation:
                "D'un côté, pratiquer régulièrement est important ; de l'autre, il faut aussi de la patience.",
            hints: ["Einerseits …", "Andererseits …"],
        },
        {
            question: "Sollte man im Homeoffice oder im Büro arbeiten?",
            prompt: "Compare les deux possibilités et nuance ta conclusion.",
            example:
                "Obwohl das Homeoffice flexibel ist, bietet das Büro mehr direkten Austausch.",
            translation:
                "Bien que le télétravail soit flexible, le bureau offre davantage d'échanges directs.",
            hints: ["Obwohl …", "Allerdings …"],
        },
    ],
};

// Typages locaux : compatibles avec les navigateurs qui exposent webkitSpeechRecognition.
type SpeechResult = {
    isFinal: boolean;
    [index: number]: { transcript: string };
};
type RecognitionEvent = {
    resultIndex: number;
    results: ArrayLike<SpeechResult>;
};
type RecognitionError = { error: string };
type Recognition = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: RecognitionEvent) => void) | null;
    onerror: ((event: RecognitionError) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
};
type RecognitionConstructor = new () => Recognition;
type SpeechWindow = Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
};

export default function OralPractice() {
    const [level, setLevel] = useState<Level>("A1");
    const [index, setIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [hasAttempted, setHasAttempted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showExample, setShowExample] = useState(false);
    const [error, setError] = useState("");
    const [supported, setSupported] = useState<boolean | null>(null);
    const [speaking, setSpeaking] = useState(false);
    const recognitionRef = useRef<Recognition | null>(null);
    const stoppedIntentionallyRef = useRef(false);
    const challenge = challenges[level][index];

    useEffect(() => {
        const w = window as SpeechWindow;
        setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
        return () => {
            recognitionRef.current?.abort();
            recognitionRef.current = null;
            window.speechSynthesis?.cancel();
        };
    }, []);

    const stopListening = () => {
        stoppedIntentionallyRef.current = true;
        recognitionRef.current?.stop();
        setIsListening(false);
        setHasAttempted(true);
    };

    const resetAttempt = () => {
        stoppedIntentionallyRef.current = true;
        recognitionRef.current?.abort();
        recognitionRef.current = null;
        window.speechSynthesis?.cancel();
        setSpeaking(false);
        setIsListening(false);
        setTranscript("");
        setInterimTranscript("");
        setHasAttempted(false);
        setShowExample(false);
        setShowHint(false);
        setError("");
    };

    const chooseLevel = (next: Level) => {
        if (next === level) return;
        resetAttempt();
        setLevel(next);
        setIndex(0);
    };

    const changeChallenge = (next: number) => {
        if (next < 0 || next >= challenges[level].length) return;
        resetAttempt();
        setIndex(next);
    };

    const startListening = () => {
        const w = window as SpeechWindow;
        const RecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!RecognitionAPI) {
            setError(
                "La reconnaissance vocale n'est pas disponible dans ce navigateur.",
            );
            return;
        }
        window.speechSynthesis?.cancel();
        setSpeaking(false);
        recognitionRef.current?.abort();
        setError("");
        setTranscript("");
        setInterimTranscript("");
        setHasAttempted(false);
        stoppedIntentionallyRef.current = false;

        const instance = new RecognitionAPI();
        recognitionRef.current = instance;
        instance.lang = "de-DE";
        instance.continuous = false;
        instance.interimResults = true;
        instance.onresult = (event) => {
            let finalText = "";
            let interimText = "";
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) finalText += result[0].transcript + " ";
                else interimText += result[0].transcript + " ";
            }
            if (finalText.trim()) {
                setTranscript(finalText.trim());
                setHasAttempted(true);
            }
            setInterimTranscript(interimText.trim());
        };
        instance.onerror = (event) => {
            if (event.error === "aborted" && stoppedIntentionallyRef.current)
                return;
            const messages: Record<string, string> = {
                "not-allowed":
                    "Accès au microphone refusé. Autorise le micro dans ton navigateur.",
                "service-not-allowed":
                    "Le service de reconnaissance vocale est bloqué.",
                "no-speech":
                    "Aucune parole détectée. Réessaie en parlant plus près du micro.",
                "audio-capture": "Aucun microphone disponible.",
                network:
                    "La reconnaissance vocale nécessite une connexion ou un service disponible.",
            };
            setError(
                messages[event.error] ||
                    "Impossible de reconnaître la voix. Réessaie.",
            );
            setIsListening(false);
        };
        instance.onend = () => {
            if (recognitionRef.current === instance) {
                setIsListening(false);
                setHasAttempted(true);
                setInterimTranscript("");
            }
        };
        try {
            instance.start();
            setIsListening(true);
        } catch {
            setError("Le microphone n'a pas pu démarrer. Réessaie.");
            setIsListening(false);
        }
    };

    const speak = (text: string) => {
        if (
            !("speechSynthesis" in window) ||
            !("SpeechSynthesisUtterance" in window)
        ) {
            setError(
                "La lecture audio n'est pas disponible dans ce navigateur.",
            );
            return;
        }
        stoppedIntentionallyRef.current = true;
        recognitionRef.current?.abort();
        setIsListening(false);
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "de-DE";
        utterance.rate = 0.85;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <section
            id="expression-orale"
            aria-labelledby="oral-heading"
            className="border-t border-border px-4 py-14 sm:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-6xl">
                {/* En-tête existant conservé mot pour mot */}
                <div className="mx-auto max-w-5xl text-center">
                    <h2
                        id="oral-heading"
                        className="mt-6 font-display text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Ose parler{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            à voix haute.
                        </span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
                        Une question, quelques mots à toi, puis un exemple à
                        écouter. Essaie maintenant avec ton niveau.
                    </p>
                </div>

                {/* Parcours ouvert : aucune Card, aucun panneau englobant */}
                <div className="mt-12 sm:mt-16">
                    <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <AudioLines
                                className="size-4 text-primary"
                                aria-hidden="true"
                            />
                            Atelier de conversation
                            <span className="mx-1 text-border">/</span>
                            <span className="text-foreground">
                                {String(index + 1).padStart(2, "0")} —{" "}
                                {String(challenges[level].length).padStart(
                                    2,
                                    "0",
                                )}
                            </span>
                        </div>
                        <div
                            role="group"
                            aria-label="Choisir le niveau oral"
                            className="grid grid-cols-4 gap-1 sm:flex"
                        >
                            {(["A1", "A2", "B1", "B2"] as Level[]).map(
                                (item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => chooseLevel(item)}
                                        aria-pressed={level === item}
                                        className={cn(
                                            "min-h-10 min-w-12 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            level === item
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl pt-10 sm:pt-14">
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            <span>Écoute</span>
                            <span aria-hidden="true">—</span>
                            <span>Réponds</span>
                            <span aria-hidden="true">—</span>
                            <span>Progresse</span>
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                Ton défi en allemand
                            </p>
                            <h3
                                lang="de"
                                className="mx-auto mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
                            >
                                {challenge.question}
                            </h3>
                            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                                {challenge.prompt}
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => speak(challenge.question)}
                                >
                                    <Volume2 className="size-4" />{" "}
                                    {speaking
                                        ? "Lecture…"
                                        : "Écouter la question"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowHint((v) => !v)}
                                    aria-expanded={showHint}
                                >
                                    <Lightbulb className="size-4" />{" "}
                                    {showHint
                                        ? "Masquer l'indice"
                                        : "Besoin d'un indice ?"}
                                </Button>
                            </div>
                            {showHint && (
                                <div
                                    className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground"
                                    aria-live="polite"
                                >
                                    <span className="font-medium text-foreground">
                                        Commence par :{" "}
                                    </span>
                                    {challenge.hints.map((hint, i) => (
                                        <span key={hint} lang="de">
                                            {i > 0 ? " · " : ""}
                                            {hint}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Geste central : un unique gros microphone, pas de carte */}
                        <div className="mt-11 flex flex-col items-center text-center sm:mt-14">
                            <div className="relative flex items-center justify-center">
                                {isListening && (
                                    <div
                                        className="absolute size-36 animate-ping rounded-full border border-primary/40 motion-reduce:animate-none"
                                        aria-hidden="true"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={
                                        isListening
                                            ? stopListening
                                            : startListening
                                    }
                                    disabled={supported === false}
                                    aria-label={
                                        isListening
                                            ? "Terminer l'enregistrement"
                                            : "Commencer à répondre au microphone"
                                    }
                                    className={cn(
                                        "relative flex size-28 items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 sm:size-32",
                                        isListening
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-foreground bg-foreground text-background hover:scale-105 active:scale-95",
                                    )}
                                >
                                    {isListening ? (
                                        <MicOff
                                            className="size-10"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Mic
                                            className="size-10"
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>
                            </div>
                            <p
                                className="mt-6 font-display text-xl font-semibold text-foreground"
                                aria-live="polite"
                            >
                                {isListening
                                    ? "Je t'écoute…"
                                    : transcript
                                      ? "Bien, ta réponse est enregistrée"
                                      : "À toi de parler"}
                            </p>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                {isListening
                                    ? "Parle en allemand, puis touche le micro pour terminer."
                                    : "Touche le micro et réponds naturellement en allemand."}
                            </p>
                            {supported === false && (
                                <p
                                    role="status"
                                    className="mt-3 text-sm text-muted-foreground"
                                >
                                    Reconnaissance vocale indisponible ici.
                                    Essaie un navigateur compatible sur HTTPS.
                                </p>
                            )}
                            {error && (
                                <p
                                    role="alert"
                                    className="mt-3 max-w-md text-sm text-destructive"
                                >
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Transcription intégrée à la page, sans boîte */}
                        {(transcript ||
                            interimTranscript ||
                            (hasAttempted && !isListening)) && (
                            <div
                                className="mx-auto mt-11 max-w-2xl border-t border-border pt-6 text-center"
                                aria-live="polite"
                            >
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Ce que le micro a compris
                                </p>
                                <p
                                    lang="de"
                                    className="mt-3 font-display text-xl leading-relaxed text-foreground sm:text-2xl"
                                >
                                    {transcript ||
                                        interimTranscript ||
                                        "Aucune phrase reconnue. Réessaie."}
                                </p>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Transcription automatique, sans notation
                                    grammaticale ni évaluation de la
                                    prononciation.
                                </p>
                                <Button
                                    variant="ghost"
                                    type="button"
                                    className="mt-3"
                                    onClick={resetAttempt}
                                >
                                    <RotateCcw className="size-4" /> Refaire ma
                                    réponse
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Fin de l'exercice : ligne éditoriale, pas de carte */}
                    <div className="mt-12 border-y border-border py-5 sm:mt-16">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    setShowExample((value) => !value)
                                }
                                aria-expanded={showExample}
                            >
                                <Headphones className="size-4" />{" "}
                                {showExample
                                    ? "Masquer la réponse modèle"
                                    : "Voir une réponse possible"}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Défi précédent"
                                    disabled={index === 0}
                                    onClick={() => changeChallenge(index - 1)}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        index === challenges[level].length - 1
                                    }
                                    onClick={() => changeChallenge(index + 1)}
                                >
                                    Défi suivant{" "}
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                        {showExample && (
                            <div className="mx-auto max-w-2xl pt-6 pb-2 text-center">
                                <p
                                    lang="de"
                                    className="font-display text-xl font-semibold sm:text-2xl"
                                >
                                    {challenge.example}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {challenge.translation}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => speak(challenge.example)}
                                    className="mt-3"
                                >
                                    <Volume2 className="size-4" /> Écouter cette
                                    réponse
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
