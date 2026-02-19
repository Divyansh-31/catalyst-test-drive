import { FRAUDX_CONFIG } from '@/config/fraudxConfig';

// Mock database for local geo-decoding
const LOCAL_GEO_DB: Record<string, { lat: number; lon: number }> = {
    'default': { lat: 18.45516, lon: 73.85359 }, // User's specific location
};

interface Coordinates {
    lat: number;
    lon: number;
}

interface AntiGravityPayload {
    deviceId: string;
    userCoords: Coordinates;
    deliveryCoords: Coordinates;
    timestamp: number;
}

/**
 * Simulates a local 'geo-decoding' function.
 * In a real scenario, this would look up a local database or use a hardware device.
 */
const getDeliveryCoordinates = async (address: string): Promise<Coordinates> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simple hash-based randomization for demo purposes contextually linked to the input
    // to ensure consistent results for the same address string, 
    // but for this MVP we'll just return a variation near Bangalore 
    // or a hardcoded one if it matches specific keys.

    // For a real demo feel, let's just return a fixed point or slightly randomized point
    // to simulate "decoding" the specific address.
    const baseLat = 18.45516;
    const baseLon = 73.85359;

    return {
        lat: baseLat + (Math.random() * 0.01),
        lon: baseLon + (Math.random() * 0.01)
    };
};

/**
 * Retrieves the user's current coordinates from the browser's Geolocation API.
 */
const getUserCoordinates = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
};

/**
 * Sends the payload to the AntiGravity endpoint.
 */
const sendAntiGravityPayload = async (payload: AntiGravityPayload) => {
    const ENDPOINT = `${FRAUDX_CONFIG.SERVER_URL}${FRAUDX_CONFIG.PING_ENDPOINT}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.warn("AntiGravity endpoint returned non-OK status:", response.status);
        } else {
            console.log("AntiGravity payload sent successfully!");
        }
    } catch (error) {
        console.error("Failed to send AntiGravity payload:", error);
        // We don't want to block the user flow if this fails
    }
};

/**
 * Main orchestrator to trigger the AntiGravity delivery logic.
 */
export const triggerAntiGravityDelivery = async (address: string) => {
    try {
        console.log("Initiating AntiGravity delivery sequence...");

        // 1. Local Decoding
        const deliveryCoords = await getDeliveryCoordinates(address);
        console.log("Delivery Coordinates Decoded:", deliveryCoords);

        // 2. GPS Fetch
        const userCoords = await getUserCoordinates();
        console.log("User Coordinates Acquired:", userCoords);

        console.log("DEBUG: Distance Check:");
        console.log("Delivery:", deliveryCoords);
        console.log("User:", userCoords);

        // 3. Construct Payload
        const payload: AntiGravityPayload = {
            deviceId: "ORD-2024-001",
            userCoords,
            deliveryCoords,
            timestamp: Date.now(),
        };

        console.log("AntiGravity Payload Constructed:", payload);

        // 4. Transmission
        // We fire and forget this so it doesn't delay the UI significantly more than needed
        sendAntiGravityPayload(payload);

    } catch (error) {
        console.error("Error in AntiGravity delivery sequence:", error);
        // Verify if we should fallback or just log. For now, logging.
    }
};
