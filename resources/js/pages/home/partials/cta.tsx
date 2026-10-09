import { ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";

type FinalCTAProps = {
    primaryHref?: string;
    secondaryHref?: string;
    enrollmentOpen?: boolean;
};

export default function FinalCTA({
    primaryHref = "/register",
    secondaryHref = "#parcours",
    enrollmentOpen = false,
}: FinalCTAProps) {
    return (
        <section
            id="commencer"
            aria-labelledby="final-cta-heading"
            className=" px-4 py-12 sm:px-8 lg:py-20"
        >
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#038259] px-6 py-14 text-center text-white sm:rounded-[3rem] sm:px-12 sm:py-20 lg:px-20 lg:py-24">
                {/* DECORATIVE TYPOGRAPHY */}

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <span className="absolute -left-16 top-4 -rotate-12 font-display text-[clamp(7rem,18vw,17rem)] font-semibold leading-none text-white/[0.045] select-none">
                        HALLO
                    </span>

                    <span className="absolute -right-12 bottom-0 rotate-[-10deg] font-display text-[clamp(7rem,19vw,18rem)] font-semibold leading-none text-white/[0.045] select-none">
                        LOS!
                    </span>

                    <div className="absolute left-[10%] top-[20%] size-2 rounded-full bg-white/30" />
                    <div className="absolute right-[12%] top-[25%] size-3 rounded-full border border-white/30" />
                    <div className="absolute bottom-[22%] left-[17%] size-2 rounded-full border border-white/30" />
                </div>

                {/* CONTENT */}

                <div className="relative z-10 mx-auto max-w-5xl">
                    {/* EYEBROW */}

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.15em] text-white/90">
                        <Sparkles className="size-3.5" />
                        TON PROCHAIN CHAPITRE COMMENCE ICI
                    </div>

                    {/* GERMAN MICRO HEADLINE */}

                    <p
                        lang="de"
                        className="mt-8 font-display text-xl font-medium text-[#C8F7DF] sm:text-2xl"
                    >
                        Dein nächstes Kapitel.
                    </p>

                    {/* MAIN HEADLINE */}

                    <h2
                        id="final-cta-heading"
                        className="mx-auto mt-5 max-w-5xl font-display text-[clamp(2.7rem,7vw,6.5rem)] font-semibold leading-[1.05] tracking-tight text-balance"
                    >
                        Et si tout commençait{" "}
                        <span className="relative inline-block">
                            maintenant ?
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 420 24"
                                preserveAspectRatio="none"
                                className="absolute -bottom-2 left-0 h-4 w-full text-[#9AE8BD] sm:h-5"
                            >
                                <path
                                    d="M5 17 C100 3 230 5 415 11"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    </h2>

                    {/* DESCRIPTION */}

                    <p className="mx-auto mt-9 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                        Un mot aujourd'hui. Une phrase demain. Et petit à petit,
                        une nouvelle langue qui devient familière.
                    </p>

                    {/* CTAS */}

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href={enrollmentOpen ? primaryHref : secondaryHref}
                            className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-bold text-[#038259] shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#E8F7EE] hover:shadow-2xl active:translate-y-0 motion-reduce:transform-none sm:w-auto"
                        >
                            {enrollmentOpen
                                ? "Créer mon compte"
                                : "Découvrir les parcours"}

                            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                        </a>

                        {enrollmentOpen && (
                            <a
                                href={secondaryHref}
                                className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-white/35 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
                            >
                                Explorer les niveaux
                                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        )}
                    </div>

                    {/* REASSURANCE */}

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                        {[
                            "Une approche progressive",
                            "Des exemples concrets",
                            "Un apprentissage à ton rythme",
                        ].map((item) => (
                            <span
                                key={item}
                                className="inline-flex items-center gap-2 text-xs font-medium text-white/75 sm:text-sm"
                            >
                                <Check className="size-4 shrink-0 text-[#B8F5D2]" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
