# Programme & Gestion des listes — Weevup

## 1. Objectif et périmètre

Cette application back-office (PWA) vise à outiller rapidement l'équipe évènementielle pour :

- Construire un **programme enrichi** (vision claire par jour, track, atelier).
- Gérer des **listes d'invités/participants** avec des programmes **personnalisés par groupe** et l'ensemble des informations logistiques.

Le résultat attendu est un back-office web simple et robuste, articulé autour de deux modules synchronisés :

1. **Programme Builder** pour créer et éditer tracks, sessions, lieux, capacités, intervenants, visuels et documents.
2. **List Manager** pour importer et éditer les participants, gérer les groupes et règles d'affectation, générer des programmes personnalisés et produire des exports individuels.

## 2. Personas et parcours clefs

### Organisateur (Back Office)

- Construit le programme, définit les groupes et leurs règles.
- Importe et segmente les listes.
- Contrôle les conflits et génère exports et convocations.

### Staff terrain

- Consulte la liste et ouvre les fiches personnes.
- Visualise le programme détaillé.
- Gère les changements de dernière minute.

### Participant (lecture seule)

- Reçoit un programme personnalisé (PDF/URL) incluant transports, hébergement, activités retenues.

## 3. Fonctionnalités (MoSCoW)

### Must-have

#### Programme Builder

- Gestion des tracks, sessions, intervenants, lieux, capacités, tags et documents.
- Vue agenda par timeline (jour → créneaux) et vue tableau.
- Types de session pris en charge : plénière, workshop, team building, transport (arrivée/départ), logistique.
- Détection automatique des conflits (chevauchement, capacité, distance entre lieux si paramétrée).

#### Groupes & règles d'affectation

- Gestion des groupes (ex. FR/EN, VIP, thématiques) avec couleurs.
- Règles : obligation ou option sur des sessions, priorités, exclusions, quotas.
- Héritage multi-groupes et résolution des conflits (priorités, overrides manuels).

#### List Manager (Participants)

- Import CSV/Excel, dédoublonnage (email/téléphone + heuristiques), validation de schéma.
- Fiche personne complète : identité, groupes, transport, arrivée, hébergement, allergènes, régimes, accessibilité, préférences, notes.
- Affectation automatique de programmes personnalisés avec ajustements manuels.
- Vue tableau filtrable (facettes) et export CSV/PDF individuel ou en masse.

#### Contrôles & qualité

- Détection des champs manquants critiques.
- Alertes sur conflits d'horaires et capacités (niveau personne et global).
- Journal d'audit : qui a modifié quoi et quand.

#### Exports

- Itinéraire individuel (PDF) complet.
- Feuilles d'émargement par session/groupe.
- Fichiers logistiques (arrivées/départs par créneau/compagnie).

### Should-have

- QR code par personne pour badges + gestion des présences par session.
- Modèles d'emails personnalisés (convocations, rappels).
- Rappels automatiques sur données manquantes critiques.

### Could-have

- Cartographie des lieux (distance/temps) et optimisation des trajets.
- Signature électronique des feuilles d'émargement.

## 4. Modèle de données (haut niveau)

- **Event** : id, nom, dates, fuseau, branding.
- **Track** : id, event_id, nom, couleur, ordre.
- **Session** : id, event_id, code, titre, type, description, jour, start, end, location_id, capacity, track_id, speakers[], documents[], tags[].
- **Location** : id, nom, adresse, niveau/zone.
- **Group** : id, code, nom, couleur, description, tags[].
- **Rule** : id, group_id, type (include/exclude/optional), session_ids[], priority, quota.
- **Person** : id, external_id, identité, coordonnées, société, rôle, notes, allergènes, régime, accessibilité.
- **Membership** : person_id, group_id.
- **Transport** : arrivée (mode, numéro, date, heure, from), départ (mode, numéro, date, heure, to).
- **Accommodation** : hôtel, checkin, checkout, chambre, commentaires.
- **Preference** : person_id, type (workshop/team building), choix[], commentaires.
- **Enrollment** : person_id, session_id, status (assigned/optional/waitlist/declined), priority, source (rule/manual).
- **AuditLog** : actor, action, entity, before/after, timestamp.

