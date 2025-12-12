# Feonix Public Website Chatbot

## Conceptual Overview

The Feonix Public Website Chatbot is an intelligent document management and AI-powered chatbot system designed to help Catch a Ride(Feonix - Mobility Rising) provide automated customer support through their public website. The system consists of two main components:

1. **Admin Portal**: A secure administrative dashboard where authorized administrators can upload, manage, and organize documents that serve as the knowledge base for the chatbot
2. **Chatbot Component**: An embeddable chat interface that can be integrated into the Feonix public website, allowing users to ask questions and receive AI-powered responses based on the uploaded documents

The system enables Feonix staff to maintain an up-to-date knowledge base while providing website visitors with instant, accurate answers to their questions about Catch a Ride services, eligibility, booking procedures, and more.

### User Roles

**Administrators**
- Access the admin portal through OAuth authentication (Google)
- Upload documents (PDF, DOCX, TXT) to the knowledge base
- Manage and delete documents from the system
- Control user access by managing the allowed users list
- View all uploaded files with metadata (uploader, date, size, type)

**End Users (Website Visitors)**
- Interact with the chatbot through the public website
- Ask questions about Feonix services
- Receive AI-generated responses based on the document knowledge base
- Access default FAQs when relevant documents aren't available
- No authentication required for chatbot access

---

## Functional Requirements

### Admin Portal

#### Login Page (`/login`)
- OAuth authentication via Google
- Email validation against allowed users list
- Session management with cookie-based authentication
- Error handling for unauthorized access attempts
- Redirect to home page after successful login

#### Home Page (`/`)
- Dashboard overview with quick links
- Navigation to File Upload, File Manager, and User Management
- Display Feonix branding and logo

#### File Upload Page (`/upload`)
- Multi-file upload support (up to 5 files simultaneously)
- Drag-and-drop interface
- File type validation (PDF, DOCX, TXT only)
- File size validation (max 5MB per file)
- Real-time upload progress tracking
- Document processing and chunking for vector embeddings
- Integration with ChromaDB for vector storage
- Display upload results (passed/failed files)

#### File Manager Page (`/file-manager`)
- Display all uploaded documents in a searchable table
- Show file metadata (name, type, size, upload date, uploader)
- Search/filter functionality by filename or uploader name
- Delete documents with confirmation
- Automatic removal of associated vector embeddings on delete

#### User Management Page (`/allowed-users`)
- View all allowed users
- Add new users by email address
- Remove users from the allowed list
- Search/filter users by email
- Inline editing of user email addresses
- Validation to prevent duplicate email entries

### Chatbot Component

#### Chat Interface
- Collapsible chat panel with button trigger
- Welcome screen with example questions
- Message history display with user and bot messages
- Markdown rendering for bot responses
- Code syntax highlighting
- Real-time streaming responses
- Loading indicators during processing
- Error handling and user feedback
- Session management for conversation context

#### Chat Functionality
- Natural language query processing
- Vector similarity search across document knowledge base
- Hybrid search (keyword + vector + reranking) for optimal results
- Context-aware responses using conversation history
- Fallback to default FAQs for common questions
- RAG (Retrieval Augmented Generation) using LangChain
- Integration with local LLM via Ollama

---

## Third Party Integrations

### Google OAuth
**Purpose**: Authentication and authorization for admin portal access
- Provides secure single sign-on for administrators
- Validates user identity against allowed users list
- Manages session creation and authentication state

### HuggingFace Inference API
**Purpose**: Document embedding generation
- Model: BAAI/bge-m3 (multilingual embedding model)
- Converts document chunks into vector embeddings
- Enables semantic search across documents
- Used for reranking search results

### ChromaDB
**Purpose**: Vector database for document storage and retrieval
- Stores document chunks as vector embeddings
- Enables fast similarity search
- Maintains metadata (filename, file ID) with each chunk
- Supports collection management for organized storage

### Ollama (Local LLM)
**Purpose**: Natural language generation for chatbot responses
- Runs locally for privacy and cost efficiency
- Generates human-like responses based on retrieved context
- Supports streaming responses for better UX
- Can be configured to use different models (e.g., llama2, mistral)

### Prisma ORM
**Purpose**: Database abstraction and type-safe queries
- Manages SQLite database schema
- Provides type-safe database operations
- Handles migrations for schema changes

---

## Tech Stack

### Admin Portal

**Meta Framework**: Next.js 16.0.8 (combines frontend and backend)
- React 19.2.0 for UI components
- Server-side rendering and API routes
- TypeScript for type safety

**Database**: SQLite (via Prisma 6.19.0)
- Lightweight, file-based database
- Stores users, documents, sessions, OAuth accounts, and allowed users

