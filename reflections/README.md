# Reflections - GIC Rewards App

A Next.js frontend for the HIVE-PAW API with GIC reward system.

## Features

- **Private Reflections**: +10 GIC (default)
- **Published Reflections**: +25 GIC (200+ characters)
- **Chamber Selection**: Reflections, Lab4, Market, CommandLedger, Agora
- **Daily Workflow**: Seed → Sweep → Seal
- **GIC Tracking**: Real-time XP display
- **Ledger Verification**: View daily integrity and GIC totals
- **Dark Theme**: Modern, mobile-first design

## Setup

### Prerequisites

1. **Node.js** (v18 or later)
2. **npm** or **yarn**

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   # Copy the example and edit
   cp .env.example .env.local
   ```

3. **Configure API connection**:
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_API_KEY=YOUR_LONG_RANDOM_KEY
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## API Integration

The app connects to your HIVE-PAW API running on port 8000. Make sure your API server is running:

```bash
# In lab4-proof directory
uvicorn app.main:app --reload --port 8000
```

## Usage

1. **Seed your day**: Set your daily intent and goals
2. **Log reflections**: Choose private (+10 GIC) or publish (+25 GIC)
3. **Select chamber**: Pick your reflection context
4. **Seal the day**: Complete your daily cycle
5. **Track GIC**: View earned rewards and daily totals

## Deployment

When ready to deploy:

1. **Deploy API to Render** (or your preferred platform)
2. **Update environment variables**:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-api.onrender.com
   NEXT_PUBLIC_API_KEY=YOUR_PRODUCTION_KEY
   ```
3. **Deploy frontend** to Vercel, Netlify, or your preferred platform

## Development

- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client for API calls
- **Day.js**: Date manipulation
- **Zod**: Runtime validation (ready for use)

## File Structure

```
reflections/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── api.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```
