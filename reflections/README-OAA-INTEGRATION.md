# Reflections Wall with OAA Integration

A 2005 Facebook-style social learning platform that bridges civilian reflections with the OAA (Open Apprenticeship Architecture) system.

## Features

### Core Reflections Wall
- **2005 Facebook Layout**: Black & cold Concord theme with vintage aesthetic
- **Real-time Feed**: Live updates every 15 seconds
- **GIC Integration**: Shows user balance and archetype scoring
- **Responsive Design**: Works on desktop and mobile

### OAA Integration
- **Apprentice Mode**: Toggle to enable OAA learning features
- **Local Lesson Synthesis**: Generates questions and challenges instantly
- **OAA Snapshot**: Sends reflections to Lab7 OAA system for processing
- **Echo Threading**: Polls for OAA responses and displays as threaded replies
- **Trace ID System**: Links reflections to OAA echoes for conversation continuity

### Auto-Deployment
- **GitHub Actions**: Auto-commit and auto-merge workflow
- **Continuous Integration**: Every 30 minutes sweep for open PRs
- **Render Integration**: Automatic deployment on merge to main

## Architecture

```
User Reflection → OAA API → Lesson Summary → Civic Ledger (XP + GIC)
     ↓
Local Synthesis (always available)
     ↓
OAA Echo Polling (every 20s)
     ↓
Threaded Display
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
IRON_SESSION_PASSWORD=your-32-character-secret-key-here
IRON_SESSION_COOKIE_NAME=reflections_session

# OAA Integration
OAA_API_URL=https://lab7-proof.onrender.com
OAA_API_KEY=your-lab7-api-key-here

# Optional
GIC_INDEXER_URL=https://your-indexer-url.com
GIC_INDEXER_KEY=your-indexer-key-here
REDIS_URL=redis://localhost:6379
```

## API Endpoints

### Reflections
- `POST /api/reflections/post` - Create new reflection
- `GET /api/reflections/list` - Get feed of reflections

### OAA Integration
- `POST /api/oaa/reflect` - Generate lesson from reflection
- `GET /api/oaa/echo/since?traceId=...` - Get OAA echoes for reflection

## Data Flow

1. **User posts reflection** with Apprentice Mode enabled
2. **Local synthesis** generates lesson (topic, question, challenge)
3. **OAA snapshot** sent to Lab7 with trace ID
4. **Archetype analysis** updates user's GIC and archetype scores
5. **Echo polling** checks for OAA responses every 20 seconds
6. **Threaded display** shows lesson and echoes in conversation format

## Deployment

### Manual Deployment
```bash
cd reflections
npm install
npm run build
npm start
```

### GitHub Auto-Merge
1. Push to feature branch
2. GitHub Actions auto-commits any local changes
3. Auto-merges open PRs to main every 30 minutes
4. Render automatically deploys from main branch

### Testing OAA Integration
1. Enable Apprentice Mode in composer
2. Post a reflection
3. Verify lesson card appears immediately
4. Check for OAA echoes within 20 seconds
5. Monitor Lab7 logs for snapshot ingestion

## Components

- **ReflectionInput**: Composer with Apprentice Mode toggle
- **ReflectionPost**: Display with lesson cards and echo threading
- **FeedPage**: Main wall with real-time updates
- **AppSidebar**: Navigation with Feed as default landing

## Styling

Uses `reflections.css` with CSS custom properties:
- `--bg`: Dark background (#0c0f12)
- `--panel`: Card background (#0f141b)
- `--ink`: Text color (#e0e3e8)
- `--muted`: Secondary text (#9aa7b7)
- `--line`: Borders (#203044)
- `--accent`: Highlights (#5cb3ff)

## Troubleshooting

### OAA Echoes Not Appearing
- Check `OAA_API_URL` and `OAA_API_KEY` environment variables
- Verify Lab7 is running and accessible
- Check browser network tab for API call failures
- Ensure trace IDs are being generated and sent

### Feed Not Updating
- Check if Redis is configured (optional)
- Verify in-memory fallback is working
- Check browser console for JavaScript errors

### Auto-Merge Not Working
- Verify GitHub Actions permissions
- Check workflow file syntax
- Ensure `GITHUB_TOKEN` has proper scopes

## Future Enhancements

- [ ] Echo activity badge in right column
- [ ] Per-post pause/stop polling controls
- [ ] Redis/Supabase persistence
- [ ] Echo → XP mapping
- [ ] Moderation guard for flagged content
- [ ] Real-time WebSocket updates
- [ ] Advanced lesson customization