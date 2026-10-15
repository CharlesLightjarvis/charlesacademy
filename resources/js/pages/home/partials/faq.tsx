import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown, HelpCircle } from 'lucide-react';

import { dashboard, register } from '@/routes';
import type { Auth } from '@/types';

/* =========================================================
   CHARLESACADEMY — FAQ
   React + TypeScript + Tailwind CSS v4
   No external accordion dependency
   ========================================================= */

type FAQItem = {
    question: string;
    answer: string;
};

const faqs: FAQItem[] = [
    {
        question: 'À quels niveaux puis-je pratiquer ?',
        answer: "Les niveaux A1, A2, B1 et B2 te servent de repères. À chaque niveau, tu retrouves de la grammaire, du vocabulaire et de l'expression orale avec une difficulté adaptée.",
    },
    {
        question: "Comment s'inscrire sur CharlesAcademy ?",
        answer: "Utilise le bouton d'inscription en haut de la page pour créer ton compte. Tu peux aussi explorer les aperçus interactifs de cette page sans compte.",
    },
    {
        question: "Qu'est-ce que je peux pratiquer ?",
        answer: "Tu peux travailler trois essentiels : comprendre et appliquer la grammaire, utiliser le vocabulaire en contexte et essayer de t'exprimer à l'oral. Les activités partent d'exemples concrets et t'invitent à répondre.",
    },
    {
        question: 'Puis-je apprendre depuis mon téléphone ?',
        answer: "Oui, le site s'adapte aux écrans de téléphone. Tu peux notamment explorer les exemples de pratique depuis ton mobile.",
    },
    {
        question: 'Faut-il payer pour utiliser CharlesAcademy ?',
        answer: "Les conditions d'accès et les éventuels tarifs seront affichés clairement avant toute souscription. Les aperçus interactifs de cette page sont accessibles librement.",
    },
    {
        question: 'Comment fonctionne la progression ?',
        answer: "Tu avances en essayant, en lisant les explications et en revenant sur ce qui te pose problème. Les repères A1 à B2 t'aident à choisir des activités à la bonne difficulté.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const { auth } = usePage<{ auth: Auth }>().props;

    function toggleFAQ(index: number) {
        setOpenIndex((previous) => (previous === index ? null : index));
    }

    return (
        <section
            id="faq"
            aria-labelledby="faq-heading"
            className="relative overflow-hidden border-t border-border px-5 py-16 sm:px-8 lg:py-24"
        >
            <div className="mx-auto max-w-7xl">
                {/* ========================================
                    CENTERED EDITORIAL HEADER
                   ======================================== */}

                <div className="mx-auto max-w-5xl text-center">
                    <h2
                        id="faq-heading"
                        className="mt-6 font-display text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Des questions ?{' '}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            On t'explique tout.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Niveaux, grammaire, vocabulaire, oral et accès :
                        retrouve ici les réponses aux questions essentielles.
                    </p>
                </div>

                {/* ========================================
                    FAQ ACCORDION
                   ======================================== */}

                <div className="mx-auto mt-12 max-w-4xl border-t border-border sm:mt-14">
                    {faqs.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={item.question}
                                className="border-b border-border"
                            >
                                <h3>
                                    <button
                                        type="button"
                                        id={`faq-question-${index}`}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${index}`}
                                        onClick={() => toggleFAQ(index)}
                                        className="group flex w-full items-center gap-4 py-6 text-left sm:gap-6 sm:py-7"
                                    >
                                        {/* Question number */}

                                        <span
                                            aria-hidden="true"
                                            className={`shrink-0 font-display text-sm font-semibold transition-colors ${
                                                isOpen
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </span>

                                        {/* Question text */}

                                        <span
                                            className={`min-w-0 flex-1 font-display text-lg leading-snug font-semibold transition-colors sm:text-2xl ${
                                                isOpen
                                                    ? 'text-primary'
                                                    : 'text-foreground group-hover:text-primary'
                                            }`}
                                        >
                                            {item.question}
                                        </span>

                                        {/* Toggle */}

                                        <span
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:size-10 ${
                                                isOpen
                                                    ? 'rotate-180 border-primary bg-primary text-primary-foreground'
                                                    : 'border-border text-muted-foreground group-hover:border-primary group-hover:text-primary'
                                            }`}
                                        >
                                            <ChevronDown
                                                className="size-4 sm:size-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </button>
                                </h3>

                                {/* Expandable answer */}

                                <div
                                    id={`faq-answer-${index}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${index}`}
                                    hidden={!isOpen}
                                    className="pr-12 pb-6 pl-8 sm:pr-16 sm:pb-8 sm:pl-11"
                                >
                                    <p className="max-w-2xl text-sm leading-[1.85] text-muted-foreground sm:text-base">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ========================================
                    BOTTOM CONTACT LINE
                   ======================================== */}

                <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-between gap-5 border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <HelpCircle className="size-5" />
                        </span>

                        <div>
                            <p className="font-display text-base font-semibold text-foreground">
                                Tu veux continuer ?
                            </p>

                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Crée un compte ou ouvre ton espace personnel.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={auth.user ? dashboard() : register()}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground"
                    >
                        {auth.user ? 'Mon espace' : 'Créer mon compte'}
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
