import { Head } from '@inertiajs/react';
import Hero from './partials/hero';
import LearningUniverses from './partials/learning-universes';
import OralPractice from './partials/oral-practice';
import PromiseSection from './partials/promise';
import PlatformPreview from './partials/platform-preview';
import LearningPath from './partials/learning-path';
import TrustSection from './partials/trust-section';
import FAQ from './partials/faq';
import CTA from './partials/cta';

export default function Home() {
    return (
        <>
            <Head title="CharlesAcademy — Apprendre l’allemand" />
            <Hero />
            <PromiseSection />
            <LearningUniverses />
            <OralPractice />
            <PlatformPreview />
            <LearningPath />
            <TrustSection />
            <FAQ />
            <CTA />
        </>
    );
}
