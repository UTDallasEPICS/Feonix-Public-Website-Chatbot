# Feonix-Public-Website-Chatbot

# Feonix

This repository contains two separate Next.js applications:

- **admin-portal**: Admin dashboard for managing company documents
- **chat-interface**: Chat interface for user questions

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (v22 or later recommended)
- npm (comes with Node.js)

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

## Run the Chat Interface

### In a separate terminal window:

```bash
cd chat-interface
npm install
npm run dev
```

Open the port shown in the terminal to see the chat interface.

#### Be sure to set your environment variables in the respective `.env` files

---

## Notes

- Each app runs independently with its own dependencies.
- To stop an app, press `Ctrl + C` in the terminal where it’s running.
- Ports may differ; check your terminal logs for the actual URLs.
