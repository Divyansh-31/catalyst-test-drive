// FraudX Server Configuration
export const FRAUDX_CONFIG = {
    // Ngrok FraudX backend
    SERVER_URL: 'https://prepositively-subtertian-marlene.ngrok-free.dev',

    // API endpoints
    PING_ENDPOINT: '/api/location/ping',
    RESET_ENDPOINT: '/api/location/reset',
    SET_DELIVERY_ENDPOINT: '/api/location/set-delivery',

    // Ping interval range (in seconds)
    MIN_INTERVAL: 1,
    MAX_INTERVAL: 10,
};
