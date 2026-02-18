/**
 * FraudX Ping Simulation Service
 * Sends location pings to FraudX geolocation dashboard when refund is triggered
 */

import { FRAUDX_CONFIG } from '@/config/fraudxConfig';

// Movement routes for different fraud scenarios
const routes = {
    normal: [
        // Very small ~10m jumps around Pune (max ~36 km/h at 1s interval - safe from fraud)
        // FraudX threshold is 100 km/h, so 10m at 1s = 36 km/h is well under
        { name: 'Shivajinagar Start', lat: 18.5204, lon: 73.8567 },
        { name: 'Point 2', lat: 18.52045, lon: 73.8568 },   // ~10m
        { name: 'Point 3', lat: 18.5205, lon: 73.8569 },    // ~10m
        { name: 'Point 4', lat: 18.52055, lon: 73.857 },    // ~10m
        { name: 'Point 5', lat: 18.5206, lon: 73.8571 },    // ~10m
        { name: 'Point 6', lat: 18.52065, lon: 73.8572 },   // ~10m
        { name: 'Point 7', lat: 18.5207, lon: 73.8573 },    // ~10m
        { name: 'Point 8', lat: 18.52075, lon: 73.8574 },   // ~10m
        { name: 'Point 9', lat: 18.5208, lon: 73.8575 },    // ~10m
        { name: 'Point 10', lat: 18.52085, lon: 73.8576 },  // ~10m
    ],
    fast: [
        // ~1km jumps (200+ km/h - triggers fraud!)
        { name: 'Pune Start', lat: 18.5204, lon: 73.8567 },
        { name: 'Jump 1', lat: 18.5304, lon: 73.8667 },
        { name: 'Jump 2', lat: 18.5404, lon: 73.8767 },
        { name: 'Jump 3', lat: 18.5504, lon: 73.8867 },
        { name: 'Jump 4', lat: 18.5604, lon: 73.8967 },
        { name: 'Far Away', lat: 18.6204, lon: 73.9567 },
    ],
    teleport: [
        // Extreme jumps across India (impossible - definitely fraud!)
        { name: 'Pune', lat: 18.5204, lon: 73.8567 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
        { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
        { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
        { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    ],
};

type MovementMode = 'normal' | 'fast' | 'teleport';

// Store active simulations
const activeSimulations: Map<string, NodeJS.Timeout> = new Map();

/**
 * Get a random interval based on mode
 * Normal mode: 1-10 seconds (speed capped at ~90 km/h with 25m jumps)
 * Fast/Teleport: 1-10 seconds (intentionally fast for fraud demo)
 */
const getRandomInterval = (): number => {
    const min = FRAUDX_CONFIG.MIN_INTERVAL * 1000;
    const max = FRAUDX_CONFIG.MAX_INTERVAL * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Get a random movement mode (unused now - user selects mode)
 */
const getRandomMode = (): MovementMode => {
    const modes: MovementMode[] = ['normal', 'fast', 'teleport'];
    return modes[Math.floor(Math.random() * modes.length)];
};

/**
 * Send a single ping to FraudX server
 */
const sendPing = async (
    deviceId: string,
    lat: number,
    lon: number,
    amount: number,
    orderId: string
): Promise<void> => {
    const payload = {
        deviceId,
        userCoords: { lat, lon },
        timestamp: Date.now(),
        amount,
        orderId
    };

    try {
        const response = await fetch(
            `${FRAUDX_CONFIG.SERVER_URL}${FRAUDX_CONFIG.PING_ENDPOINT}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (data.fraudTypes) {
            console.log(`🚨 [FraudX] FRAUD DETECTED: ${data.fraudTypes.join(', ')} | Speed: ${data.speed?.toFixed(1)} km/h`);
        } else {
            console.log(`✅ [FraudX] Ping OK | Speed: ${data.speed?.toFixed(1) || 'N/A'} km/h`);
        }
    } catch (error) {
        console.error('❌ [FraudX] Ping failed:', error);
    }
};

/**
 * Reset Redis state for a device (clears last ping memory)
 * This prevents "impossible jump" errors when restarting simulations
 */
const resetRedisState = async (deviceId: string): Promise<boolean> => {
    try {
        const response = await fetch(
            `${FRAUDX_CONFIG.SERVER_URL}${FRAUDX_CONFIG.RESET_ENDPOINT}/${deviceId}`,
            {
                method: 'DELETE',
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                }
            }
        );
        const data = await response.json();
        if (data.ok) {
            console.log(`🗑️ [FraudX] Reset Redis state for device: ${deviceId}`);
            return true;
        }
        return false;
    } catch (error) {
        console.warn('⚠️ [FraudX] Failed to reset Redis (continuing anyway):', error);
        return false;
    }
};

/**
 * Set the delivery location for an order
 * This establishes the "safe" zone. Pings outside 1.2km will trigger GeoMismatch.
 */
export const setDeliveryLocation = async (
    deviceId: string,
    lat: number,
    lon: number,
    city: string
): Promise<boolean> => {
    try {
        const response = await fetch(
            `${FRAUDX_CONFIG.SERVER_URL}${FRAUDX_CONFIG.SET_DELIVERY_ENDPOINT}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ deviceId, Lat: lat, Lon: lon, city }),
            }
        );
        const data = await response.json();
        if (data.ok || response.ok) {
            console.log(`🏠 [FraudX] Delivery location set for ${deviceId} at ${city} (${lat}, ${lon})`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ [FraudX] Failed to set delivery location:', error);
        return false;
    }
};

/**
 * Start ping simulation for a refund request
 * Runs continuously until stopped by user
 * @param orderId - The order ID (used as device ID for tracking)
 * @param mode - Movement mode ('normal' | 'fast' | 'teleport' | 'geoMismatch')
 */
export const startRefundPingSimulation = async (
    orderId: string,
    mode: MovementMode | 'geoMismatch' = 'normal',
    amount: number
): Promise<void> => {
    // Stop any existing simulation for this order
    stopPingSimulation(orderId);

    // Reset Redis state to prevent "impossible jump" from previous sessions
    await resetRedisState(orderId);

    // Special handling for GeoMismatch
    if (mode === 'geoMismatch') {
        // Step 1: Set delivery in Pune
        await setDeliveryLocation(orderId, 18.5204, 73.8567, 'Pune');

        console.log(`🚀 [FraudX] Starting GEO-MISMATCH simulation for order: ${orderId}`);
        console.log(`📢 [FraudX] Delivery is in PUNE, but user is pinging from MUMBAI`);

        // Step 2: Ping from Mumbai (far away)
        const mumbaiLocation = { lat: 19.0760, lon: 72.8777 };

        const sendMismatchPing = () => {
            if (!activeSimulations.has(orderId)) return;

            console.log(`📍 [FraudX] Pinging from MUMBAI (${mumbaiLocation.lat}, ${mumbaiLocation.lon}) - Expected PUNE`);
            sendPing(orderId, mumbaiLocation.lat, mumbaiLocation.lon, amount, orderId);

            // Keep pinging to show persistent mismatch
            const timeoutId = setTimeout(sendMismatchPing, 5000);
            activeSimulations.set(orderId, timeoutId);
        };

        activeSimulations.set(orderId, setTimeout(() => { }, 0));
        sendMismatchPing();
        return;
    }

    const route = routes[mode];
    let position = 0;
    let pingCount = 0;
    let direction = 1; // 1 = forward, -1 = backward (ping-pong)

    console.log(`🚀 [FraudX] Starting ${mode.toUpperCase()} ping simulation for order: ${orderId}`);
    console.log(`📢 [FraudX] Simulation will run until manually stopped`);

    const sendNextPing = () => {
        // Check if simulation was stopped
        if (!activeSimulations.has(orderId)) {
            return;
        }

        const location = route[position];
        pingCount++;
        console.log(`📍 [FraudX] Ping #${pingCount}: ${location.name} (${location.lat}, ${location.lon})`);

        sendPing(orderId, location.lat, location.lon, amount, orderId);

        // Move to next position using ping-pong pattern (forward then backward)
        // This avoids large jumps when reaching the end of the route
        position += direction;

        // Reverse direction at ends
        if (position >= route.length - 1) {
            direction = -1;
            console.log(`🔄 [FraudX] Reached end, reversing direction...`);
        } else if (position <= 0) {
            direction = 1;
            console.log(`🔄 [FraudX] Reached start, reversing direction...`);
        }

        // Schedule next ping with random interval
        const nextInterval = getRandomInterval();
        console.log(`⏱️ [FraudX] Next ping in ${(nextInterval / 1000).toFixed(1)}s`);

        const timeoutId = setTimeout(sendNextPing, nextInterval);
        activeSimulations.set(orderId, timeoutId);
    };

    // Mark as active before starting
    activeSimulations.set(orderId, setTimeout(() => { }, 0));

    // Start immediately
    sendNextPing();
};

/**
 * Check if a simulation is active for an order
 */
export const isSimulationActive = (orderId: string): boolean => {
    return activeSimulations.has(orderId);
};

/**
 * Stop ping simulation for an order
 */
export const stopPingSimulation = (orderId: string): boolean => {
    const timeoutId = activeSimulations.get(orderId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        activeSimulations.delete(orderId);
        console.log(`⏹️ [FraudX] Stopped simulation for order: ${orderId}`);
        return true;
    }
    return false;
};

/**
 * Stop all active simulations
 */
export const stopAllSimulations = (): number => {
    const count = activeSimulations.size;
    activeSimulations.forEach((timeoutId) => clearTimeout(timeoutId));
    activeSimulations.clear();
    return count;
};
