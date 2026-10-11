import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    PlayCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { show as lessonShow } from "@/routes/learner/learn/lesson";
import { update as updateLevel } from "@/routes/learner/learn/level";
import { cn } from "@/lib/utils";
import type { LearnLevel, LevelCode } from "@/types/learn";

type Props = {
    levels: LearnLevel[];
    selectedLevel: LevelCode | null;
};

export default function LearnIndex({ levels, selectedLevel }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [chosenModuleId, setChosenModuleId] = useState<string | null>(null);
    const previewLevel = selectedLevel ?? "A1";
    const course = levels.find((item) => item.code === previewLevel);
    const modules = course?.modules ?? [];
    const activeModule =
        modules.find((m) => m.id === chosenModuleId) ?? modules[0];
    const activeModuleIndex = activeModule
        ? modules.findIndex((m) => m.id === activeModule.id)
        : -1;

    function chooseLevel(level: LevelCode) {
        if (level === selectedLevel || isSaving) return;
        setChosenModuleId(null);
        router.post(
            updateLevel.url(),
            { level },
            {
                onStart: () => setIsSaving(true),
                onFinish: () => setIsSaving(false),
            },
        );
    }

    return (
        <>
            <Head title="Apprendre" />
            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-5">
                <div className="max-w-3xl">
                    <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-4xl">
                        Apprendre, à ton niveau.
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        Choisis librement ton niveau. Tes leçons et ta
                        progression restent ici, même si tu changes de niveau.
                    </p>
                </div>

                <section className="mt-10" aria-label="Niveaux d’apprentissage">
                    <Tabs
                        value={previewLevel}
                        onValueChange={(value) =>
                            chooseLevel(value as LevelCode)
                        }
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            {levels.map((item) => (
                                <TabsTrigger
                                    key={item.code}
                                    value={item.code}
                                    disabled={isSaving}
                                    className="w-full"
                                >
                                    {item.code}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </section>

                <section className="mt-12" aria-labelledby="program-heading">
                    <div className="mb-6 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                Parcours · {previewLevel}
                            </p>
                            <h2
                                id="program-heading"
                                className="mt-2 font-display text-3xl font-semibold tracking-tight"
                            >
                                Ton programme
                            </h2>
                        </div>
                        <p className="shrink-0 text-sm text-muted-foreground">
                            {String(modules.length).padStart(2, "0")}{" "}
                            {modules.length > 1 ? "modules" : "module"}
                        </p>
                    </div>

                    {selectedLevel === null && (
                        <p className="mb-5 text-sm text-muted-foreground">
                            Sélectionne un niveau pour accéder à tes leçons.
                        </p>
                    )}

                    {activeModule ? (
                        <div className="min-w-0">
                            {/* Sélecteur unique : même fonctionnement sur mobile et desktop. */}
                            <Select
                                value={activeModule.id}
                                onValueChange={(id) => setChosenModuleId(id)}
                            >
                                <SelectTrigger
                                    aria-label="Choisir un module"
                                    className="
        !h-auto w-full min-w-0
        rounded-xl
        border-primary/30
        bg-primary/10
        px-4 py-4
        text-left
        shadow-sm
        transition-colors
        hover:border-primary/50
        hover:bg-primary/15
        focus-visible:ring-primary/30
        sm:px-6 sm:py-5
        [&>svg]:text-primary
    "
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
                                        <span className="shrink-0 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                                            {String(
                                                activeModuleIndex + 1,
                                            ).padStart(2, "0")}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                                                Module{" "}
                                                {String(
                                                    activeModuleIndex + 1,
                                                ).padStart(2, "0")}
                                            </p>

                                            <div className="mt-1 truncate font-display text-base font-semibold text-foreground sm:text-xl">
                                                <SelectValue placeholder="Choisir un module" />
                                            </div>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {activeModule.lessons.length}{" "}
                                                {activeModule.lessons.length > 1
                                                    ? "leçons"
                                                    : "leçon"}
                                            </p>
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    className="max-h-[min(420px,60dvh)] min-w-[var(--radix-select-trigger-width)]"
                                >
                                    {modules.map((module, index) => (
                                        <SelectItem
                                            key={module.id}
                                            value={module.id}
                                            className="py-3"
                                        >
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>{" "}
                                            <span className="ml-2 font-medium">
                                                {module.title}
                                            </span>
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                · {module.lessons.length} leçons
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Une seule liste : celle du module sélectionné. */}
                            <div
                                className="mt-5 max-h-[min(590px,65dvh)] min-h-0 overflow-y-auto overscroll-contain pr-1 sm:mt-7 sm:pr-2"
                                aria-label={`Leçons du module ${activeModule.title}`}
                            >
                                {activeModule.lessons.length > 0 ? (
                                    <ol className="overflow-hidden rounded-xl border border-border bg-card">
                                        {activeModule.lessons.map(
                                            (lesson, lessonIndex) => {
                                                const isReady =
                                                    lesson.available;
                                                const isCompleted =
                                                    lesson.read &&
                                                    isReady;
                                                const lessonNumber = `${activeModuleIndex + 1}.${lessonIndex + 1}`;
                                                const isLast =
                                                    lessonIndex ===
                                                    activeModule.lessons
                                                        .length -
                                                        1;

                                                return (
                                                    <li
                                                        key={lesson.id}
                                                        aria-disabled={!isReady}
                                                        className={cn(
                                                            "group relative flex min-w-0 items-center gap-4 px-4 py-4 transition-colors sm:gap-5 sm:px-6 sm:py-5",
                                                            !isLast &&
                                                                "border-b border-border/70",
                                                            isReady
                                                                ? "hover:bg-muted/40"
                                                                : "cursor-not-allowed select-none bg-muted/30 opacity-55 grayscale",
                                                        )}
                                                    >
                                                        {/* Pastille d'état */}
                                                        <span
                                                            className={cn(
                                                                "flex size-10 shrink-0 items-center justify-center rounded-full border",
                                                                isCompleted &&
                                                                    "border-primary/30 bg-primary/10 text-primary",
                                                                isReady &&
                                                                    !isCompleted &&
                                                                    "border-primary bg-primary text-primary-foreground",
                                                                !isReady &&
                                                                    "border-border bg-background text-muted-foreground",
                                                            )}
                                                            aria-hidden="true"
                                                        >
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="size-5" />
                                                            ) : isReady ? (
                                                                <PlayCircle className="size-5" />
                                                            ) : (
                                                                <LockKeyhole className="size-4" />
                                                            )}
                                                        </span>

                                                        {/* Contenu */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                                <h3
                                                                    className={cn(
                                                                        "text-sm font-semibold leading-snug sm:text-base",
                                                                        isReady
                                                                            ? "text-foreground group-hover:text-primary"
                                                                            : "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {
                                                                        lesson.title
                                                                    }
                                                                </h3>
                                                                <span className="text-xs tabular-nums text-muted-foreground">
                                                                    Leçon{" "}
                                                                    {
                                                                        lessonNumber
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                                                {
                                                                    lesson.category
                                                                }
                                                            </p>

                                                            {isCompleted &&
                                                                lesson.bestScore !==
                                                                    null &&
                                                                lesson.quizLength !==
                                                                    null && (
                                                                    <div className="mt-3 flex items-center gap-3">
                                                                        <div
                                                                            className="h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:w-32"
                                                                            role="progressbar"
                                                                            aria-valuemin={
                                                                                0
                                                                            }
                                                                            aria-valuemax={
                                                                                lesson.quizLength
                                                                            }
                                                                            aria-valuenow={
                                                                                lesson.bestScore
                                                                            }
                                                                            aria-label="Meilleur score"
                                                                        >
                                                                            <div
                                                                                className="h-full rounded-full bg-primary"
                                                                                style={{
                                                                                    width: `${(lesson.bestScore / lesson.quizLength) * 100}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs font-medium text-foreground">
                                                                            Meilleur
                                                                            score
                                                                            :{" "}
                                                                            {
                                                                                lesson.bestScore
                                                                            }
                                                                            /
                                                                            {
                                                                                lesson.quizLength
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>

                                                        {/* Action */}
                                                        {isReady ? (
                                                            <Button
                                                                asChild
                                                                variant={
                                                                    isCompleted
                                                                        ? "outline"
                                                                        : "default"
                                                                }
                                                                size="sm"
                                                                className="shrink-0"
                                                            >
                                                                <Link
                                                                    href={lessonShow(
                                                                        {
                                                                            module:
                                                                                activeModule.id,
                                                                            lesson:
                                                                                lesson.id,
                                                                        },
                                                                    )}
                                                                >
                                                                    <span className="hidden sm:inline">
                                                                        {isCompleted
                                                                            ? "Revoir"
                                                                            : "Commencer"}
                                                                    </span>
                                                                    <span className="sr-only sm:hidden">
                                                                        {isCompleted
                                                                            ? "Revoir"
                                                                            : "Commencer"}{" "}
                                                                        la leçon{" "}
                                                                        {
                                                                            lesson.title
                                                                        }
                                                                    </span>
                                                                    <ArrowRight className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <span
                                                                className="pointer-events-none inline-flex shrink-0 items-center rounded-full border border-dashed border-border bg-transparent px-2.5 py-1 text-xs text-muted-foreground"
                                                                aria-label="Leçon à venir"
                                                            >
                                                                <span className="hidden sm:inline">
                                                                    Bientôt
                                                                    disponible
                                                                </span>
                                                                <span className="sm:hidden">
                                                                    Bientôt
                                                                </span>
                                                            </span>
                                                        )}
                                                    </li>
                                                );
                                            },
                                        )}
                                    </ol>
                                ) : (
                                    <p className="py-10 text-center text-sm text-muted-foreground">
                                        Les leçons de ce module arrivent
                                        bientôt.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="border-t border-border py-10 text-sm text-muted-foreground">
                            Aucun module disponible pour ce niveau pour le
                            moment.
                        </p>
                    )}
                </section>
            </main>
        </>
    );
}
