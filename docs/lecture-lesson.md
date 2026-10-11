# Lecture à voix haute d'une leçon (TTS 100 % gratuit, avec pause)

Comment permettre à l'étudiant d'**écouter la leçon complète** (ex. la leçon
« alphabet ») et de la **mettre en pause** quand il veut — **sans aucun outil
payant ni clé API**.

La solution : la **Web Speech API** (`SpeechSynthesis`), intégrée à tous les
navigateurs modernes (Chrome, Edge, Firefox, Safari) depuis 2018, aucun
compte, aucune clé, aucun coût — c'est le moteur de synthèse du système.
Référence : <https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis>

---

## 1. Ce que la Web Speech API offre gratuitement

| Besoin | APIs utilisées | Coût |
|---|---|---|
| Parler la leçon | `window.speechSynthesis.speak()` | 0 € |
| Pause / reprise | `speechSynthesis.pause()` / `.resume()` | 0 € |
| Arrêter | `speechSynthesis.cancel()` | 0 € |
| Voix, débit, hauteur | `SpeechSynthesisUtterance.voice/rate/pitch` | 0 € |
| Voix disponibles | `speechSynthesis.getVoices()` | 0 € |

Alternative gratuite si tu veux une voix cloud de meilleure qualité : l'API
Google Translate TTS (non officielle, à éviter en prod) ou des modèles
open-source auto-hébergés (Piper, Coqui) — mais la Web Speech API couvre
largement le besoin et demande **zéro infrastructure**.

---

## 2. Hook React `useLessonReader`

```tsx
// resources/js/hooks/use-lesson-reader.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export type ReaderStatus = 'idle' | 'speaking' | 'paused' | 'unsupported';

/** Texte de la leçon → lecture à voix haute, pause, reprise, stop. */
export function useLessonReader(text: string, lang = 'fr-FR') {
    const [status, setStatus] = useState<ReaderStatus>('idle');
    const supported =
        typeof window !== 'undefined' && 'speechSynthesis' in window;

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (!supported) {
            setStatus('unsupported');

            return;
        }

        const synth = window.speechSynthesis;

        // Certaines voix "montent" en async : on force le peuplement.
        synth.getVoices();

        return () => synth.cancel(); // stop net au démontage / changement de leçon
    }, [supported]);

    const start = useCallback(() => {
        if (!supported || !text.trim()) {
            return;
        }

        window.speechSynthesis.cancel(); // vider la file avant (re)démarrage

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1; // 0.1 → 10, 1 = normal

        const voice = window.speechSynthesis
            .getVoices()
            .find((v) => v.lang === lang);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onend = () => setStatus('idle');
        utterance.onerror = () => setStatus('idle');
        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);
        setStatus('speaking');
    }, [supported, text, lang]);

    /** Pause / reprise, imbriqués dans le même bouton. */
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

        window.speechSynthesis.cancel();
        setStatus('idle');
    }, [supported]);

    return { status, start, togglePause, stop, supported };
}
```

---

## 3. Barre de contrôle « Écouter la leçon »

```tsx
// resources/js/components/learner/lesson-reader-bar.tsx
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLessonReader, type ReaderStatus } from '@/hooks/use-lesson-reader';

type Props = { text: string; lang?: string };

export function LessonReaderBar({ text, lang = 'fr-FR' }: Props) {
    const { status, start, togglePause, stop, supported } = useLessonReader(
        text,
        lang,
    );

    if (!supported) {
        return null; // silencieux : pas de lecteur, pas d'avertissement intrusif
    }

    return (
        <div
            className="not-prose flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            aria-label="Écouter la leçon"
        >
            <Volume2 className="size-5 text-primary" aria-hidden="true" />

            {status === 'idle' || status === 'unsupported' ? (
                <Button size="sm" variant="outline" onClick={start}>
                    <Play className="size-4" />
                    Écouter la leçon
                </Button>
            ) : (
                <>
                    <Button size="sm" variant="outline" onClick={togglePause}>
                        {status === 'paused' ? (
                            <>
                                <Play className="size-4" />
                                Reprendre
                            </>
                        ) : (
                            <>
                                <Pause className="size-4" />
                                Pause
                            </>
                        )}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={stop}>
                        <Square className="size-4" />
                        Stop
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {status === 'paused' ? 'En pause' : 'Lecture en cours…'}
                    </span>
                </>
            )}
        </div>
    );
}
```

