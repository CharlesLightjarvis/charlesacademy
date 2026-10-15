# Plan de travail avant production

Audit du 15 octobre 2026. Périmètre : Laravel 13.35, Inertia Laravel 3.5.1, React Inertia 3.8.0, Fortify 1.41.0, rôles, parcours étudiant, quiz, tests et contenu MDX. Les versions viennent de `composer.lock` et du paquet installé. Les correctifs applicatifs des fiches 01 à 05 sont maintenant présents dans le répertoire de travail ; les contrôles propres au serveur de production et le prototype vocabulaire restent à faire.

## Ordre proposé

1. [01-quiz-csrf-et-parcours.md](01-quiz-csrf-et-parcours.md) — corriger l'échec au premier clic et sécuriser la progression.
2. [02-securite-avant-production.md](02-securite-avant-production.md) — traiter le MDX et les contrôles de déploiement.
3. [03-schema-et-tests.md](03-schema-et-tests.md) — résoudre l'incohérence UUID et combler les tests utiles.
4. [04-architecture-roles-et-performance.md](04-architecture-roles-et-performance.md) — découper les responsabilités et réduire les requêtes.
5. [05-inertia-v3.md](05-inertia-v3.md) — harmoniser les appels HTTP et les props Inertia.
6. [06-vocabulaire.md](06-vocabulaire.md) — concevoir une expérience de vocabulaire centrée sur l'usage.

## Constats classés

| Priorité | Constat                                                                                                                                                          | Preuve                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Jeton CSRF figé dans le DOM, susceptible de rendre le premier POST JSON invalide après connexion Inertia ; symptôme cohérent avec le rafraîchissement qui répare | `resources/views/app.blade.php:6`, `resources/js/pages/learner/learn/quiz.tsx:108-139`                                                         |
| P0       | MDX administrable exécuté dans le navigateur étudiant par `evaluate` ; risque de JavaScript arbitraire si le contenu ou un compte admin est compromis            | `resources/js/components/learner/mdx-content.tsx:1-37`, `app/Http/Requests/Admin/LessonRequest.php:24-40`                                      |
| P0       | `lesson_progress.user_id` est un entier signé par `foreignId`, alors que `users.id` est UUID ; migration incompatible avec une clé étrangère MySQL/PostgreSQL    | `database/migrations/2026_10_10_213100_create_lesson_progress_table.php:16`, `database/migrations/0001_01_01_000000_create_users_table.php:14` |
| P1       | Les routes étudiant ne vérifient pas que la leçon appartient au module de l'URL ; risque de lecture ou écriture via un parent arbitraire                         | `routes/learner.php:24-36`, `app/Http/Controllers/Learner/LearnController.php:73,113,151,172,209`                                              |
| P1       | Tests étudiant limités à la correction immédiate ; pas de couverture du score, des droits de toutes les routes, de la progression ni du parcours CSRF            | `tests/Feature/Learner/LearnQuizTest.php`                                                                                                      |
| P2       | Le parcours charge tout le contenu des leçons et toutes les questions pour calculer seulement leur nombre ; coût mémoire et SQL à mesurer                        | `app/Http/Controllers/Learner/LearnController.php:278-305`                                                                                     |

Les routes admin ont déjà les garde-fous `auth`, `verified`, rôle et permission ; les `FormRequest` valident les écritures. Les tests admin vérifient plusieurs accès croisés. Ce sont des points solides à conserver pendant le découpage.

## Limites de l'audit

La cause CSRF était cohérente avec le code et a été corrigée, mais le statut `419` du scénario initial n'a pas été capturé sur le navigateur concerné. La suite Laravel complète passe (87 tests, 429 assertions), ainsi que PHPStan, Pint, TypeScript, le contrôle global `vp check` et le build de production. Un test supplémentaire vérifie la conservation d'une progression dans une migration depuis l'ancien schéma SQLite ; un autre vérifie la révocation du rôle étudiant. L'audit Composer et l'audit pnpm ne remontent aucune vulnérabilité après correction de `shell-quote` en version 1.12.0. Le build affiche encore des avertissements sur la taille de certains bundles et sur des directives de dépendances MDX ; ils n'empêchent pas sa réussite. Aucun accès au serveur de production, à ses secrets, journaux, configuration HTTPS ou données réelles n'a été utilisé.
