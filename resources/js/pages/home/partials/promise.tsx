import { BookOpen, Compass, Pencil, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const promises = [
    {
        number: "01",
        icon: BookOpen,
        title: "Comprendre",
        description:
            "Des explications claires et des exemples concrets pour saisir chaque notion.",
    },
    {
        number: "02",
        icon: Pencil,
        title: "Pratiquer",
        description:
            "Des exercices pour essayer, se tromper et transformer la théorie en réflexes.",
    },
    {
        number: "03",
        icon: TrendingUp,
        title: "Progresser",
        description:
            "Un apprentissage étape par étape, sans perdre le fil de ce que tu sais déjà.",
    },
    {
        number: "04",
        icon: Compass,
        title: "Garder le cap",
        description:
            "La liberté de revenir sur une leçon et d’avancer à ton propre rythme.",
    },
] as const;

export default function PromiseSection() {
    return (
        <section
            id="promesse"
            aria-labelledby="promise-heading"
            className="relative border-t border-border/60 px-5 py-16 sm:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-5xl text-center">
                    <h2
                        id="promise-heading"
                        className="mt-6 font-display text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
                    >
                        L’allemand devient{" "}
                        <span className="inline-block -rotate-2 rounded-xl bg-primary px-3 py-1 text-primary-foreground shadow-lg shadow-primary/15">
                            plus simple.
                        </span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
                        Comprendre, essayer, avancer : quatre repères pour
                        apprendre avec confiance, à ton rythme.
                    </p>
                </div>

                <div className="mx-auto mt-20 grid max-w-6xl gap-x-20 gap-y-12 lg:grid-cols-2 lg:gap-y-16">
                    {promises.map((promise) => {
                        const Icon = promise.icon;

                        return (
                            <article
                                key={promise.number}
                                className="flex items-start gap-5 border-t border-border/70 pt-7 sm:gap-7"
                            >
                                <Card
                                    variant="floating"
                                    className="size-16 shrink-0 items-center justify-center gap-0 p-0 text-primary sm:size-20"
                                >
                                    <Icon
                                        className="size-7 sm:size-9"
                                        strokeWidth={1.75}
                                        aria-hidden="true"
                                    />
                                </Card>
                                <div className="min-w-0">
                                    <span className="text-xs font-semibold tracking-widest text-primary">
                                        {promise.number}
                                    </span>
                                    <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">
                                        {promise.title}
                                    </h3>
                                    <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                                        {promise.description}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
