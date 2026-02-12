// OTP Backend Configuration
// The OTP server (zip/otp-web-app) runs on port 3000
// In dev, Vite proxies /send-otp and /verify-otp to this URL
export const OTP_CONFIG = {
    // Base URL is empty in dev (proxied by Vite) — set a full URL for production
    BASE_URL: '',

    ENDPOINTS: {
        SEND_OTP: '/send-otp',
        VERIFY_OTP: '/verify-otp',
    },

    // OTP validity duration (matches backend: 5 minutes)
    OTP_VALIDITY_MS: 5 * 60 * 1000,

    // Max verification attempts (matches backend)
    MAX_ATTEMPTS: 3,
};
