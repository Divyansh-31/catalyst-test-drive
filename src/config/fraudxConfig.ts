// FraudX Server Configuration
export const FRAUDX_CONFIG = {
    // Your friend's ngrok URL for the FraudX server
    SERVER_URL: 'https://prepositively-subtertian-marlene.ngrok-free.dev',

    // API endpoints
    PING_ENDPOINT: '/api/location/ping',
    RESET_ENDPOINT: '/api/location/reset',

    // Ping interval range (in seconds)
    MIN_INTERVAL: 1,
    MAX_INTERVAL: 10,
};
