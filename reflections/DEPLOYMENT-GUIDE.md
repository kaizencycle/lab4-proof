# Lab4-Proof Reflections Wall - Deployment Guide

## 🎯 What's Been Implemented

### ✅ Core Features
- **2005 Facebook-style Reflections Wall** with black & cold Concord theme
- **Apprentice Mode Toggle** for OAA integration
- **Real-time Feed** with 15-second auto-refresh
- **GIC Balance Display** and archetype scoring
- **Concord Sigil** branding throughout

### ✅ OAA Integration
- **Local Lesson Synthesis** - generates questions and challenges instantly
- **OAA Snapshot API** - sends reflections to Lab7 with trace IDs
- **Echo Threading** - polls for OAA responses every 20 seconds
- **Trace ID System** - links reflections to OAA echoes

### ✅ Auto-Deployment
- **GitHub Actions Workflow** - auto-commit and auto-merge every 30 minutes
- **Render Integration** - automatic deployment on merge to main

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

Required environment variables:
```env
IRON_SESSION_PASSWORD=your-32-character-secret-key-here
IRON_SESSION_COOKIE_NAME=reflections_session
OAA_API_URL=https://lab7-proof.onrender.com
OAA_API_KEY=your-lab7-api-key-here
```

### 2. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### 3. Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IRON_SESSION_PASSWORD` | ✅ | 32+ character secret for session encryption |
| `IRON_SESSION_COOKIE_NAME` | ✅ | Cookie name for sessions |
| `OAA_API_URL` | ✅ | Lab7 OAA API endpoint |
| `OAA_API_KEY` | ✅ | Lab7 API authentication key |
| `GIC_INDEXER_URL` | ❌ | GIC balance indexer (optional) |
| `GIC_INDEXER_KEY` | ❌ | Indexer API key (optional) |
| `REDIS_URL` | ❌ | Redis for persistence (optional) |
| `NEXT_PUBLIC_BASE_URL` | ❌ | Base URL for API calls |

### GitHub Actions Setup

1. **Enable GitHub Actions** in your repository settings
2. **Set up secrets** (if using custom tokens):
   - `GH_TOKEN` - GitHub personal access token with repo permissions
3. **Push to feature branch** - workflow will auto-merge to main

## 📱 User Experience

### Default Landing
- Root URL (`/`) redirects to `/feed`
- Feed is the primary interface

### Apprentice Mode
1. **Toggle ON** in the composer
2. **Post reflection** - generates lesson instantly
3. **OAA snapshot** sent to Lab7 with trace ID
4. **Echo polling** checks for responses every 20s
5. **Threaded display** shows lesson and echoes

### Feed Features
- **Real-time updates** every 15 seconds
- **GIC balance** in header and sidebar
- **Archetype tags** on posts
- **Reaction buttons** (Agree, Insight, Reflect)
- **Community insights** in right sidebar

## 🔍 Testing OAA Integration

### 1. Enable Apprentice Mode
- Check the "Apprentice Mode (OAA)" checkbox
- Post a reflection

### 2. Verify Lesson Generation
- Should see "Apprentice Lesson" card immediately
- Contains topic, question, and challenge

### 3. Check OAA Echoes
- Within 20 seconds, "OAA Echoes" panel should appear
- Shows threaded responses from Lab7

### 4. Monitor Lab7
- Check Lab7 logs for snapshot ingestion
- Verify trace IDs are being received

## 🐛 Troubleshooting

### Build Errors
```bash
# Install missing dependencies
npm install ioredis

# Fix TypeScript errors
npm run build
```

### OAA Echoes Not Appearing
1. Check `OAA_API_URL` and `OAA_API_KEY`
2. Verify Lab7 is running and accessible
3. Check browser network tab for API failures
4. Ensure trace IDs are being generated

### Feed Not Updating
1. Check Redis configuration (optional)
2. Verify in-memory fallback
3. Check browser console for errors

### Auto-Merge Not Working
1. Verify GitHub Actions permissions
2. Check workflow file syntax
3. Ensure `GITHUB_TOKEN` has proper scopes

## 📊 Architecture Overview

```
User Reflection → OAA API → Lesson Summary → Civic Ledger (XP + GIC)
     ↓
Local Synthesis (always available)
     ↓
OAA Echo Polling (every 20s)
     ↓
Threaded Display
```

## 🎨 Styling

The app uses a custom CSS system with CSS variables:
- **Dark theme** with Concord branding
- **2005 Facebook layout** with modern touches
- **Responsive design** for mobile and desktop
- **Accessible components** with proper ARIA labels

## 📈 Next Steps

1. **Deploy to Render** with environment variables
2. **Test OAA integration** with Lab7
3. **Monitor GitHub Actions** for auto-merge
4. **Configure GIC indexer** for balance tracking
5. **Set up Redis** for persistence (optional)

## 🔗 Related Files

- `src/app/feed/page.tsx` - Main feed interface
- `src/components/ReflectionInput.tsx` - Composer with Apprentice Mode
- `src/components/ReflectionPost.tsx` - Post display with echoes
- `src/app/api/oaa/reflect/route.ts` - OAA lesson generation
- `src/app/api/oaa/echo/since/route.ts` - OAA echo polling
- `.github/workflows/auto-merge.yml` - Auto-deployment workflow