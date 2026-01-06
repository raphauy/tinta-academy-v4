#!/bin/bash
set -e

MILESTONE=${1:-02-landing}
PRD_FILE="plans/prd/${MILESTONE}.json"

if [ ! -f "$PRD_FILE" ]; then
  echo "Error: PRD not found: $PRD_FILE"
  exit 1
fi

claude --permission-mode acceptEdits "@${PRD_FILE} @plans/progress.txt @plans/AGENT.md \
1. Find the highest-priority PRD item (passes: false) and work ONLY on that ONE item. \
This should be the one YOU decide has the highest priority - not necessarily the first in the list. \
2. Check that pnpm typecheck, pnpm lint, and pnpm build all pass. \
3. Update the PRD: set passes: true ONLY for the ONE item you completed. \
4. Append your progress to the progress.txt file. \
Use this to leave a note for the next person working in the codebase. \
5. Make a git commit of that feature. \
CRITICAL: Complete exactly ONE PRD item per session. Not two, not three - ONE. \
If the PRD has no items with passes: false, output <promise>COMPLETE</promise>. \
"
