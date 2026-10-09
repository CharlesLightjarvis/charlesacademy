import { Head } from "@inertiajs/react";
import Hero from "./partials/hero";
import LearningUniverses from "./partials/learning-universes";
import PromiseSection from "./partials/promise";
import TeachingMethod from "./partials/teaching-method";
import PlatformPreview from "./partials/platform-preview";
import LearningPath from "./partials/learning-path";
import TrustSection from "./partials/trust-section";
import FAQ from "./partials/faq";
import CTA from "./partials/cta";

export default function Home() {
    return (
        <>
            <Head title="CharlesAcademy — Apprendre l’allemand" />
            <Hero />
            <PromiseSection />
            <LearningUniverses />
            <TeachingMethod />
            <PlatformPreview />
            <LearningPath />
            <TrustSection />
            <FAQ />
            <CTA />
        </>
    );
}