---

## 4. Brancher ça sur la leçon MDX

Deux cas :

### 4.1 La leçon est encore en sections structurées (leçon alphabet actuelle)

```tsx
// La leçon = applatir tout le texte des sections
const plainText = [
    lesson.introduction,
    ...lesson.sections.map((section) =>
        [
            section.title,
            section.type === 'letters' ? section.description : '',
            ...section.items.map((item) =>
                typeof item === 'string' ? item : `${item.word}. ${item.note}`,
            ),
        ].join('. '),
    ),
].join('. ');
```

### 4.2 La leçon est en MDX (< docs/mdx-lessons.md >)

Il faut extraire le **texte brut sans les balises** — `evaluate` un MDX et
récupérer le texte sous forme de string est le plus fiable :

```tsx
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

async function mdxToPlainText(source: string): Promise<string> {
    const { default: Content } = await evaluate(source, { ...runtime });
    const html = renderToStaticMarkup(createElement(Content, {}));

    // Extraire le texte : on réutilise le navigateur, pas besoin de librairie
    const host = document.createElement('div');
    host.innerHTML = html;

    return (host.textContent ?? '').replace(/\s+/g, ' ').trim();
}
```

Ensuite, dans la page leçon :

```tsx
// resources/js/pages/learner/learn/alphabet.tsx (extrait)
const [spokenText, setSpokenText] = useState<string | null>(null);

useEffect(() => {
    let cancelled = false;

    mdxToPlainText(mdx).then((text) => {
        if (!cancelled) setSpokenText(text);
    });

    return () => { cancelled = true; };
}, [mdx]);

// …
<TabsContent value="lesson" className="mt-8">
    <MdxContent source={mdx} components={componentsMap} />
    {spokenText && <LessonReaderBar text={spokenText} lang="de-DE" />}
</TabsContent>
```

> 💡 `lang="de-DE"` fait parler l'allemand avec la voix allemande du
> système : parfait pour une leçon de langue — l'étudiant entend la
> **prononciation réelle**, ce qui est tout l'intérêt pédagogique.

---

## 5. Points importants

1. **Pause réelle** : `pause()` gèle la synthèse en cours, `resume()`
   reprend où elle s'était arrêtée. C'est natif, aucun suivi de position à
   coder. Attention : sur certains navigateurs (Safari iOS), `pause()` peut
   couper la file — le pattern bouton « Pause / Reprendre » ci-dessus le
   gère et, pire cas, `start()` redémarre du début.
2. **Chromium gaz de 15 s** : sur Chrome/Edge, un utterance de > 15 s doit
   être relancé manuellement si la page est en background — rare en usage
   leçon. Si problème, découper le texte en phrases et les mettre en file
   (plusieurs `speak()` successifs : la pause marche sur la file).
3. **Voix allemande pas installée** : `getVoices()` ne la liste pas →
   `utterance.lang = 'de-DE'` reste la bonne pratique ; le navigateur
   utilisera sa voix par défaut traduite selon le système. Tester sur 2-3
   navigateurs cibles.
4. **Nettoyage** : le `useEffect` renvoie `synth.cancel()` pour arrêter la
   lecture quand l'étudiant navigue vers une autre leçon — sans ça, la voix
   continuerait pendant qu'il lit ailleurs. C'est déjà dans le hook.
5. **Accessibilité** : bouton avec `aria-label="Écouter la leçon"` +
   `aria-live="polite"` sur le status pour que les lecteurs d'écran suivre
   l'état.

---

## 6. Récap des fichiers

| Fichier | Rôle | Coût |
|---|---|---|
| `resources/js/hooks/use-lesson-reader.ts` | orchestration TTS (start/pause/stop) | gratuit, natif |
| `resources/js/components/learner/lesson-reader-bar.tsx` | UI pause / reprise / stop | gratuit, natif |
| `mdxToPlainText()` (dans la page) | MDX → texte brut à lire | gratuit, natif |

Aucun package à installer, aucune clé API, aucun serveur : la Web Speech API
est déjà dans le navigateur de l'étudiant.
