/**
 * Types du parcours étudiant — alignés sur la base (levels, modules,
 * lessons, lesson_progress) via LearnController.
 */

export type LevelCode = 'A1' | 'A2' | 'B1' | 'B2';

export type LearnLesson = {
    /** Slug de la leçon. */
    id: string;
    title: string;
    /** Description courte (ou nom du module en secours). */
    category: string;
    /** Leçon publiée et ouverte. */
    available: boolean;
    /** Marquée « Lu » par l'apprenant. */
    read: boolean;
    /** Meilleur score de quiz (null = pas de quiz ou non tenté). */
    bestScore: number | null;
    /** Nombre de questions du quiz (null = leçon sans quiz). */
    quizLength: number | null;
};

export type LearnModule = {
    /** Slug du module. */
    id: string;
    title: string;
    lessons: LearnLesson[];
};

export type LearnLevel = {
    code: LevelCode;
    label: string;
    modules: LearnModule[];
};
