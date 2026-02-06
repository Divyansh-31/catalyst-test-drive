import { useState, useCallback, useEffect } from 'react';
import { GeoLocation, RiskMetadata } from '@/types';

const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
  const renderer = gl?.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || 0) || 'unknown';
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    renderer,
    navigator.hardwareConcurrency || 0,
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

const generateSessionId = (): string => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useGeofraud = () => {
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: Date.now(),
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [deviceFingerprint] = useState(() => generateDeviceFingerprint());

  const captureGeolocation = useCallback((): Promise<GeoLocation> => {
    return new Promise((resolve) => {
      setIsCapturing(true);
      
      if (!navigator.geolocation) {
        const fallback: GeoLocation = {
          latitude: null,
          longitude: null,
          accuracy: null,
          timestamp: Date.now(),
        };
        setGeoLocation(fallback);
        setIsCapturing(false);
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };
          setGeoLocation(location);
          setIsCapturing(false);
          resolve(location);
        },
        () => {
          // Silently handle denied permission
          const fallback: GeoLocation = {
            latitude: null,
            longitude: null,
            accuracy: null,
            timestamp: Date.now(),
          };
          setGeoLocation(fallback);
          setIsCapturing(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }, []);

  const captureIPMetadata = useCallback(async (): Promise<Partial<GeoLocation>> => {
    try {
      // In production, this would call a real IP geolocation service
      // For demo purposes, we'll simulate the data
      const response = await fetch('https://ipapi.co/json/').catch(() => null);
      if (response) {
        const data = await response.json();
        return {
          ip: data.ip,
          city: data.city,
          country: data.country_name,
        };
      }
    } catch {
      // Silently fail for demo
    }
    return {};
  }, []);

  const getRiskMetadata = useCallback((): RiskMetadata => {
    return {
      deviceFingerprint,
      sessionId,
      geoLocation,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, [deviceFingerprint, sessionId, geoLocation]);

  const logTransaction = useCallback((transactionData: Record<string, unknown>) => {
    const enrichedData = {
      ...transactionData,
      metadata: getRiskMetadata(),
      capturedAt: Date.now(),
    };
    
    // Log to console for demo (in production, send to FraudX backend)
    console.log('[FraudX] Transaction logged:', enrichedData);
    
    // Store locally for demo purposes
    const transactions = JSON.parse(localStorage.getItem('fraudx_transactions') || '[]');
    transactions.push(enrichedData);
    localStorage.setItem('fraudx_transactions', JSON.stringify(transactions));
    
    return enrichedData;
  }, [getRiskMetadata]);

  // Silently capture geolocation on mount
  useEffect(() => {
    captureGeolocation();
    captureIPMetadata().then((ipData) => {
      setGeoLocation((prev) => ({ ...prev, ...ipData }));
    });
  }, [captureGeolocation, captureIPMetadata]);

  return {
    geoLocation,
    isCapturing,
    sessionId,
    deviceFingerprint,
    captureGeolocation,
    getRiskMetadata,
    logTransaction,
  };
};
