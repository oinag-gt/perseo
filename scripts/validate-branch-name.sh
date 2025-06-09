#!/bin/bash

# Branch name validation script for PERSEO project
# Usage: ./scripts/validate-branch-name.sh <branch-name>

BRANCH_NAME=$1

if [ -z "$BRANCH_NAME" ]; then
    echo "Usage: $0 <branch-name>"
    exit 1
fi

# Valid branch name pattern
VALID_PATTERN="^(feature|fix|docs|refactor|test|chore|hotfix)\/[a-z0-9-]+$"

# Protected branches
PROTECTED_BRANCHES="^(main|develop)$"

# Check if it's a protected branch
if [[ $BRANCH_NAME =~ $PROTECTED_BRANCHES ]]; then
    echo "✅ Protected branch: $BRANCH_NAME"
    exit 0
fi

# Check if branch name follows naming convention
if [[ $BRANCH_NAME =~ $VALID_PATTERN ]]; then
    echo "✅ Valid branch name: $BRANCH_NAME"
    exit 0
else
    echo "❌ Invalid branch name: $BRANCH_NAME"
    echo ""
    echo "Branch names must follow the pattern:"
    echo "<type>/<scope>-<description>"
    echo ""
    echo "Valid types: feature, fix, docs, refactor, test, chore, hotfix"
    echo "Examples:"
    echo "  feature/auth-email-verification"
    echo "  fix/login-session-timeout"
    echo "  docs/api-documentation"
    echo "  refactor/user-service-cleanup"
    echo ""
    exit 1
fi