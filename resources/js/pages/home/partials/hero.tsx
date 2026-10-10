import { router, usePage } from "@inertiajs/react";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    BookOpen,
    Check,
    GraduationCap,
    MessageCircle,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboard, login, register } from "@/routes";
import type { Auth } from "@/types";

export default function Hero() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const shouldReduceMotion = useReducedMotion();
    const floatingAnimation = shouldReduceMotion ? { y: 0 } : { y: [0, -12, 0] };

    return (
        <section className="relative isolate overflow-hidden px-5 pt-10 pb-12 text-foreground sm:px-8 lg:pt-12 lg:pb-12 2xl:pb-8">
            <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center 2xl:min-h-[540px]">
                <div className="relative z-10 mt-14 flex max-w-5xl flex-col items-center lg:mt-16">
                    <h1 className="max-w-5xl font-display text-[clamp(2.75rem,6vw,5rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance">
                        L’allemand, enfin
                        <br />
                        <span className="inline-block -rotate-2 rounded-2xl bg-primary px-4 py-1 text-primary-foreground shadow-lg shadow-primary/15 sm:px-6">
                            à ta portée.
                        </span>
                    </h1>

                    <p className="mt-10 max-w-2xl font-sans text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
                        Grammaire, vocabulaire et expression orale : pratique
                        l’allemand à ton niveau, avec des activités pour
                        comprendre, essayer et oser t’exprimer.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Button
                            type="button"
                            size="lg"
                            onClick={() => router.visit(auth.user ? dashboard().url : register().url)}
                        >
                            {auth.user ? "Mon espace" : "Créer un compte"}
                            <ArrowRight data-icon="inline-end" aria-hidden="true" />
                        </Button>
                        {!auth.user && (
                            <Button
                                type="button"
                                size="lg"
                                variant="secondary"
                                onClick={() => router.visit(login().url)}
                            >
                                Se connecter
                                <ArrowRight data-icon="inline-end" aria-hidden="true" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-12 grid w-full max-w-2xl gap-4 text-left sm:grid-cols-2 2xl:hidden">
                    <motion.div
                        initial={{ y: 0 }}
                        animate={floatingAnimation}
                        transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
                    >
                        <Card variant="floating" className="h-full gap-0 p-5">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                                <Sparkles className="size-4" aria-hidden="true" />{" "}
                                Un mot à découvrir
                            </p>
                            <p className="mt-3 font-display text-2xl font-semibold">
                                Willkommen !
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Bienvenue en allemand.
                            </p>
                        </Card>
                    </motion.div>
                    <motion.div
                        initial={{ y: 0 }}
                        animate={floatingAnimation}
                        transition={{ duration: 6.5, delay: -2, ease: "easeInOut", repeat: Infinity }}
                    >
                        <Card variant="floating" className="h-full gap-0 p-5">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                                <BookOpen className="size-4" aria-hidden="true" />{" "}
                                En pratique
                            </p>
                            <p className="mt-3 font-display text-2xl font-semibold">
                                Lire. Comprendre. Oser.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Chaque mot ouvre une nouvelle possibilité.
                            </p>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 0 }}
                    animate={floatingAnimation}
                    transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
                    style={{ rotate: -3 }}
                    className="pointer-events-none absolute top-4 -left-7 hidden w-64 text-left 2xl:block"
                >
                    <Card variant="floating" className="gap-0 p-5">
                        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                            <Sparkles className="size-4" aria-hidden="true" />{" "}
                            Un mot à découvrir
                        </p>
                        <p className="mt-5 font-display text-3xl font-semibold">
                            Willkommen !
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Bienvenue en allemand.
                        </p>
                    </Card>
                    <span className="absolute -bottom-5 -left-3 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold shadow-lg">
                        <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                        />{" "}
                        Un pas après l’autre
                    </span>
                </motion.div>

                <motion.div
                    initial={{ y: 0 }}
                    animate={floatingAnimation}
                    transition={{ duration: 6.5, delay: -2, ease: "easeInOut", repeat: Infinity }}
                    style={{ rotate: 2 }}
                    className="pointer-events-none absolute top-2 -right-7 hidden w-64 text-left 2xl:block"
                >
                    <Card variant="floating" className="gap-0 p-5">
                        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                            <BookOpen className="size-4" aria-hidden="true" />{" "}
                            Le mot du jour
                        </p>
                        <p className="mt-5 font-display text-3xl font-semibold">
                            Neugierig
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Curieux, curieuse.
                        </p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ y: 0 }}
                    animate={floatingAnimation}
                    transition={{ duration: 6, delay: -4, ease: "easeInOut", repeat: Infinity }}
                    className="pointer-events-none absolute top-[390px] -left-2 hidden w-60 text-left 2xl:block"
                >
                    <Card variant="floating" className="gap-0 p-5">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                            <MessageCircle
                                className="size-4 text-primary"
                                aria-hidden="true"
                            />{" "}
                            Ose parler allemand
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Écoute, répète et trouve tes propres mots.
                        </p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ y: 0 }}
                    animate={floatingAnimation}
                    transition={{ duration: 7, delay: -1, ease: "easeInOut", repeat: Infinity }}
                    className="pointer-events-none absolute top-[390px] right-0 hidden w-60 text-left 2xl:block"
                >
                    <Card variant="floating" className="gap-0 p-5">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                            <GraduationCap
                                className="size-4 text-primary"
                                aria-hidden="true"
                            />{" "}
                            CharlesAcademy
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Un endroit pour faire de l’allemand une langue
                            familière.
                        </p>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}
