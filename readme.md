# Eseménykezelő alkalmazás

Eseménykezelő rendszer email értesítéssel. NestJS backend, React + MUI frontend, PostgreSQL adatbázis, Redis queue és Mailpit email tesztelés.

A frontend és a backend ebben a projektben egyszerűsítés céljából egy repón belül, külön mappákban vannak kezelve; valós környezetben inkább két külön repóban vagy például egy NX monorepo struktúrában lennének elkülönítve.

## Technológiák

| Réteg | Technológia |
|-------|-------------|
| Backend | NestJS, TypeScript, TypeORM |
| Adatbázis | PostgreSQL 16 |
| Queue | BullMQ (Redis 7) |
| Email | Nodemailer + Mailpit |
| Frontend | React, Vite, MUI |
| Infrastruktúra | Docker Compose |

## Előfeltételek

- [Docker](https://www.docker.com/) és Docker Compose

## Indítás

```bash
# Repository klónozása
git clone <repo-url>
cd bizalmikor

# Indítás (első alkalommal build-del)
docker compose up --build

# Következő indításoknál
docker compose up
```

A szolgáltatások az alábbi portokon lesznek elérhetők:

| Szolgáltatás | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Mailpit (email UI) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## API végpontok

### Események

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| `GET` | `/events` | Összes esemény listázása |
| `GET` | `/events/:id` | Egy esemény lekérdezése |
| `POST` | `/events` | Új esemény létrehozása |
| `PATCH` | `/events/:id` | Esemény módosítása |
| `PATCH` | `/events/:id/status` | Esemény státuszának módosítása |
| `DELETE` | `/events/:id` | Esemény törlése |

### Esemény létrehozása – `POST /events`

```json
{
  "title": "Csapatépítő rendezvény",
  "location": "Budapest – Várkert Bazár",
  "latitude": 47.4979,
  "longitude": 19.0402,
  "startsAt": "2026-06-01T10:00:00.000Z",
  "endsAt": "2026-06-01T18:00:00.000Z",
  "participants": ["user1@example.com", "user2@example.com"]
}
```

### Státusz módosítása – `PATCH /events/:id/status`

```json
{
  "status": "PUBLISHED"
}
```

> Amikor egy esemény `DRAFT` → `PUBLISHED` státuszba kerül, a rendszer aszinkron módon (Redis queue-n keresztül) email értesítést küld minden résztvevőnek. Az emailek a Mailpit UI-on tekinthetők meg: http://localhost:8025

## Domain szabályok

- Az esemény kezdete (`startsAt`) nem lehet később, mint a vége (`endsAt`)
- Egy helyszínen nem lehet két `PUBLISHED` státuszú esemény időben átfedésben
- Egy eseményhez egy email cím csak egyszer adható hozzá
- Státusz váltás csak `DRAFT` → `PUBLISHED` irányban lehetséges

## Fejlesztői környezet (Docker nélkül)

A backend és frontend önállóan is futtatható, ha az infrastruktúra (PostgreSQL, Redis, Mailpit) már elérhető.

```bash
# Backend
cd backend
cp .env.example .env   # szükség esetén szerkeszd a .env értékeit
npm install
npm run start:dev

# Frontend (új terminálban)
cd frontend
npm install
npm run dev
```

### Szükséges környezeti változók (backend `.env`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=bizalmikor
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=no-reply@event-app.local
CORS_ORIGIN=http://localhost:5173
```
