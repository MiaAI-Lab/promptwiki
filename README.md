# PromptWiki

A lightweight, self-hosted wiki for managing, organizing, and reusing LLM prompts. Run it locally or on your network with Docker.

PromptWiki gives you a central place to store your prompts — with search, categories, version history, one-click copy, and import/export. No cloud dependency, no subscription, no data leaving your network.

## Features

- **Prompt CRUD** — Create, read, update, duplicate, archive, and delete prompts
- **Organization** — Categorize prompts with categories, favorites, and pinned items
- **Search & Filter** — Full-text search across title, description, content, and categories
- **One-click copy** — Copy any prompt to clipboard instantly
- **Version history** — Automatic version tracking on every edit; restore previous versions
- **Find & Replace** — Bulk find and replace across your prompt library
- **Import / Export** — Backup and restore all prompts as JSON
- **Dark mode** — Built-in light/dark theme toggle
- **Dockerized** — Run with a single `docker compose up` command
- **SQLite** — Zero-config database with persistent Docker volumes
- **Mobile-friendly** — Responsive design works on phones and tablets

## Screenshots

> _(Add screenshots here)_

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

The app is available at **http://localhost:3301**.

From another machine on your network:

```
http://<server-ip>:3301
```

### Local Development

```bash
# Install dependencies
npm install

# Set up the database
npx prisma db push
npx tsx prisma/seed.ts

# Run the dev server
npm run dev
```

The app will be available at **http://localhost:3000**.

## Commands

| Command | Description |
|---|---|
| `docker compose up --build` | Build and start the app |
| `docker compose down` | Stop the app (keeps data) |
| `docker compose down -v` | Stop and **delete all data** |
| `npm run dev` | Run in development mode |
| `npm run build` | Build for production |

## Accessing from Your Network

The app binds to `0.0.0.0` inside the container and maps port `3301` externally. From any device on the same network:

```
http://<your-server-ip>:3301
```

Make sure your firewall allows incoming connections on port 3301.

## Data Persistence

All data is stored in a Docker volume mounted at `/app/data`:

```
Database: /app/data/promptwiki.db (SQLite)
```

Your prompts survive container restarts and updates. To reset everything:

```bash
docker compose down -v
```

> ⚠️ This permanently deletes all prompts. Export a backup first if needed.

## Backup & Restore

### Export

1. Navigate to **Import / Export** in the sidebar
2. Click **Download Export (JSON)**

### Import

1. Navigate to **Import / Export**
2. Select your JSON file
3. Choose whether to update existing prompts with matching titles
4. Click **Import**

By default, prompts with duplicate titles are skipped to avoid overwriting.

## Project Structure

```
promptwiki/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── prompts/            # Prompt CRUD pages
│   │   ├── settings/           # Settings page
│   │   ├── import-export/      # Import/export page
│   │   ├── find-replace/       # Find & replace page
│   │   ├── layout.tsx          # Root layout with sidebar
│   │   ├── page.tsx            # Dashboard (prompt list)
│   │   ├── error.tsx           # Error boundary
│   │   ├── loading.tsx         # Loading states
│   │   └── not-found.tsx       # 404 page
│   ├── components/             # Reusable UI components
│   └── lib/                    # Utilities (Prisma client, queries)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data (default prompts)
├── Dockerfile
├── docker-compose.yml
├── start.sh                    # Container startup script
└── package.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | SQLite |
| **ORM** | Prisma |
| **Runtime** | Node.js (LTS) |
| **Containerization** | Docker + Docker Compose |

## Default Prompts

PromptWiki ships with a set of useful default prompts covering common use cases:

- **Code Review** — Comprehensive code review for any language
- **Refactor Code** — Refactor existing code for clarity and performance
- **Debugging Assistant** — Diagnose and fix code issues
- **Dockerfile Review** — Review and optimize Dockerfiles
- **Test Generation** — Generate unit tests for existing code
- **Architecture Review** — Review system architecture and design decisions

On first startup, these prompts are automatically seeded into the database.

## Troubleshooting

### Port already in use

If port 3301 is already in use, change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "3302:3000"  # Use a different external port
```

### Database errors on first run

The startup script runs `prisma db push` automatically. If you see errors:

```bash
docker compose down
docker compose up --build
```

### App not accessible from other machines

1. Verify the server's IP: `hostname -I`
2. Check the firewall: `sudo ufw allow 3301/tcp` (Ubuntu) or equivalent
3. Confirm the container is running: `docker ps`

### Reset the database

```bash
docker compose down -v
docker compose up --build
```

This recreates the database with seed data.

### Clear Docker cache

```bash
docker compose down -v
docker system prune -af
docker compose up --build
```

## License

MIT