**Key Packages**:
- `@prisma/client` - Database ORM and query builder
- `chromadb` - Vector database client
- `@langchain/community`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama` - LLM orchestration and RAG pipeline
- `@langchain/textsplitters` - Document chunking
- `@huggingface/inference` - Embedding generation
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction
- `formidable` - File upload handling
- `framer-motion` - UI animations
- `react-icons` - Icon library
- `tailwindcss` - Utility-first CSS framework
- `valibot` - Schema validation

**Development Tools**:
- ESLint for code linting
- TypeScript for type checking
- PostCSS for CSS processing

### Chatbot Component

**Frontend Framework**: React 19.1.1 with Vite
- TypeScript for type safety
- Vite for fast development and optimized builds
- Web Components support via `react-to-webcomponent`

**Key Packages**:
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown support
- `rehype-highlight` - Code syntax highlighting
- `react-icons` - Icon library
- `tailwindcss` - Styling

**Development Tools**:
- ESLint for code linting
- Vite for build tooling
- TypeScript for type checking

### Additional Tools

**Utility Scripts**:
- `clear_chroma.mjs` - Clears all documents from ChromaDB collection
- `dedupe_chroma.mjs` - Removes duplicate document chunks
- `inspect_chroma.mjs` - Inspects ChromaDB contents for debugging

---

## Deployment Notes

The project is currently configured for local development. Deployment considerations:

**Admin Portal**:
- Requires Node.js runtime environment
- SQLite database file (`dev.db`) must be persisted
- Environment variables must be configured
- ChromaDB instance must be accessible (local or hosted)
- Google OAuth credentials must be configured with appropriate redirect URLs

**Chatbot Component**:
- Can be deployed as static files (Vite build output)
- Requires access to admin portal API endpoints
- Can be embedded in any website via script tag or Web Component

**Recommended Deployment Strategy**:
- Admin Portal: Vercel, AWS, or similar Node.js hosting
- ChromaDB: Self-hosted or cloud instance
- Chatbot: CDN for static assets, embedded on Feonix website

---

## Migration Scripts

No migration scripts are currently needed as this is a new system. However, the following scripts are available for database management:

**Prisma Migrations**: Located in `admin-portal/prisma/migrations/`
- Database schema version control
- Automatic migration on schema changes
- Run with `npx prisma migrate dev`

**ChromaDB Utility Scripts**: Located in `admin-portal/scripts/`
- `clear_chroma.mjs` - Deletes all chunks from the collection
- `dedupe_chroma.mjs` - Identifies and removes duplicate document chunks
- `inspect_chroma.mjs` - Views collection statistics and sample data

---

## Development Environment Setup

### Prerequisites

Ensure the following software is installed:
- [Node.js](https://nodejs.org/) (v22 or later recommended)
- npm (comes with Node.js)
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.ai/) (for local LLM)

### Clone the Repository

```bash
git clone https://github.com/UTDallasEPICS/Feonix-Public-Website-Chatbot.git
cd Feonix-Public-Website-Chatbot
```

### Admin Portal Setup

1. **Navigate to the admin portal directory**:
   ```bash
   cd admin-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Create a `.env` file in the `admin-portal` directory (use `.env.example` as template):
   ```env
   DATABASE_URL="file:./dev.db"
   
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   OAUTH_REDIRECT_URL_BASE=http://localhost:3000
   
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   
   CHROMA_URL=http://localhost:8000
   CHROMA_COLLECTION=documents_collection
   
   EMBED_MODEL=BAAI/bge-m3
   ```

4. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
   
   This creates the SQLite database and generates the Prisma client.

5. **Start ChromaDB** (in a separate terminal):
   ```bash
   # Install ChromaDB if not already installed
   pip install chromadb
   
   # Start ChromaDB server
   chroma run --host localhost --port 8000
   ```

6. **Start Ollama** (in a separate terminal):
   ```bash
   # Pull a model (e.g., llama2)
   ollama pull llama2
   
   # Ollama server starts automatically
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The admin portal will be available at `http://localhost:3000`

### Chatbot Component Setup

1. **Navigate to the chatbot component directory** (in a new terminal):
   ```bash
   cd chatbot-component
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The chatbot will be available at `http://localhost:5173`

### Setting Up Authentication

1. **Create Google OAuth credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/oauth/google`
   - Copy the Client ID and Client Secret to your `.env` file

2. **Add your email to allowed users**:
   - Manually insert your email into the SQLite database, or
   - Use Prisma Studio to add it:
     ```bash
     npx prisma studio
     ```
   - Navigate to the `AllowedUser` table and add your email

### Testing the System

1. **Upload test documents**:
   - Log in to the admin portal at `http://localhost:3000`
   - Navigate to File Upload
   - Upload sample PDF, DOCX, or TXT files
   - Verify files appear in File Manager

2. **Test the chatbot**:
   - Open the chatbot component at `http://localhost:5173`
   - Click the chat button
   - Ask a question related to your uploaded documents
   - Verify the response includes relevant information

### Utility Scripts Usage

**Inspect ChromaDB contents**:
```bash
cd admin-portal
node scripts/inspect_chroma.mjs
```

**Remove duplicate chunks**:
```bash
node scripts/dedupe_chroma.mjs --delete
```

**Clear all documents from ChromaDB**:
```bash
node scripts/clear_chroma.mjs
```

### Building for Production

**Admin Portal**:
```bash
cd admin-portal
npm run build
npm start
```

**Chatbot Component**:
```bash
cd chatbot-component
npm run build
# Output will be in the dist/ directory
```

---

## Notes

- The admin portal and chatbot component run independently
- ChromaDB must be running before starting the admin portal
- Ollama must be running for the chatbot to generate responses
- To stop any development server, press `Ctrl + C` in the terminal
- Check terminal logs for actual URLs and ports
- Ensure all environment variables are properly configured before starting
- The SQLite database file is stored in `admin-portal/prisma/dev.db`
