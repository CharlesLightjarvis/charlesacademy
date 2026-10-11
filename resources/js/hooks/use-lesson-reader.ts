import { useCallback, useEffect, useRef, useState } from 'react';

export type ReaderStatus = 'idle' | 'speaking' | 'paused' | 'unsupported';

/** Voix proposées à l'étudiant : français et allemand. */
export const READER_LANGUAGES = [
    { code: 'fr-FR', label: 'Français', shortLabel: 'FR' },
    { code: 'de-DE', label: 'Deutsch', shortLabel: 'DE' },
] as const;

export type ReaderLanguage = (typeof READER_LANGUAGES)[number]['code'];

/**
 * Lecture à voix haute d'un texte de leçon via la Web Speech API
 * (SpeechSynthesis) : démarrage, pause / reprise, arrêt, voix au choix.
 *
 * Gratuit et natif : aucune clé API, aucun service externe.
 * Référence : https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */
export function useLessonReader(text: string) {
    const [status, setStatus] = useState<ReaderStatus>('idle');

    const supported =
        typeof window !== 'undefined' && 'speechSynthesis' in window;

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
    const speakTimerRef = useRef<number | null>(null);

    /** Annule une reprogrammation de lecture en attente. */
    const clearPendingSpeak = useCallback(() => {
        if (speakTimerRef.current !== null) {
            window.clearTimeout(speakTimerRef.current);
            speakTimerRef.current = null;
        }
    }, []);

    // Montage : on précharge les voix (elles arrivent en async sur certains
    // navigateurs) et on coupe tout au démontage / changement de leçon.
    useEffect(() => {
        if (!supported) {
            setStatus('unsupported');

            return;
        }

        const synth = window.speechSynthesis;

        const loadVoices = () => {
            voicesRef.current = synth.getVoices();
        };

        loadVoices();
        synth.addEventListener('voiceschanged', loadVoices);

        return () => {
            synth.removeEventListener('voiceschanged', loadVoices);
            clearPendingSpeak();
            synth.cancel();
        };
    }, [clearPendingSpeak, supported]);

    // Contournement Chromium : une synthèse de plus de ~15 s s'interrompt
    // seule. Un « ping » régulier maintient la file de lecture vivante.
    useEffect(() => {
        if (!supported || status !== 'speaking') {
            return;
        }

        const keepAlive = window.setInterval(() => {
            const synth = window.speechSynthesis;

            if (synth.speaking && !synth.paused) {
                synth.resume();
            }
        }, 10_000);

        return () => window.clearInterval(keepAlive);
    }, [supported, status]);

    /** Voix la plus proche de la langue demandée (exacte, puis préfixe). */
    const pickVoice = useCallback((lang: ReaderLanguage) => {
        const voices = voicesRef.current;

        return (
            voices.find((voice) => voice.lang === lang) ??
            voices.find((voice) =>
                voice.lang.replace('_', '-').startsWith(lang.slice(0, 2)),
            ) ??
            null
        );
    }, []);

    /**
     * Démarre la lecture. Si une langue est passée alors que la lecture est
     * en cours, on redémarre immédiatement avec la nouvelle voix.
     */
    const start = useCallback(
        (lang: ReaderLanguage = 'fr-FR') => {
            if (!supported || !text.trim()) {
                return;
            }

            const synth = window.speechSynthesis;
            const wasActive = synth.speaking || synth.paused;

            clearPendingSpeak();
            synth.cancel(); // vide la file avant (re)démarrage

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 1; // 0.1 → 10, 1 = débit normal

            const voice = pickVoice(lang);
            if (voice) {
                utterance.voice = voice;
            }

            // Seul l'utterance en cours pilote l'état : un « fin » tardif
            // d'une lecture précédente ne doit pas l'arrêter.
            utterance.onend = () => {
                if (utteranceRef.current === utterance) {
                    utteranceRef.current = null;
                    setStatus('idle');
                }
            };
            utterance.onerror = () => {
                if (utteranceRef.current === utterance) {
                    utteranceRef.current = null;
                    setStatus('idle');
                }
            };
            utteranceRef.current = utterance;

            const speak = () => {
                speakTimerRef.current = null;

                if (utteranceRef.current === utterance) {
                    synth.speak(utterance);
                }
            };

            // cancel() se vide de façon asynchrone (Chrome, Safari) : relancer
            // tout de suite partirait en silence. On laisse la file se vider.
            if (wasActive) {
                speakTimerRef.current = window.setTimeout(speak, 80);
            } else {
                speak();
            }

            setStatus('speaking');
        },
        [clearPendingSpeak, pickVoice, supported, text],
    );

    /** Pause / reprise imbriquées dans le même bouton. */
    const togglePause = useCallback(() => {
        if (!supported) {
            return;
        }

        const synth = window.speechSynthesis;

        if (synth.paused) {
            synth.resume();
            setStatus('speaking');
        } else if (synth.speaking) {
            synth.pause();
            setStatus('paused');
        }
    }, [supported]);

    const stop = useCallback(() => {
        if (!supported) {
            return;
        }

        clearPendingSpeak();
        utteranceRef.current = null;
        window.speechSynthesis.cancel();
        setStatus('idle');
    }, [clearPendingSpeak, supported]);

    // Un texte qui change (autre leçon, autre MDX) arrête la lecture en cours.
    useEffect(() => {
        if (!supported) {
            return;
        }

        clearPendingSpeak();
        utteranceRef.current = null;
        window.speechSynthesis.cancel();
        setStatus('idle');
    }, [clearPendingSpeak, supported, text]);

    return { status, start, togglePause, stop, supported };
}
