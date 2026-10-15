# Fiche 04 — contrôleurs, rôles et performance

État : le contrôleur étudiant unique a été remplacé par quatre contrôleurs ciblés, un service de lecture du parcours et une action de soumission du quiz. Les routes gardent leurs noms.

## Répartition réalisée

Le `LearnController` rassemble catalogue, sélection du niveau, lecture, progression et correction de quiz. Conserver les groupes de routes par rôle/permission : ils sont lisibles et déjà établis. Séparer par usage HTTP, puis extraire uniquement la logique métier partagée ou testable :

1. `Learner/LearningPathController` : index et changement du niveau.
2. `Learner/LessonController` : affichage d'une leçon.
3. `Learner/LessonReadController` : changement de l'état lu.
4. `Learner/LessonQuizController` : page quiz, correction immédiate et soumission.
5. Service/query de lecture du parcours : modules du niveau, progression, position, représentation limitée des props.
6. Action de soumission du quiz : valider les réponses, calculer les corrections, enregistrer le score et le meilleur score ; ne pas y placer le redirect HTTP.

Les actions Fortify existantes concernent la création/réinitialisation des comptes ; elles ne définissent pas un besoin d'« action par rôle » générique. Le rôle contrôle l'accès à la route ; le service ou l'action réalise une opération métier sous cette autorisation. Garder les `FormRequest` admin et ajouter des requêtes dédiées là où la validation du quiz devient substantielle. Préserver les noms de routes Wayfinder ou régénérer les imports si les actions changent.

## Requêtes et données

`modulesOfLevel()` chargeait toutes les leçons et leurs `quiz.questions` pour afficher seulement `quizLength`, avec leur contenu lourd. Le service sélectionne maintenant les colonnes nécessaires et utilise `withCount('questions')`. La mesure du temps et de la mémoire sur un catalogue réel reste à faire avant tout cache.

`HandleInertiaRequests::share()` calcule toutes les permissions à chaque réponse Inertia. Mesurer le coût ; si nécessaire, ne transmettre que les capacités de navigation utiles ou faire une prop paresseuse compatible avec le besoin de la sidebar.

## Terminé quand

Chaque contrôleur expose une responsabilité claire, les autorisations restent centralisées aux routes/policies ou requêtes, les services/actions sont injectés, et les tests de comportement restent verts. Un relevé avant/après justifie l'optimisation SQL.
