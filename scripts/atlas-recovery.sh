#!/bin/bash
# ATLAS Lab4-Proof Recovery Script
# Cycle C-112

set -e

echo "🚨 ATLAS RECOVERY OPERATION - Lab4-Proof"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Backup current state
echo -e "${YELLOW}📦 Step 1: Creating backup...${NC}"
BACKUP_FILE="lab4-proof-backup-$(date +%Y%m%d-%H%M%S).bundle"
git bundle create "$BACKUP_FILE" --all
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
echo ""

# 2. Identify branches
echo -e "${YELLOW}🔍 Step 2: Analyzing branches...${NC}"
echo "Available branches:"
git branch -a
echo ""

# 3. Check for problematic changes in public-repo
if git rev-parse --verify origin/cursor/organize-repository-for-public-presentation-fd6a >/dev/null 2>&1; then
    echo -e "${YELLOW}📊 Step 3: Analyzing public-repo changes...${NC}"
    
    # Count files changed
    CHANGED_FILES=$(git diff --name-only main...origin/cursor/organize-repository-for-public-presentation-fd6a | wc -l)
    echo "Files changed: $CHANGED_FILES"
    
    # Show summary
    git diff --stat main...origin/cursor/organize-repository-for-public-presentation-fd6a
    echo ""
    
    # Generate detailed diff
    git diff main...origin/cursor/organize-repository-for-public-presentation-fd6a > changes-analysis.diff
    echo -e "${GREEN}✅ Diff saved to: changes-analysis.diff${NC}"
else
    echo -e "${RED}❌ Branch 'origin/cursor/organize-repository-for-public-presentation-fd6a' not found${NC}"
fi
echo ""

# 4. Create recovery branch
echo -e "${YELLOW}🛠️  Step 4: Creating recovery branch...${NC}"
git checkout main
git checkout -b atlas-recovery-c112
echo -e "${GREEN}✅ Recovery branch created: atlas-recovery-c112${NC}"
echo ""

# 5. Verify critical files
echo -e "${YELLOW}🔍 Step 5: Verifying critical files...${NC}"

CRITICAL_FILES=(
    "main.py"
    "backend/api/charter.py"
    "config/charters/ai_integrity_constitution.v1.json"
    "scripts/sign-charter.py"
    "requirements.txt"
    "frontend/pages/index.tsx"
)

MISSING_FILES=()
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing: $file${NC}"
        MISSING_FILES+=("$file")
    else
        echo -e "${GREEN}✅ Found: $file${NC}"
    fi
done
echo ""

# 6. Restore missing critical files from main
if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}🔧 Step 6: Restoring missing files from main...${NC}"
    for file in "${MISSING_FILES[@]}"; do
        if git cat-file -e main:"$file" 2>/dev/null; then
            git checkout main -- "$file"
            echo -e "${GREEN}✅ Restored: $file${NC}"
        else
            echo -e "${RED}❌ Cannot restore $file (not in main)${NC}"
        fi
    done
else
    echo -e "${GREEN}✅ Step 6: All critical files present${NC}"
fi
echo ""

# 7. Check for constitutional features
echo -e "${YELLOW}🔍 Step 7: Checking for constitutional features...${NC}"

CONSTITUTIONAL_FEATURES=(
    "backend/api/identity.py"
    "frontend/pages/onboarding/step1.tsx"
    "frontend/pages/onboarding/step2.tsx"
    "frontend/pages/onboarding/step3.tsx"
    "frontend/pages/onboarding/step4.tsx"
    "frontend/pages/dashboard.tsx"
)

MISSING_FEATURES=()
for file in "${CONSTITUTIONAL_FEATURES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing feature: $file${NC}"
        MISSING_FEATURES+=("$file")
    else
        echo -e "${GREEN}✅ Found feature: $file${NC}"
    fi
done
echo ""

# 8. Analyze recent commits
echo -e "${YELLOW}📈 Step 8: Analyzing recent commits...${NC}"
echo "Recent commits on current branch:"
git log --oneline -10
echo ""

echo "Recent commits on main:"
git log main --oneline -10
echo ""

# 9. Summary
echo ""
echo "========================================="
echo -e "${GREEN}🎉 ATLAS RECOVERY PREP COMPLETE${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Review changes-analysis.diff"
echo "2. Check missing features list"
echo "3. Cherry-pick good commits from other branches"
echo "4. Test the recovery branch"
echo "5. When satisfied: git push origin atlas-recovery-c112"
echo ""
echo "Backup location: $BACKUP_FILE"
echo "Recovery branch: atlas-recovery-c112"
echo "Missing features: ${#MISSING_FEATURES[@]}"
echo "Missing critical files: ${#MISSING_FILES[@]}"