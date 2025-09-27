@echo off
echo Deploying WorkflowGuard with production credentials...

REM Set your actual credentials here
set HUBSPOT_APP_ID=18270797
set HUBSPOT_CLIENT_ID=5e6a6429-8317-4e2a-a9b5-46e8669f72f6
set HUBSPOT_CLIENT_SECRET=07f931e2-bc75-4686-a9cf-c1d464c55019

REM You need to set these other credentials
set /p DATABASE_PASSWORD="Enter your Cloud SQL database password: "
set /p JWT_SECRET="Enter your JWT secret: "
set /p RAZORPAY_KEY_ID="Enter your Razorpay Key ID: "
set /p RAZORPAY_KEY_SECRET="Enter your Razorpay Key Secret: "
set /p TWILIO_ACCOUNT_SID="Enter your Twilio Account SID: "
set /p TWILIO_AUTH_TOKEN="Enter your Twilio Auth Token: "
set /p TWILIO_WHATSAPP_NUMBER="Enter your Twilio WhatsApp Number: "

echo.
echo Submitting build with credentials...

gcloud builds submit --config cloudbuild.yaml ^
  --substitutions _HUBSPOT_APP_ID="%HUBSPOT_APP_ID%",_HUBSPOT_CLIENT_ID="%HUBSPOT_CLIENT_ID%",_HUBSPOT_CLIENT_SECRET="%HUBSPOT_CLIENT_SECRET%",_DATABASE_PASSWORD="%DATABASE_PASSWORD%",_JWT_SECRET="%JWT_SECRET%",_RAZORPAY_KEY_ID="%RAZORPAY_KEY_ID%",_RAZORPAY_KEY_SECRET="%RAZORPAY_KEY_SECRET%",_TWILIO_ACCOUNT_SID="%TWILIO_ACCOUNT_SID%",_TWILIO_AUTH_TOKEN="%TWILIO_AUTH_TOKEN%",_TWILIO_WHATSAPP_NUMBER="%TWILIO_WHATSAPP_NUMBER%" .

pause