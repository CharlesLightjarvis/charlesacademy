export type Level = 'A1' | 'A2' | 'B1' | 'B2';

type Lesson = {
    id: string;
    title: string;
    category: string;
    introduction: string;
    outcomes: string[];
    activities: string[];
    example?: {
        text: string;
        translation?: string;
        note: string;
    };
};

type CourseModule = {
    id: string;
    title: string;
    lessons: Lesson[];
};

export type Course = {
    level: Level;
    label: string;
    modules: CourseModule[];
};

/* ============================================================
   LOCAL COURSE DATA
   No Laravel props required.
============================================================ */

export const courses: Course[] = [
    {
        level: 'A1',
        label: 'Débutant',
        modules: [
            {
                id: 'a1-1',
                title: 'A1.1 · Premiers contacts',
                lessons: [
                    {
                        id: 'alphabet',
                        title: "L'alphabet allemand",
                        category: 'Prononciation',
                        introduction:
                            "Découvre comment se prononcent les lettres de l'alphabet allemand et entraîne-toi à reconnaître les sons particuliers.",
                        outcomes: [
                            'Prononcer les 26 lettres de base',
                            'Reconnaître ä, ö, ü et ß',
                            'Différencier ch, sch, ei et ie',
                            'Épeler son prénom et son nom',
                        ],
                        activities: [
                            'Écouter les lettres et répéter',
                            'Comparer les sons proches',
                            'Associer des sons aux lettres',
                            'Épeler des mots simples',
                        ],
                        example: {
                            text: 'A – B – C – D – E',
                            note: 'Les noms de plusieurs lettres diffèrent du français. La leçon permet de les écouter et de les répéter.',
                        },
                    },
                    {
                        id: 'greetings',
                        title: 'Saluer en allemand',
                        category: 'Communication',
                        introduction:
                            'Apprends à saluer, demander des nouvelles et prendre congé selon la situation.',
                        outcomes: [
                            'Utiliser Guten Morgen et Guten Tag',
                            'Saluer de manière formelle ou informelle',
                            'Demander comment va une personne',
                            'Prendre congé',
                        ],
                        activities: [
                            'Écouter des dialogues',
                            'Choisir les bonnes salutations',
                            'Compléter un échange',
                        ],
                        example: {
                            text: 'Guten Morgen! Wie geht es Ihnen?',
                            translation: 'Bonjour ! Comment allez-vous ?',
                            note: 'Ihnen est ici utilisé pour s’adresser poliment à une personne.',
                        },
                    },
                    {
                        id: 'introductions',
                        title: 'Se présenter',
                        category: 'Expression',
                        introduction:
                            'Apprends à présenter ton identité et à poser des questions simples à ton interlocuteur.',
                        outcomes: [
                            'Dire son prénom et son nom',
                            'Exprimer son origine',
                            'Donner son âge',
                            'Poser des questions de présentation',
                        ],
                        activities: [
                            'Compléter un dialogue',
                            'Construire une présentation',
                            'Simuler une rencontre',
                        ],
                        example: {
                            text: 'Ich heiße Sara und komme aus Tunesien.',
                            translation:
                                'Je m’appelle Sara et je viens de Tunisie.',
                            note: 'Heißen sert notamment à indiquer comment on s’appelle.',
                        },
                    },
                    {
                        id: 'numbers',
                        title: 'Les nombres et les informations personnelles',
                        category: 'Vocabulaire',
                        introduction:
                            'Apprends à comprendre et utiliser les nombres dans des échanges courants.',
                        outcomes: [
                            'Compter en allemand',
                            'Dire son âge',
                            'Comprendre un numéro de téléphone',
                            'Donner une information chiffrée',
                        ],
                        activities: [
                            'Écouter des nombres',
                            'Associer nombres écrits et entendus',
                            'Compléter des coordonnées',
                        ],
                        example: {
                            text: 'Ich bin zwanzig Jahre alt.',
                            translation: 'J’ai vingt ans.',
                            note: 'Pour exprimer l’âge en allemand, on utilise le verbe sein.',
                        },
                    },
                ],
            },
            {
                id: 'a1-2',
                title: 'A1.2 · Vie quotidienne',
                lessons: [
                    {
                        id: 'family',
                        title: 'Parler de sa famille',
                        category: 'Vocabulaire',
                        introduction:
                            'Découvre les mots et les constructions nécessaires pour présenter les membres de ta famille.',
                        outcomes: [
                            'Nommer les membres de la famille',
                            'Employer mein et meine',
                            'Présenter une personne',
                        ],
                        activities: [
                            'Compléter un arbre familial',
                            'Associer personnes et descriptions',
                            'Présenter sa famille',
                        ],
                        example: {
                            text: 'Das ist meine Schwester.',
                            translation: 'C’est ma sœur.',
                            note: 'Meine est ici la forme possessive employée avec Schwester.',
                        },
                    },
                    {
                        id: 'shopping',
                        title: 'Faire des achats',
                        category: 'Communication',
                        introduction:
                            'Apprends à demander un produit, parler des prix et formuler des demandes polies.',
                        outcomes: [
                            'Demander un prix',
                            'Nommer des produits usuels',
                            'Formuler une commande',
                            'Remercier un commerçant',
                        ],
                        activities: [
                            'Lire une liste de prix',
                            'Écouter une commande',
                            'Simuler un achat',
                        ],
                        example: {
                            text: 'Ich möchte einen Kaffee, bitte.',
                            translation:
                                'Je voudrais un café, s’il vous plaît.',
                            note: 'Möchte permet de formuler une demande polie.',
                        },
                    },
                ],
            },
        ],
    },
    {
        level: 'A2',
        label: 'Élémentaire',
        modules: [
            {
                id: 'a2-1',
                title: 'Expériences et situations courantes',
                lessons: [
                    {
                        id: 'perfect',
                        title: 'Raconter au passé avec le Perfekt',
                        category: 'Grammaire',
                        introduction:
                            'Apprends à raconter des événements passés grâce au Perfekt.',
                        outcomes: [
                            'Former les participes passés usuels',
                            'Choisir entre haben et sein',
                            'Raconter son week-end',
                        ],
                        activities: [
                            'Transformer des phrases',
                            'Compléter des récits',
                            'Raconter une expérience',
                        ],
                        example: {
                            text: 'Ich habe gestern Deutsch gelernt.',
                            translation: 'J’ai étudié l’allemand hier.',
                            note: 'Le participe passé gelernt se place à la fin de la proposition.',
                        },
                    },
                    {
                        id: 'because',
                        title: 'Exprimer une raison avec weil',
                        category: 'Grammaire',
                        introduction:
                            'Apprends à expliquer pourquoi une action a lieu.',
                        outcomes: [
                            'Utiliser weil',
                            'Placer le verbe en fin de subordonnée',
                            'Justifier ses choix',
                        ],
                        activities: [
                            'Relier des phrases',
                            'Compléter des justifications',
                            'Expliquer un projet',
                        ],
                        example: {
                            text: 'Ich lerne Deutsch, weil ich in Berlin arbeiten möchte.',
                            translation:
                                'J’apprends l’allemand parce que je voudrais travailler à Berlin.',
                            note: 'Avec weil, le verbe conjugué de la subordonnée se place à la fin.',
                        },
                    },
                ],
            },
        ],
    },
    {
        level: 'B1',
        label: 'Intermédiaire',
        modules: [
            {
                id: 'b1-1',
                title: 'Expression et autonomie',
                lessons: [
                    {
                        id: 'opinions',
                        title: 'Exprimer son opinion',
                        category: 'Expression',
                        introduction:
                            'Apprends à développer un point de vue et à le justifier clairement.',
                        outcomes: [
                            'Introduire une opinion',
                            'Donner des arguments',
                            'Exprimer un désaccord',
                        ],
                        activities: [
                            'Analyser des arguments',
                            'Construire une réponse',
                            'Simuler une discussion',
                        ],
                        example: {
                            text: 'Meiner Meinung nach ist das eine gute Idee.',
                            translation: 'À mon avis, c’est une bonne idée.',
                            note: 'Meiner Meinung nach introduit une opinion personnelle.',
                        },
                    },
                    {
                        id: 'hypotheses',
                        title: 'Exprimer des hypothèses',
                        category: 'Grammaire',
                        introduction:
                            'Découvre comment utiliser le Konjunktiv II pour parler de situations hypothétiques.',
                        outcomes: [
                            'Employer würde',
                            'Formuler une condition',
                            'Exprimer des souhaits',
                        ],
                        activities: [
                            'Compléter des hypothèses',
                            'Reformuler des souhaits',
                            'Résoudre un problème imaginaire',
                        ],
                        example: {
                            text: 'Ich hätte gern mehr Zeit.',
                            translation: 'J’aimerais avoir plus de temps.',
                            note: 'Hätte est une forme du Konjunktiv II de haben.',
                        },
                    },
                ],
            },
        ],
    },
    {
        level: 'B2',
        label: 'Avancé',
        modules: [
            {
                id: 'b2-1',
                title: 'Analyse et argumentation',
                lessons: [
                    {
                        id: 'argumentation',
                        title: 'Argumenter avec nuance',
                        category: 'Expression',
                        introduction:
                            'Apprends à confronter des idées et à développer une argumentation structurée.',
                        outcomes: [
                            'Présenter deux points de vue',
                            'Formuler des contre-arguments',
                            'Nuancer une conclusion',
                        ],
                        activities: [
                            'Comparer des arguments',
                            'Rédiger un avis nuancé',
                            'Préparer un débat',
                        ],
                        example: {
                            text: 'Einerseits ist es praktisch, andererseits ist es teuer.',
                            translation:
                                'D’un côté, c’est pratique ; de l’autre, c’est cher.',
                            note: 'Einerseits ... andererseits met en opposition deux aspects d’un sujet.',
                        },
                    },
                    {
                        id: 'synthesis',
                        title: 'Analyser et synthétiser des documents',
                        category: 'Compréhension',
                        introduction:
                            'Apprends à dégager les informations essentielles de plusieurs documents.',
                        outcomes: [
                            'Identifier une thèse',
                            'Distinguer les faits des opinions',
                            'Rédiger une synthèse',
                        ],
                        activities: [
                            'Lire deux documents',
                            'Comparer leurs arguments',
                            'Rédiger une synthèse courte',
                        ],
                        example: {
                            text: 'Zusammenfassend lässt sich sagen, dass ...',
                            translation: 'En résumé, on peut dire que...',
                            note: 'Cette structure introduit une synthèse ou une conclusion.',
                        },
                    },
                ],
            },
        ],
    },
];