## 5. Règles d'affectation (moteur)

1. Rassembler toutes les règles liées aux groupes d'une personne.
2. Étendre en liste de sessions « obligatoires » (include) et « optionnelles » (optional).
3. Résoudre les conflits horaires (priorité > durée > capacité restante) et fallback vers alternatives.
4. Appliquer exclusions, respecter quotas/capacités, marquer en waitlist si plein.
5. Les overrides manuels priment sur le moteur et sont journalisés.

Stratégies de conflit paramétrables : priorité de groupe, priorité de session, proximité du lieu, équité de répartition.

## 6. UX Back-office

- **Header** : sélecteur d'événement.
- **Sidebar** : Programme, Groupes & Règles, Participants, Qualité, Exports, Paramètres.

### Programme Builder

- Vue timeline (drag & drop, redimensionnement, code couleur par track/type).
- Panneau de propriétés : titre, type, lieu, capacité, intervenants, documents, tags.

### Groupes & règles

- Tableau des groupes avec couleurs, code, membres.
- Éditeur de règles (inclure/exclure/optionnel, priorités, quotas).

### Participants (List Manager)

- Tableau colonnes configurables + filtres (groupes, transport, hôtel, allergènes, statut d'affectation).
- Fiche en 5 onglets : Identité, Groupes, Transport & Arrivée, Hébergement, Programme & Allergènes/Préférences.

### Qualité & conflits

- Centre d'alertes : données manquantes, sessions pleines, conflits horaires.

### Exports

- Assistants d'export CSV/PDF par lot ou individuel.

## 7. API (extraits)

L’implémentation initiale s’appuie sur un serveur Express en TypeScript. La couche de persistance est en mémoire afin de
permettre un prototypage rapide, avec un jeu de données d’exemple aligné sur les personas.

### Endpoints disponibles

```
GET /health
GET /events/:id/summary
GET /events/:id/sessions?day=&track=&type=
POST /events/:id/sessions
PATCH /sessions/:id
GET /events/:id/groups
POST /events/:id/groups
POST /groups/:id/rules
GET /events/:id/people?group=&missing=
POST /events/:id/people/import
GET /people/:id
PATCH /people/:id
POST /people/:id/memberships
POST /assignments/recompute?event_id=…
GET /people/:id/itinerary.pdf
GET /events/:id/exports/arrivals.csv
```

Les payloads d’entrée sont validés via Zod et les réponses sont structurées de manière à faciliter l’intégration front.

### Exemple JSON — Person

```json
{
  "external_id": "CUST-001",
  "first_name": "Alice",
  "last_name": "Martin",
  "email": "alice@example.com",
  "phone": "+33600000000",
  "company": "ACME",
  "groups": ["VIP", "FR"],
  "transport": {
    "arrival": {"mode": "flight", "number": "AF1234", "date": "2025-09-17", "time": "10:25", "from": "NCE"},
    "departure": {"mode": "train", "number": "TGV8421", "date": "2025-09-19", "time": "18:02", "to": "LYS"}
  },
  "accommodation": {"hotel": "Hotel Parsifal", "checkin": "2025-09-17", "checkout": "2025-09-19", "room": "204"},
  "diet": {"allergens": ["arachide", "gluten"], "preferences": ["végétarien"]},
  "accessibility": "PMR",
  "preferences": {"workshops": ["WS-A", "WS-C"], "team_building": ["TB-1"]},
  "notes": "Arrivée anticipée"
}
```

### Exemple JSON — Rule

```json
{
  "group": "VIP",
  "include": ["PLE-OPEN", "DIN-GALA"],
  "optional": ["WS-A", "WS-B"],
  "exclude": ["WS-D"],
  "priority": 90,
  "quota": null
}
```

## 8. Sécurité et conformité

- RGPD : base légale, consentements, minimisation, rétention, droit d'accès/suppression, registre de traitements.
- Rôles : admin, éditeur, staff (lecture), export-only avec masquage des champs sensibles selon rôle.
- Traçabilité : audit log exhaustif, exports horodatés.

## 9. Performance et disponibilité

- PWA avec cache sélectif (liste + programme en lecture).
- Pagination et recherche côté serveur.
- WebSocket pour recalculs contrôlés.
- Capacité ≥ 10k participants par événement.
- SLA interne 99,9 % sur la fenêtre opérationnelle.

## 10. MVP → Plan de release (8–10 semaines)

1. Semaine 1–2 : schéma, import CSV, Programme Builder (timeline de base), Groupes, Fiches personne.
2. Semaine 3–4 : règles + moteur d'affectation v1 (include/optional/exclude, priorités), contrôles et alertes.
3. Semaine 5–6 : exports (itinéraires PDF, arrivals CSV), dédoublonnage, audit log.
4. Semaine 7–8 : qualité, performance, accès rôles, packaging PWA, hardening RGPD.
5. Option Semaine 9–10 : QR badge, présence par session, modèles d'emails.

## 11. Gabarits d'import & export

- **participants.csv** : identité, groupes, transport arrivée/départ, hôtel, allergènes, préférences, accessibilité, notes.
- **groups.csv** : code, nom, couleur, description, sessions par défaut (include/optional).
- **sessions.csv** : code, titre, type, jour, horaires, lieu, track, capacité, intervenants, tags.
- **assignments.csv** (optionnel) : person_id/external_id, session_code, status, priority.

## 12. Critères d'acceptation (échantillon)

- Affectation auto : pour 100 personnes multi-groupes, 95 % reçoivent un itinéraire sans conflit, 5 % max en attente si capacité atteinte, aucun double-booking.
- Qualité données : identification de 100 % des participants sans allergènes renseignés et blocage de l'export restauration jusqu'à résolution ou justification.
- Export logistique : génération < 5 s d'un CSV "arrivées > par heure".
- Override manuel : conservation des overrides au prochain recalcul et journalisation de la décision.

## 13. Stack de référence

- **Front** : Next.js (React) + TanStack Table + Zustand.
- **Back** : NestJS (Node) + PostgreSQL + Prisma.
- **Docs/PDF** : templating Handlebars + Puppeteer.
- **Auth** : Magic link + OAuth Entreprise.
- **Infra** : Docker + CI GitHub Actions.
- **Observabilité** : Sentry + OpenTelemetry.

## 14. Prochaines étapes

1. Valider les gabarits CSV.
2. Implémenter l'import et les validations.
3. Développer le Programme Builder et le moteur d'affectation v1.
4. Tester sur un événement pilote (40–80 participants).
5. Itérer sur les fonctionnalités avancées (QR codes, exports enrichis).

## 15. Voir la démo

La démo interactive est en cours de préparation. Elle sera publiée sous forme de prototype cliquable (Figma) au terme de la phase « Semaine 1–2 ». Dès qu'elle est disponible, l'URL et les instructions d'accès seront ajoutées ici et partagées sur le canal projet. En attendant, vous pouvez vous appuyer sur le présent document pour cadrer les ateliers et préparer les jeux de données d'import.

## 16. Démarrage rapide (prototype API)

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Lancer le serveur en mode développement :

   ```bash
   npm run dev
   ```

   L'API back-office est exposée sur <http://localhost:3000>. Un jeu de données d'exemple est chargé en mémoire.

3. Rejouer les règles d'affectation sur l'événement de démonstration :

   ```bash
   curl -X POST "http://localhost:3000/assignments/recompute?event_id=<EVENT_ID>"
   ```

4. Exporter les arrivées en CSV :

   ```bash
   curl "http://localhost:3000/events/<EVENT_ID>/exports/arrivals.csv"
   ```

### Notes

- L'endpoint `GET /people/:id/itinerary.pdf` retourne pour l'instant un statut `501` (non implémenté).
- La persistance étant en mémoire, toute modification est réinitialisée au redémarrage.

