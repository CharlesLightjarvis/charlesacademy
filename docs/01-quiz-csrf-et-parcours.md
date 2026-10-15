# Fiche 01 — quiz étudiant et erreur au premier clic

État : correctif appliqué. Vérification manuelle du scénario connexion → premier clic encore nécessaire sur le navigateur qui reproduisait le défaut.

## Diagnostic

`quiz.tsx` envoie la correction avec `fetch` et copie `X-CSRF-TOKEN` depuis une balise `<meta>` du document HTML initial. Après connexion, Fortify renouvelle normalement la session ; Inertia peut afficher le quiz sans renouveler le document HTML. Le jeton du DOM ne correspond alors plus à la session. Le `fetch` reçoit vraisemblablement `419`, puis le `catch` masque tout statut sous « La vérification a échoué, réessaie ». Le rechargement crée un nouveau document et un jeton valide. Vérifier dans l'onglet Réseau que la réponse fautive est bien `419` avant de conclure définitivement.

La [documentation CSRF Inertia v3](https://inertiajs.com/docs/v3/security/csrf-protection) demande explicitement d'omettre la balise `csrf-token` sous Laravel et décrit l'envoi automatique de `X-XSRF-TOKEN` depuis le cookie par le client Inertia. La [documentation `useHttp`](https://inertiajs.com/docs/v3/the-basics/http-requests) couvre les réponses JSON et les erreurs `422`.

Un second incident apparaît seulement dans le profil normal du navigateur : une requête Inertia lancée depuis `http://charlesacademy.test` est redirigée vers `https://charlesacademy.test`, puis bloquée comme requête inter-origine. Le même trajet fonctionne en navigation privée. Les requêtes HTTP directes vers Herd répondent en HTTP (`200` sur l'accueil, redirection HTTP vers la connexion sans session et `401` JSON avec les en-têtes Inertia) ; aucune règle du projet ne force HTTPS. La nouvelle trace montre `ajaxRequestInterceptor.ps.js` dans la pile XMLHttpRequest ; ce script est associé à l'extension Requestly. Sa présence ne prouve pas à elle seule qu'elle a produit la redirection : désactiver Requestly sur ce domaine et relever la première réponse avec son en-tête `Location` permettent de le vérifier. Une redirection mémorisée ou une politique HTTPS du profil reste aussi possible. Ajouter des en-têtes CORS à Laravel masquerait la cause sans résoudre le mélange de protocoles. L'`APP_URL` local a été aligné sur `http://charlesacademy.test`.

Le défaut se limite ensuite au lien A1 `alphabet/introduction` ; le lien A2 `grammaire/introduction` fonctionne. Les deux sont produits par le même composant et la même route. Une requête HTTP directe sans session renvoie pour chacun une redirection `302` vers la connexion **en HTTP**. Ce constat renforce la piste d'une règle Requestly ciblée sur `alphabet` ou d'une redirection mémorisée pour cette URL précise ; il ne démontre pas encore laquelle des deux agit dans le navigateur connecté.

## Travail

- [x] Remplacer le `fetch` de correction par `useHttp` Inertia v3, déjà utilisé dans `resources/js/hooks/use-two-factor-auth.ts`. Les erreurs `422`, `419`, `401/403`, `404` et réseau ont des messages distincts.
- [x] Supprimer le `<meta name="csrf-token">` de `resources/views/app.blade.php` après vérification des autres consommateurs. La protection CSRF Laravel reste active.
- [ ] Vérifier le scénario connexion → navigation Inertia → première réponse sans rafraîchissement, puis les réponses suivantes et l'expiration réelle de session.
- [ ] Dans le profil normal, désactiver Requestly pour `charlesacademy.test`, puis relever le statut et l'en-tête `Location` de la première requête qui passe de HTTP à HTTPS si l'incident persiste. Tester ensuite les données du site et les politiques HTTPS du navigateur.
- [x] Ajouter `scopeBindings()` sur les routes imbriquées étudiant et couvrir lecture, correction, score et bascule « Lu ».
- [x] Couvrir la soumission du quiz : score et meilleur score, résultat flash, réponse manquante ou étrangère, quiz inactif, utilisateur sans rôle, leçon inactive. La matrice complète des permissions reste à vérifier sur la cible.
- [ ] Décider si la correction immédiate doit révéler la bonne réponse avant la soumission finale : l'API le fait actuellement. Documenter le choix pédagogique et les limites anti-triche.

## Terminé quand

Le premier POST fonctionne après connexion sans rafraîchissement ; une vraie expiration de session reçoit un message distinct ; le score et les accès imbriqués sont testés. Exécuter les tests ciblés, puis demander l'exécution de la suite complète conformément aux règles du projet.
