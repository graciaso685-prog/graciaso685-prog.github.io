# graciaso685-prog.github.io

Site du studio **Studiom** : https://graciaso685-prog.github.io/
Appli d'administration : https://studiom-admin.github.io/ (dépôt studiom-admin/studiom-admin.github.io)

| Fichier | Rôle |
|---|---|
| `index.html`, `site-texts.js` | Le site (8 langues) |
| `app/index.html` | L'appli Studiom installable, **générée** par `python3 build-app.py` à partir de `index.html` (à relancer après chaque modification du site) |
| `glimmer-maze/` | Le jeu Glimmer Maze (source : `glimmer-maze/src/game.html`, puis `python3 build.py`) |
| `privacy.html` | Confidentialité du site |
| `pouls/privacy.html` | Politique de confidentialité de Pouls |
| `admin/` | Redirection vers l'appli admin (studiom-admin.github.io) |
| `firebase-config.js` | Configuration Firebase (vide = rien n'est envoyé) |
| `studiom-fb.js` | Passerelle légère vers Firestore, utilisée par le site et Glimmer Maze |
| `firestore.rules` | Règles de sécurité à publier dans la console Firebase |
| `manifest.webmanifest`, `sw.js`, `icons/`, `brand/` | Installation, hors connexion, logos |
| `.well-known/assetlinks.json`, `.nojekyll` | Vérification de l'appli Android Glimmer Maze (ne pas supprimer) |

Les pages légales de Merge it et le jeu Glimmer Maze sont dans le dépôt `number--merge-privacy`.

## Mise en route de Firebase

1. Console Firebase → créer un projet (ex. `studiom`).
2. **Build → Firestore Database** → créer la base (mode production, région proche, ex. `europe-west`).
3. **Firestore → Règles** → coller le contenu de `firestore.rules` → Publier.
4. **Build → Authentication** → Commencer → activer **Google**.
5. **Authentication → Paramètres → Domaines autorisés** → ajouter `graciaso685-prog.github.io`.
6. **Paramètres du projet → Vos applications → Web (</>)** → copier `apiKey`, `authDomain`, `projectId`, `appId` dans `firebase-config.js`.
7. Ouvrir https://studiom-admin.github.io/, se connecter : l'écran affiche ton UID. Dans Firestore, créer la collection `admins` avec un document dont l'ID est cet UID (aucun champ nécessaire).
