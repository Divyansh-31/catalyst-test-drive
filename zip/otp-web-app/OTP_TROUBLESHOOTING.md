# OTP Service Troubleshooting Guide

## Quick Start

1. **Ensure the OTP server is running:**
   ```bash
   cd zip/otp-web-app
   npm install
   node server.js
   ```
   
   You should see:
   ```
   ✅ Server running on http://localhost:3000
   🔐 Twilio Account SID: ✓ Set
   🔐 Twilio Auth Token: ✓ Set
   📱 Twilio Phone: ✓ Set
   ```

2. **Verify .env file has Twilio credentials:**
   ```
   cat zip/otp-web-app/.env
   ```

## Common Issues & Solutions

### 1. "Failed to send OTP: Cannot POST /send-otp"
**Problem:** OTP server is not running
**Solution:**
- Start the server: `node server.js` in the `zip/otp-web-app` directory
- Verify it's running on `http://localhost:3000`

### 2. "Invalid phone number format"
**Problem:** Phone number is not in the correct format
**Solution:**
- Use format: `+91XXXXXXXXXX` (with country code) or `10-digit` number
- Example: `+919876543210` or `9876543210`
- The server automatically converts 10-digit Indian numbers to `+91...` format

### 3. "Network error: Unable to reach OTP service"
**Problem:** Frontend can't connect to `http://localhost:3000`
**Solutions:**
- Verify OTP server is running (`node server.js`)
- Check VITE_OTP_API_URL in `.env.` file (should be `http://localhost:3000`)
- Ensure both frontend and OTP server are running on the same machine
- If running on different machines, update `.env` with OTP server's IP/domain

### 4. "Twilio authentication failed - check credentials"
**Problem:** Twilio credentials are invalid or expired
**Solutions:**
- Get new credentials from Twilio Console (https://www.twilio.com/console)
- Update `.env` file with:
  ```
  TWILIO_ACCOUNT_SID=your_account_sid
  TWILIO_AUTH_TOKEN=your_auth_token
  TWILIO_PHONE=+1xxxxxxxxxx
  ```
- Restart the server: `node server.js`

### 5. OTP Verification "OTP not found or expired"
**Problem:** OTP was not sent or has expired (5 minute timeout)
**Solutions:**
- OTP expires after 5 minutes - request a new one
- Ensure OTP was actually sent (check server logs)
- Make sure you're using the same phone number for send and verify

### 6. "Too many incorrect attempts. Please request a new OTP"
**Problem:** 3 wrong OTP attempts made
**Solution:**
- Click "Resend code" to get a new OTP
- Re-enter the new code carefully

## Testing Locally

### Test OTP Send:
```bash
curl -X POST http://localhost:3000/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'
```

### Test OTP Verify:
```bash
curl -X POST http://localhost:3000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456"}'
```

## Environment Variables Reference

| Variable | Format | Required | Example |
|----------|--------|----------|---------|
| TWILIO_ACCOUNT_SID | String | Yes | AC3eeac2c1d... |
| TWILIO_AUTH_TOKEN | String | Yes | e64a565aa1b3... |
| TWILIO_PHONE | E.164 format | Yes | +16504819322 |
| PORT | Number | No | 3000 |

## Browser Console Logs

Check browser console (F12 → Console) for debug logs:
- `[Frontend] Sending OTP to...` - Phone validation passed
- `[Frontend] OTP sent successfully` - Backend responded OK
- `[Frontend] Verifying OTP for...` - Verification attempt
- `Network error` - Server not reachable

## Server Logs

Watch server logs for debugging:
```
[OTP] Sending to +919876543210, OTP: 123456
[OTP] SMS sent successfully to +919876543210
[OTP] Verify attempt for +919876543210
[OTP] Successfully verified +919876543210
```

## Still Having Issues?

1. Check both terminal windows are running:
   - OTP Server: `node zip/otp-web-app/server.js`
   - Frontend: `npm run dev`

2. Verify network connectivity - both should be on same localhost

3. Check .env files exist and are properly formatted

4. Clear browser cache (Ctrl+Shift+Delete) and refresh

5. Check Twilio account status isn't suspended

6. Review Twilio logs for SMS delivery issues
