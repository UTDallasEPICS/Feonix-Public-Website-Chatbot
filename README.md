# Feonix-Public-Website-Chatbot

# Feonix

This repository contains two separate Next.js applications:

- **admin-portal**: Admin dashboard for managing company documents
- **chatbot-component**: Chat interface for user questions

---

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v22 or later recommended)
- npm (comes with Node.js)
- [Visual Studio Code](https://code.visualstudio.com/) (or IDE of your choice)

---

## Clone the Repo

```bash
git clone <your-repo-url>
cd Feonix
```

## Run the Admin Portal

```bash
cd admin-portal
npm install
npm run dev
```

Open the port shown in the terminal to see the admin portal.

## For the admin portal

### Generate the Prisma Client

#### This compiles the Prisma schema to generate the database client code:

```bash
npx prisma generate
```

### Create the SQLite Database (Optional if already committed)

#### If the dev.db file is not committed or you're starting fresh:

```bash
npx prisma migrate dev
```

---

## Run the Chatbot Component

### In a separate terminal window:

```bash
cd chatbot-component
npm install
npm run dev
```

Open the port shown in the terminal to see the chat interface.

---

#### Be sure to set your environment variables in the respective `.env` files

---

## Notes

- Each app runs independently with its own dependencies.
- To stop an app, press `Ctrl + C` in the terminal where it’s running.
- Ports may differ; check your terminal logs for the actual URLs.
