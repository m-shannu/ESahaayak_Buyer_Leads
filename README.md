# Buyer Lead Intake (mini)

## Overview
Next.js + TypeScript + Prisma (SQLite) lead intake app with:
- Create / List / Edit / Delete leads
- SSR list with filters, pagination
- Zod validation on client & server
- Concurrency detection (updatedAt)
- CSV import (transactional) and CSV export (filtered list)
- History of changes
- Minimal demo auth via cookie `user-id`
- One unit test (vitest)
- Simple in-memory rate limit for create

## Setup (local)
1. Install deps
```bash
npm install
````

2. Generate Prisma client & run migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This creates `prisma/dev.db` SQLite file.

3. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo login

Use the `POST /api/auth/login` endpoint (the UI currently uses no password). You can also hit the endpoint with `{ "name": "me", "email": "me@example.com" }` to create a user; a cookie `user-id` will be set.

## CSV Import

Client should read file text and send `POST /api/buyers/import` with JSON `{ "csv": "..." }`. The server validates each row and inserts valid rows in a transaction. Max 200 rows.

CSV headers expected:

```
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
```

## Notes & Design

* `tags` are stored as comma-separated string in DB (`buyer.tags`), and converted to `string[]` in API responses. This was chosen for SQLite compatibility.
* Ownership enforced by reading `user-id` cookie from requests. Only owner (or `admin` user) can edit/delete.
* Rate-limit is in-memory and per-user/IP for quick local protection.
* Concurrency: edit forms include `updatedAt` from server; server rejects if changed.
* SSR list is done in app router server component (`/buyers`) and supports URL-synced filters.

## What's done vs skipped

Done:

* All required pages + server API routes
* CSV import transactional with row validation
* Concurrency checks + history
* Unit test for validator
* Basic accessibility (labels) and error messages

Skipped / TODO:

* Real authentication flow (magic link or OAuth)
* File attachments storage (optional)
* Pagination UI could be improved
* Tag chips with typeahead (nice-to-have)

## Tests

Run:

```bash
npm test
```

```

---

## Final notes & next steps

1. Copy files into your repo (paths and filenames must match).
2. Run `npm install`, then `npx prisma migrate dev --name init`, then `npm run dev`.
3. Use the minimal demo login by calling `/api/auth/login` with `{ "name":"You", "email":"you@example.com" }` (you can also test without but you'll get `anonymous` owner).
4. CSV import: client reads file with `FileReader` and posts `{ csv: fileText }` to `/api/buyers/import`.
5. If you want me to convert `tags` to a proper relation (Tag table) or switch to Postgres (string[] support), I can provide migration steps — tell me which DB and I’ll produce updated Prisma schema and code.

---
