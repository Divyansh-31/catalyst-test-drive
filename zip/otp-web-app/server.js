require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const twilio = require("twilio");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// TEMP store (use Redis/DB in prod)
const otpStore = {};

// helpers
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// Validate and format phone number to E.164 format
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // Handle Indian numbers - if it's 10 digits, add country code
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  
  // If no country code, assume invalid
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }
  
  // Format to E.164
  return "+" + cleaned;
};

// SEND OTP
app.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;
  
  if (!mobile) {
    return res.status(400).json({ message: "Mobile number required", code: "MISSING_PHONE" });
  }

  const formattedPhone = formatPhoneNumber(mobile);
  
  if (!formattedPhone) {
    return res.status(400).json({ 
      message: "Invalid phone number format. Please use format: +91XXXXXXXXXX or 10-digit number", 
      code: "INVALID_FORMAT" 
    });
  }

  const otp = generateOTP();

  otpStore[formattedPhone] = {
    otp: hashOTP(otp),
    expires: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  };

  try {
    console.log(`[OTP] Sending to ${formattedPhone}, OTP: ${otp}`);
    
    // Check if Twilio credentials are set
    if (!process.env.TWILIO_PHONE) {
      throw new Error("TWILIO_PHONE not configured");
    }
    
    await client.messages.create({
      body: `Your OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone,
    });

    console.log(`[OTP] SMS sent successfully to ${formattedPhone}`);
    res.json({ message: "OTP sent successfully", code: "OTP_SENT" });
  } catch (err) {
    console.error(`[OTP] Error sending SMS:`, err.message);
    
    // Return detailed error information for debugging
    let errorMessage = "Failed to send OTP";
    let errorCode = "SMS_FAILED";
    
    if (err.message.includes("not found")) {
      errorMessage = "Invalid phone number";
      errorCode = "INVALID_PHONE";
    } else if (err.message.includes("authenticate")) {
      errorMessage = "Twilio authentication failed - check credentials";
      errorCode = "AUTH_FAILED";
    }
    
    res.status(500).json({ message: errorMessage, code: errorCode, details: err.message });
  }
});

// VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;
  
  if (!mobile || !otp) {
    return res.status(400).json({ 
      message: "Mobile number and OTP required", 
      code: "MISSING_PARAMS" 
    });
  }
  
  const formattedPhone = formatPhoneNumber(mobile);
  
  if (!formattedPhone) {
    return res.status(400).json({ 
      message: "Invalid phone number format", 
      code: "INVALID_FORMAT" 
    });
  }

  const record = otpStore[formattedPhone];

  console.log(`[OTP] Verify attempt for ${formattedPhone}`);

  if (!record) {
    console.log(`[OTP] No OTP found for ${formattedPhone}`);
    return res.status(400).json({ message: "OTP not found or expired", code: "OTP_NOT_FOUND" });
  }
  
  if (Date.now() > record.expires) {
    console.log(`[OTP] OTP expired for ${formattedPhone}`);
    delete otpStore[formattedPhone];
    return res.status(400).json({ message: "OTP expired. Please request a new one", code: "OTP_EXPIRED" });
  }

  if (record.attempts >= 3) {
    console.log(`[OTP] Too many attempts for ${formattedPhone}`);
    delete otpStore[formattedPhone];
    return res.status(429).json({ message: "Too many incorrect attempts. Please request a new OTP", code: "TOO_MANY_ATTEMPTS" });
  }

  if (hashOTP(otp) !== record.otp) {
    record.attempts++;
    console.log(`[OTP] Invalid OTP for ${formattedPhone} (attempt ${record.attempts})`);
    return res.status(400).json({ message: `Invalid OTP (${record.attempts}/3)`, code: "INVALID_OTP" });
  }

  delete otpStore[formattedPhone];
  console.log(`[OTP] Successfully verified ${formattedPhone}`);
  res.json({ message: "Authentication successful", code: "OTP_VERIFIED" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`🔐 Twilio Account SID: ${process.env.TWILIO_ACCOUNT_SID ? "✓ Set" : "✗ Missing"}`);
  console.log(`🔐 Twilio Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? "✓ Set" : "✗ Missing"}`);
  console.log(`📱 Twilio Phone: ${process.env.TWILIO_PHONE || "✗ Missing"}\n`);
});
