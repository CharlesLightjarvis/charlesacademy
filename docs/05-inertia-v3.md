# Fiche 05 — Inertia v3 et code React

État : client HTTP et flash v3 utilisés pour le quiz ; mesures de props et essai manuel du premier clic encore à faire.

Versions installées : `@inertiajs/react` 3.8.0 et `inertiajs/inertia-laravel` 3.5.1. La documentation officielle v3 est la référence pour les APIs : [CSRF](https://inertiajs.com/docs/v3/security/csrf-protection), [HTTP JSON `useHttp`](https://inertiajs.com/docs/v3/the-basics/http-requests), [formulaires](https://inertiajs.com/docs/v3/the-basics/forms), [props partagées](https://inertiajs.com/docs/v3/data-props/shared-data).

- [x] Employer `useHttp` pour la correction JSON du quiz, comme pour la 2FA ; `useForm` reste utilisé pour la soumission avec redirect Inertia.
- [x] Supprimer la lecture du jeton CSRF depuis le DOM et la balise meta CSRF. Le scénario navigateur après connexion reste à refaire manuellement.
- [x] Distinguer validation métier (`422`), session expirée (`419`), refus d'accès, ressource absente et panne réseau.
- [x] Réduire `auth.user` et les données du parcours aux champs utilisés ; le nombre de questions vient de `withCount`.
- [ ] Mesurer les props réellement lourdes avant d'envisager des props différées ou partielles, avec squelette si elles sont différées.
- [ ] Extraire du composant `quiz.tsx` la gestion d'état et la présentation si cela clarifie la lecture ; garder le flux question → correction → soumission observable et testé.
- [x] Utiliser le [flash Inertia v3](https://inertiajs.com/docs/v3/data-props/flash-data) pour `quizResult` au lieu d'une prop partagée issue de la session ; un test vérifie le score transmis.
- [x] Corriger les écarts de formatage et les imports/fonctions inutilisés détectés par le contrôle global `vp check` ; 122 fichiers sont contrôlés sans avertissement.
- [ ] Mesurer les bundles de plus de 500 kB signalés par le build avant de modifier le découpage du frontend.

Ne pas activer systématiquement les nouveautés v3 (visites instantanées, mises à jour optimistes, polling) : le quiz exige une réponse serveur certaine et la correction ne doit pas apparaître avant validation.
