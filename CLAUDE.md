# Claude Code Setup Guide

## Initial Repository Setup

### 1. Create Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 2. Install Core Dependencies
```bash
npm install @anthropic-ai/sdk cheerio zod prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

### 3. Environment Variables
Create `.env.local`:
```
ANTHROPIC_API_KEY=your-key-here
DATABASE_URL="file:./dev.db"
```

**Important:** Never paste API keys directly in chat - they get logged. Use:
```bash
read -s KEY && echo "ANTHROPIC_API_KEY=$KEY" >> .env.local
```

### 4. GitHub CLI Setup
```bash
brew install gh
gh auth login -h github.com -p https -w
```

If you need workflow permissions (for GitHub Actions):
```bash
gh auth refresh -h github.com -s repo,workflow
```

### 5. Install Claude GitHub App
Run `/install-github-app` in Claude Code to set up:
- `claude.yml` - PR assistant workflow
- `claude-code-review.yml` - Code review workflow

## Project Structure
```
src/
  app/           # Next.js App Router pages
prisma/
  schema.prisma  # Database schema
```

## Git Workflow

**Always follow gitflow:**
1. Create a feature branch from main: `git checkout -b feature/description`
2. Make commits on the feature branch
3. Push and create a PR: `git push -u origin feature/description && gh pr create`
4. **Always squash merge:** `gh pr merge <number> --squash`
5. Pull main and clean up: `git checkout main && git pull && git branch -d feature/description`

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates

## Common Commands
- `npm run dev` - Start dev server
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open database GUI
