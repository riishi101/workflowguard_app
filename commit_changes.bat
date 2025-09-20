@echo off
cd /d "D:\workflowguard_app"
git add docker-compose.production.yml
git add backend/src/workflow/workflow.service.ts
git commit -m "Fix workflow status display issue - connect to production Neon database"
git push
pause
