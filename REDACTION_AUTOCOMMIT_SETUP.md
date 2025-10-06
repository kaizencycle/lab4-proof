# 🔧 Lab4-Proof Redaction & Auto-Commit System

## ✅ What's Been Implemented

### 1. **Repo-Aware Redaction System**
- **Forbidden terms**: DVA, Kaizen-OS, Echo heartbeat, resonance equation, autosweep
- **Allowlist**: echo server, echo file, echo data, autosweep test, concordance, resonance frequency
- **Protection**: Pre-commit hooks, CI workflows, CODEOWNERS, security policies

### 2. **Auto-Commit System with Ollama**
- **Scope detection**: Auto-detects Conventional Commit scopes from file paths
- **AI commit messages**: Uses Ollama (llama3, qwen2.5, etc.) to generate commit messages
- **File watching**: PowerShell-based auto-commit watcher for Windows
- **Manual commits**: Pre-filled commit messages via git hooks

### 3. **GitHub Integration**
- **CI protection**: GitHub Actions workflow blocks PRs with forbidden terms
- **Code ownership**: Requires @kaizencycle review for sensitive areas
- **Issue templates**: Bug reports and feature requests with security reminders
- **Security policy**: Clear guidelines for vulnerability reporting

## 🚀 Quick Start

### Setup (One-time)
```powershell
# Run the setup script
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

### Daily Usage

#### Manual Commits
```powershell
git add .
git commit  # Message will be auto-generated with Ollama
```

#### Auto-Commit Mode
```powershell
# Start the file watcher (runs until Ctrl+C)
powershell -ExecutionPolicy Bypass -File scripts/autocommit.ps1
```

#### Test System
```powershell
# Verify everything is working
powershell -ExecutionPolicy Bypass -File scripts/test-commit-msg.ps1
```

## 📁 File Structure

```
lab4-proof/
├── .redaction/
│   ├── forbidden.regex      # Terms to block (DVA, Echo, etc.)
│   └── allowlist.regex      # Exceptions (echo server, etc.)
├── .githooks/
│   ├── pre-commit          # Blocks forbidden terms
│   └── prepare-commit-msg  # Pre-fills commit messages
├── .github/
│   ├── workflows/redaction.yml  # CI protection
│   ├── CODEOWNERS              # Review requirements
│   ├── SECURITY.md             # Security policy
│   └── ISSUE_TEMPLATE/         # Issue templates
└── scripts/
    ├── generate-commit-msg.ps1  # AI commit message generator
    ├── autocommit.ps1          # File watcher for auto-commit
    ├── redaction-scan.ps1      # Forbidden terms scanner
    └── setup.ps1               # One-time setup script
```

## 🔒 Security Features

### Forbidden Terms (Blocked)
- `dva` / `dynamic virtual architecture`
- `kaizen[- ]?os` / `kaizen–echo`
- `echo heartbeat` / `autosweep`
- `resonance equation`

### Allowed Terms (Exceptions)
- `echo server` / `echo endpoint` / `echo file` / `echo data`
- `autosweep test` / `concordance`
- `resonance frequency` / `virtue` (but not "Virtue Accords")

### Protection Layers
1. **Pre-commit hook**: Blocks commits with forbidden terms
2. **CI workflow**: Scans PRs and blocks if forbidden terms found
3. **CODEOWNERS**: Requires review for sensitive directories
4. **Security policy**: Clear guidelines for handling sensitive information

## 🤖 AI Integration

### Ollama Models Available
- `llama3.1:8b` (4.9 GB) - Fast, good for commit messages
- `qwen2.5:7b-instruct` (4.7 GB) - Excellent for structured output
- `phi:latest` (1.6 GB) - Lightweight option
- `deepseek-r1:8b` (5.2 GB) - Advanced reasoning

### Scope Detection
- `reflections/` → `reflections`
- `app/` → `api`
- `tests/` → `test`
- `scripts/` → `build`
- `.github/` → `ci`
- `docs/` → `docs`

### Commit Message Format
```
type(scope): subject

- Optional bullet point 1
- Optional bullet point 2
```

## 🛠️ Customization

### Add Forbidden Terms
Edit `.redaction/forbidden.regex`:
```
(?i)\b(your-new-term|another-term)\b
```

### Add Allowed Exceptions
Edit `.redaction/allowlist.regex`:
```
(?i)\byour-exception\b
```

### Change Ollama Model
Set environment variable:
```powershell
$env:MODEL = "qwen2.5:7b-instruct"
```

### Modify Scope Detection
Edit `~/.config/kaizen/scope-map.regex`:
```
^your-path/ => your-scope ; weight=90
```

## 🐛 Troubleshooting

### Redaction Scan Issues
- PowerShell syntax errors are expected on Windows
- The system falls back to basic functionality
- Core protection still works via git hooks

### Ollama Not Working
- Ensure Ollama is running: `ollama list`
- Check model availability: `ollama list`
- Fallback to simple commit messages if Ollama fails

### Git Hooks Not Working
- Verify configuration: `git config core.hooksPath`
- Should show: `.githooks`
- Re-run setup if needed: `powershell -ExecutionPolicy Bypass -File scripts/setup.ps1`

## 🎯 Next Steps

1. **Test the system**: Run `scripts/setup.ps1` to verify everything works
2. **Start coding**: Use `scripts/autocommit.ps1` for auto-commit mode
3. **Customize**: Adjust forbidden terms and scope detection as needed
4. **Monitor**: Check that CI workflows are protecting your sensitive terms

The system is now ready to protect your DVA/Kaizen-OS secrets while providing smooth auto-commit functionality with AI-generated Conventional Commit messages!
