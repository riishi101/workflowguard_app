@echo off
echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Complete settings implementation - Added notification settings endpoints - Implemented API key management - Enhanced user controller and service - All 6 settings tabs now fully functional"

echo Pushing to remote...
git push

echo Done!
pause 