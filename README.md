# Fitness & Bien-être Tracker

Ce projet est une application complète de suivi de fitness et de bien-être, développée avec NestJS pour le backend (API RESTful), MongoDB comme base de données, et Angular pour le frontend (interface utilisateur). Il inclut des fonctionnalités de suivi d'entraînements, de nutrition, et d'objectifs, avec des capacités d'analyse.

## Technologies Utilisées

**Backend:**
*   **NestJS**: Framework Node.js progressif pour des applications côté serveur efficaces et évolutives.
*   **MongoDB**: Base de données NoSQL pour le stockage des données.
*   **Mongoose**: Modélisation d'objets MongoDB pour Node.js.
*   **Passport & JWT**: Authentification et autorisation sécurisées.
*   **Winston**: Pour la gestion des logs.
*   **Class-validator & Pipes**: Pour la validation des données.
*   **Jest**: Pour les tests unitaires et e2e.

**Frontend:**
*   **Angular**: Framework pour la construction d'applications web dynamiques.
*   **TypeScript**: Langage de programmation pour le développement Angular.
*   **SCSS**: Pour des styles CSS avancés.
*   **Chart.js & ng2-charts**: Pour la visualisation des données (graphiques de progression).
*   **Reactive Forms**: Pour la gestion des formulaires dynamiques.
*   **Animations Angular**: Pour une expérience utilisateur fluide.

**Infrastructure & DevOps:**
*   **Docker**: Pour la conteneurisation des applications.
*   **Docker Compose**: Pour la gestion multi-conteneurs.
*   **GitHub Actions**: Pour l'intégration et le déploiement continus (CI/CD).

## Structure du Projet

Le projet est divisé en deux répertoires principaux:

*   `backend/`: Contient l'application NestJS.
*   `frontend/`: Contient l'application Angular.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants:

*   [Node.js](https://nodejs.org/en/download/) (version 18 ou supérieure)
*   [npm](https://www.npmjs.com/get-npm) (généralement inclus avec Node.js)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (inclut Docker Engine et Docker Compose)
*   [Angular CLI](https://angular.io/cli) (installez-le globalement: `npm install -g @angular/cli`)

## Installation et Démarrage

Suivez ces étapes pour configurer et exécuter le projet localement.

### 1. Cloner le dépôt

```bash
git clone <URL_DU_DEPOT>
cd fitness-tracker
```

### 2. Configuration du Backend (NestJS)

Naviguez vers le répertoire `backend` et installez les dépendances:

```bash
cd backend
npm install
```

**Variables d'environnement:**

Créez un fichier `.env` à la racine du répertoire `backend` avec les variables suivantes:

```
MONGO_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_super_secret_jwt_key_here
```

*   `MONGO_URI`: L'URI de connexion à votre base de données MongoDB. Si vous utilisez Docker Compose, l'URI sera `mongodb://mongodb:27017/fitness-tracker`.
*   `JWT_SECRET`: Une chaîne secrète forte pour signer les tokens JWT. Changez `your_super_secret_jwt_key_here` par une valeur unique et complexe.

Pour démarrer le serveur de développement NestJS:

```bash
npm run start:dev
```

L'API sera disponible à `http://localhost:3000`.

### 3. Configuration du Frontend (Angular)

Naviguez vers le répertoire `frontend` et installez les dépendances:

```bash
cd ../frontend
npm install
```

Pour démarrer l'application Angular en mode développement:

```bash
ng serve
```

L'application frontend sera disponible à `http://localhost:4200`.

### 4. Démarrage avec Docker Compose (Recommandé)

Pour une configuration plus simple et pour exécuter le backend et le frontend dans des conteneurs Docker, utilisez Docker Compose.

Assurez-vous d'être à la racine du projet (`fitness-tracker/`).

```bash
docker-compose up --build
```

Cela va:
*   Construire les images Docker pour le backend et le frontend.
*   Démarrer un conteneur MongoDB.
*   Démarrer le conteneur du backend (accessible sur le port 3000).
*   Démarrer le conteneur du frontend (accessible sur le port 80).

Une fois les conteneurs démarrés, vous pouvez accéder à l'application via `http://localhost` dans votre navigateur.

Pour arrêter les conteneurs:

```bash
docker-compose down
```

## Fonctionnalités

*   **Authentification Utilisateur**: Inscription, connexion, déconnexion avec JWT.
*   **Suivi d'Entraînements**: Enregistrement des séances, types d'exercices, notes.
*   **Suivi Nutritionnel**: Enregistrement des repas, calcul des macros (calories, protéines, glucides, lipides).
*   **Gestion des Objectifs**: Définition et suivi des objectifs de fitness.
*   **Analytics**: (À implémenter plus en détail dans le frontend) Visualisation de la progression via des graphiques.

## Tests

### Backend (NestJS)

Pour exécuter les tests unitaires et e2e du backend:

```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend (Angular)

Pour exécuter les tests du frontend:

```bash
cd frontend
ng test
```

## CI/CD (GitHub Actions)

Un workflow GitHub Actions est configuré dans `.github/workflows/ci.yml`.

Ce workflow s'exécute sur chaque `push` et `pull_request` sur la branche `main`.
Il effectue les étapes suivantes:

1.  **Build Backend**: Installe les dépendances et construit l'application NestJS.
2.  **Run Backend Tests**: Exécute les tests unitaires et e2e du backend.
3.  **Build Frontend**: Installe les dépendances et construit l'application Angular en mode production.
4.  **Run Frontend Tests**: Exécute les tests du frontend.

## Améliorations Futures Possibles

*   **Analytics Avancées**: Intégration de bibliothèques de graphiques plus sophistiquées pour des visualisations de données plus riches (ex: progression des poids, tendances nutritionnelles).
*   **Challenges Communautaires**: Ajout de fonctionnalités sociales pour les défis entre utilisateurs.
*   **Notifications**: Système de notifications pour les rappels d'entraînement ou les mises à jour d'objectifs.
*   **Personnalisation**: Options de personnalisation de l'interface utilisateur.
*   **Refonte UI/UX**: Amélioration de l'expérience utilisateur et de l'interface graphique.

--- 

**Auteur**: Manus AI
