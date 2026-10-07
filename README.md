# Instempus

Instempus is a mobile-first campus operations platform designed to replace scattered campus processes like paper registers, WhatsApp groups, notice boards, gate-pass booklets, and manual approvals with a single role-aware system.

Built for college/admin workflows, the app brings attendance, leave, gate passes, notices, complaints, payments, canteen interactions, messaging, and audit tracking into one place.

## Why Instempus

Manual campus administration often leads to:

- delayed approvals
- lost or duplicate records
- fake gate passes and informal approvals
- poor visibility across roles
- no audit trail for decisions and actions

Instempus centralizes these flows behind a role-aware application model so every action can be tracked, approved, and reviewed.

## Core features

- Role-based campus workflows for students, teachers, HODs, wardens, canteen staff, accounts, security, admin, and principal
- Unified approval system driven by a generic application model
- Notice feed and campus communication hub
- Messaging and contact-based communication between users and departments
- Complaint and issue management
- Leave and gate-pass requests
- Attendance and operational tracking
- Canteen and service workflows
- Security and emergency handling views
- Profile management and user context
- Audit-friendly record flow for approvals and status changes

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase (database/auth/storage/realtime)
- Zustand for state management
- Google Gemini AI integration via `@google/genai`
- Capacitor-ready app shell for mobile packaging

## Project structure

```text
.
├── docs/                  # Architecture, planning, and project documentation
├── src/
│   ├── components/        # Feature modules: home, auth, profile, security, issues, messaging, etc.
│   ├── services/          # Supabase and app services
│   ├── i18n/              # Localization files
│   ├── types/             # Type definitions
│   ├── App.tsx            # App entry component
│   ├── main.tsx           # React bootstrap
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
├── .env.example           # Example environment variables
├── capacitor.config.ts    # Capacitor configuration
├── index.html             # Vite app entry
├── package.json           # Scripts and dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
├── README.md              # Project overview
└── bun.lock               # Bun lockfile
```

## Getting started

### Prerequisites

- Node.js 18+
- npm or Bun

### 1) Install dependencies

```bash
npm install
```

or

```bash
bun install
```

### 2) Configure environment variables

Copy the example env file and add your project values:

```bash
cp .env.example .env
```

The project expects:

- `GEMINI_API_KEY` for Gemini AI functionality
- `APP_URL` for app URL usage (for local/dev or deployed hosting)

### 3) Run the app locally

```bash
npm run dev
```

The app is configured to run on port `3000`.

### 4) Build for production

```bash
npm run build
```

### 5) Run linting

```bash
npm run lint
```

## Available scripts

```json
{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist server.js",
  "lint": "tsc --noEmit"
}
```

## Supabase setup

The app is designed to work with Supabase for data and auth. Database schema and migrations are placed under `supabase/migrations`.

If you're setting up the backend manually:

1. Create a Supabase project
2. Add your Supabase URL and keys to the environment used by your app
3. Apply migrations in `supabase/migrations`
4. Validate auth and RLS behavior for the campus workflows

## Notes

This repository includes a strong documentation set under `docs/` that explains the system architecture, database design, and implementation plan. If you want to understand the intended product and workflow model in detail, start with:

- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SYSTEM_DESIGN.md`

## License

This project is configured for standard project usage and does not currently declare an explicit repository license in the main files reviewed here.

## Contributing

Contributions are welcome. For best results, keep changes aligned with the established app architecture and use the project’s feature-based component organization.

## Summary

Instempus is a campus operations and approval platform focused on replacing fragmented manual workflows with one clean, digital, role-aware operating system for higher education institutions.
