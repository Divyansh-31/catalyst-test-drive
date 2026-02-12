// test_ping.js using ES Modules (Node 18+)
const FRAUDX_URL = 'https://prepositively-subtertian-marlene.ngrok-free.dev/api/location/ping';

const payload = {
    deviceId: 'TEST-DEVICE-001',
    userCoords: { lat: 18.5204, lon: 73.8567 }, // Pune
    deliveryCoords: { lat: 18.5204, lon: 73.8567 }, // Pune (Same location)
    timestamp: Date.now()
};

console.log('Sending Test Payload:', payload);

try {
    const response = await fetch(FRAUDX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response:', data);

    if (data.fraudTypes && data.fraudTypes.includes('GeoMismatch')) {
        console.error('FAIL: Server still reports GeoMismatch for identical coordinates!');
    } else {
        console.log('PASS: Server correctly accepted matching coordinates.');
    }
} catch (error) {
    console.error('Error:', error);
}
