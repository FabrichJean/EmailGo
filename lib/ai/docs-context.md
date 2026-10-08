# Base de connaissance — Assistant IA EmailDo

Ce fichier sert de contexte à l'assistant IA de la page `/docs` (chargé par `lib/ai.ts`,
fonction `answerDocsQuestion`). Pour enrichir ce que l'assistant sait, ajoute simplement un
nouveau paragraphe ci-dessous — aucune modification de code n'est nécessaire, le fichier est
relu au démarrage du serveur.

**Convention** : une section liée à une page de la doc commence par `[#id]`, où `id` est
l'ancre réelle d'une section dans `app/docs/content.fr.tsx` / `content.en.tsx` (prop
`id="..."` de `<DocSection>`). Le modèle est instruit à citer ces ids dans une ligne
`SOURCES: #id` à la fin de sa réponse (voir le prompt système dans `lib/ai.ts`), que
`ChatWidget.tsx` transforme en lien cliquable vers la doc. Une section sans `[#id]` (ex:
positionnement) reste une information valide, simplement sans lien à citer — le modèle doit
alors répondre `SOURCES: none`.

## EmailDo en bref

EmailDo est une plateforme de prospection par email : connexion de comptes Gmail, création de
templates réutilisables (avec génération par IA), et envoi d'emails — à l'unité, en masse, ou
par programmation via une API.

## Positionnement et avantages

_Information générale, sans section de doc dédiée._

EmailDo envoie réellement depuis de vrais comptes Gmail de l'utilisateur (OAuth officiel
Google ou mot de passe d'application), et non depuis un serveur SMTP tiers mutualisé — ce qui
donne une bien meilleure délivrabilité (moins de risque d'atterrir en spam) que la plupart des
outils de cold-emailing qui envoient via leur propre infrastructure partagée entre des
milliers de clients.

C'est une plateforme que l'utilisateur ou son organisation héberge et contrôle lui-même (pas
un SaaS fermé avec abonnement par siège imposé par un tiers) : les données (templates,
historique, identifiants chiffrés) restent sur son infrastructure.

La génération de templates par IA est intégrée directement dans l'éditeur (texte ou HTML),
pas besoin d'un outil séparé.

L'API et les clés API permettent d'automatiser l'envoi depuis n'importe quelle application
tierce, avec des "services" associés chacun à un compte Gmail précis pour une organisation
claire des intégrations.

Multi-utilisateur avec espace d'administration (statistiques, bannissement, limites d'envoi
par utilisateur) pour un usage en équipe.

## [#demarrage] Démarrage

`/login` pour se connecter avec Google (compte créé automatiquement) ; `/connect` pour relier
un ou plusieurs comptes Gmail d'envoi (différents du compte de connexion), en automatique
(OAuth Google) ou manuel (mot de passe d'application Google, nécessite la validation en 2
étapes). Les identifiants sont chiffrés avant stockage, jamais en clair.

## [#comptes-gmail] Connecter des comptes Gmail

Depuis `/connect`, deux méthodes — automatique (OAuth Google) ou manuelle (mot de passe
d'application, nécessite la validation en 2 étapes sur le compte Google). Les identifiants
sont chiffrés avant stockage.

## [#templates] Templates

Depuis `/templates` : nom, objet, corps avec variables `{{variable}}` (ex: `{{prenom}}`,
`{{entreprise}}`) remplacées à l'envoi. Deux modes d'édition : éditeur visuel (gras, italique,
listes, liens) ou HTML brut avec coloration syntaxique. Aperçu Bureau/Mobile en temps réel.
Onglet "Test" pour s'envoyer une version de test avec des valeurs de variables choisies.
Onglet "Paramètres" : nom, ID, date de création, suppression.

## [#ia] Génération par IA

Bouton "Générer avec l'IA" dans l'éditeur de template, avec choix du format (texte ou HTML), à
partir d'une simple description en langage naturel. Le brouillon généré reste entièrement
modifiable.

## [#envoi] Envoi simple & en masse

Depuis `/send` : choisir un compte Gmail et un template, puis envoyer à un destinataire
unique, via une liste d'adresses collée, ou via import CSV (une colonne par variable, une
ligne par destinataire).

## [#historique] Historique

Depuis `/history` : liste de tous les envois (réussis ou échoués) avec destinataire, compte
utilisé, template, et raison de l'échec le cas échéant. Filtrable par statut.

## [#api] Email Service & API

Depuis `/account`, génération d'une clé API (préfixe `eg_`, affichée en clair une seule fois).
Depuis `/email-service`, création de "services" : un nom, un identifiant (`serviceId`) et un
compte Gmail connecté associé — le service porte déjà le compte d'envoi.

L'API publique est `POST /api/v1/send`, authentifiée par `Authorization: Bearer <clé API>`
(pas de JWT), avec un corps JSON `{ serviceId, templateId, recipient, variables }`. Réponse :
`{ success: true }` ou `{ error: "..." }` avec un code HTTP. Le service appelé doit appartenir
au même compte que la clé API.

## [#compte] Mon compte

Depuis `/account` : infos du compte, statistiques (comptes Gmail actifs, templates, emails
envoyés), limite d'envoi éventuelle, gestion des clés API, déconnexion.

## [#admin] Administration

Réservé à l'adresse définie comme administratrice. Depuis `/admin` (déverrouillage par mot de
passe dédié) : statistiques globales de la plateforme, gestion des utilisateurs (bannissement,
coupure ou limitation de l'envoi par jour/semaine/mois).

## [#faq] Sécurité

Les secrets Gmail (refresh token OAuth, mot de passe d'application) sont chiffrés avant
stockage, jamais affichés en clair après connexion.
