# Fiche 02 — sécurité avant production

État : filtrage du MDX, accès aux leçons et dépendance pnpm corrigés ; contrôles d'environnement de production encore à faire sur la cible.

## Risque majeur : MDX exécutable

`MdxContent` exécute `evaluate(source)` sur le contenu de la base directement dans le navigateur des étudiants. Le formulaire admin accepte une chaîne MDX pouvant contenir du JavaScript. La [documentation MDX](https://mdxjs.com/packages/mdx/) précise qu'`evaluate` exécute du JavaScript et n'est adapté qu'à un contenu de confiance. L'accès admin réduit l'exposition, mais une erreur de publication ou un compte compromis suffit pour introduire du code exécuté chez tous les étudiants qui ouvrent la leçon. Une simple liste de composants React autorisés ne neutralise pas les expressions JavaScript MDX.

- [x] Traiter le contenu éditorial comme non fiable au rendu : un plugin valide l'AST avant `evaluate`, autorise seulement `Callout` et `LetterGrid` avec attributs statiques, et refuse JavaScript, HTML et liens dangereux. Le même filtre couvre l'aperçu admin.
- [x] Préserver l'ancienne leçon Alphabet : son bloc `<style>` + grille JSX précise est remplacé avant compilation par `<LetterGrid />`, qui affiche les 30 lettres et leurs noms français. Le texte autour est conservé ; le reste du MDX passe toujours par la validation. Cinq tests ciblés couvrent le rendu et le refus de JavaScript hors de ce bloc ou dans un autre bloc de style.
- [ ] Examiner les autres contenus stockés : les anciens documents non conformes afficheront une erreur au lieu de s'exécuter. La base SQLite locale ne contient pas le bloc Alphabet montré dans l'éditeur ; celui-ci peut être non enregistré ou venir d'une autre base.

## Autorisations et surface d'attaque

- [x] Corriger l'appartenance leçon/module des routes étudiant (`routes/learner.php`) ; les tests couvrent lecture, correction, score et progression.
- [x] Vérifier que la révocation du rôle étudiant bloque la page et la soumission du quiz dès la requête suivante. Les routes admin sont regroupées sous `auth`, `verified`, rôle et permission ; les tests admin existants vérifient les refus d'accès. La révocation d'une permission du tableau de bord est aussi testée.
- [ ] Ajouter une limitation adaptée aux endpoints quiz si nécessaire pour réduire l'abus et les appels répétés. Le login et les passkeys disposent déjà de limiteurs dans `FortifyServiceProvider`.
- [x] Réduire `auth.user` à une liste explicite des champs utilisés par l'interface.

## Contrôles de déploiement

- [ ] Vérifier sur la cible `APP_ENV=production`, `APP_DEBUG=false`, URL/HTTPS, cookies `Secure` et `SameSite`, origine des passkeys, email de vérification et réinitialisation, configuration des files et du cache.
- [x] Exécuter `composer audit` : aucune alerte.
- [x] Traiter l'alerte `pnpm audit` : `shell-quote@1.9.0` sous `concurrently`, avis [GHSA-pqg4-j6r4-53mv](https://github.com/advisories/GHSA-pqg4-j6r4-53mv). L'autorisation a été donnée ; `concurrently` est en `devDependencies`, la résolution pnpm `shell-quote: ^1.11.0` installe 1.12.0, et l'audit indique zéro vulnérabilité. L'installation figée, les tests et le build passent.
- [ ] Vérifier migrations, sauvegardes, restauration, journaux sans secrets, compte admin initial et procédure de révocation. Ne publier qu'après les fiches 01 et 03.

## Terminé quand

Le contenu éditorial ne peut plus exécuter du JavaScript non approuvé chez les étudiants ; les accès croisés échouent ; la configuration de production et les dépendances ont été vérifiées sur la cible.
