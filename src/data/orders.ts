import { Order, RefundWindow } from '@/types';
import { products } from './products';

const TEN_MINUTES = 10 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const getRefundWindow = (category: string, orderTime: number): RefundWindow => {
  switch (category) {
    case 'fresh':
      return {
        type: 'blinkit',
        expiresAt: orderTime + TEN_MINUTES,
        duration: TEN_MINUTES,
      };
    case 'electronics':
      return {
        type: 'amazon',
        expiresAt: orderTime + SEVEN_DAYS,
        duration: SEVEN_DAYS,
      };
    default:
      return {
        type: 'standard',
        expiresAt: orderTime + THIRTY_DAYS,
        duration: THIRTY_DAYS,
      };
  }
};

// Mock orders for demo
export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    userId: 'usr_demo_001',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[5], quantity: 1 },
    ],
    total: 49890,
    status: 'delivered',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    shippingAddress: {
      street: '123 Market Street',
      city: 'Mumbai',
      state: 'MH',
      zipCode: '400001',
      country: 'India',
    },
    transaction: {
      id: 'txn_001',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-001',
      amount: 49890,
      currency: 'INR',
      status: 'completed',
      riskScore: 12,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      location: { latitude: 19.0760, longitude: 72.8777, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('electronics', Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-002',
    userId: 'usr_demo_001',
    items: [
      { product: products[1], quantity: 2 },
      { product: products[6], quantity: 1 },
    ],
    total: 1287,
    status: 'delivered',
    createdAt: Date.now() - 20 * 60 * 1000, // 20 minutes ago (Expired Window)
    shippingAddress: {
      street: 'Flat 402, Sunshine Apartments',
      city: 'Pune',
      state: 'MH',
      zipCode: '411057',
      country: 'India',
    },
    transaction: {
      id: 'txn_002',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-002',
      amount: 1287,
      currency: 'INR',
      status: 'completed',
      riskScore: 8,
      timestamp: Date.now() - 20 * 60 * 1000,
      location: { latitude: 18.5204, longitude: 73.8567, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('standard', Date.now() - 20 * 60 * 1000),
  },
  {
    id: 'ORD-2024-003',
    userId: 'usr_demo_001',
    items: [
      { product: products[2], quantity: 1 },
    ],
    total: 169900,
    status: 'shipped',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    shippingAddress: {
      street: 'Tech Park, Sector 5',
      city: 'Bangalore',
      state: 'KA',
      zipCode: '560001',
      country: 'India',
    },
    transaction: {
      id: 'txn_003',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-003',
      amount: 169900,
      currency: 'INR',
      status: 'completed',
      riskScore: 25,
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      location: { latitude: 12.9716, longitude: 77.5946, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('electronics', Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-004',
    userId: 'usr_demo_001',
    items: [
      { product: products[3], quantity: 1 },
      { product: products[11], quantity: 2 },
    ],
    total: 9997,
    status: 'processing',
    createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    shippingAddress: {
      street: 'Connaught Place',
      city: 'New Delhi',
      state: 'DL',
      zipCode: '110001',
      country: 'India',
    },
    transaction: {
      id: 'txn_004',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-004',
      amount: 9997,
      currency: 'INR',
      status: 'completed',
      riskScore: 15,
      timestamp: Date.now() - 30 * 60 * 1000,
      location: { latitude: 28.6139, longitude: 77.2090, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('fashion', Date.now() - 30 * 60 * 1000),
  },
  // New Orders
  {
    id: 'ORD-2024-005',
    userId: 'usr_demo_001',
    items: [
      { product: products[12], quantity: 1 }, // Boat Rockerz
    ],
    total: 1499,
    status: 'confirmed',
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    shippingAddress: {
      street: 'MG Road',
      city: 'Bangalore',
      state: 'KA',
      zipCode: '560001',
      country: 'India',
    },
    transaction: {
      id: 'txn_005',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-005',
      amount: 1499,
      currency: 'INR',
      status: 'completed',
      riskScore: 5,
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      location: { latitude: 12.9716, longitude: 77.5946, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('electronics', Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-006',
    userId: 'usr_demo_001',
    items: [
      { product: products[13], quantity: 1 }, // Mi Band
      { product: products[14], quantity: 1 }, // Logitech Mouse
    ],
    total: 3294,
    status: 'processing',
    createdAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
    shippingAddress: {
      street: 'Park Street',
      city: 'Kolkata',
      state: 'WB',
      zipCode: '700016',
      country: 'India',
    },
    transaction: {
      id: 'txn_006',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-006',
      amount: 3294,
      currency: 'INR',
      status: 'completed',
      riskScore: 9,
      timestamp: Date.now() - 10 * 60 * 1000,
      location: { latitude: 22.5726, longitude: 88.3639, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('electronics', Date.now() - 10 * 60 * 1000),
  },
];
