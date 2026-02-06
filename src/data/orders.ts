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
    total: 597.00,
    status: 'delivered',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    shippingAddress: {
      street: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    transaction: {
      id: 'txn_001',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-001',
      amount: 597.00,
      currency: 'USD',
      status: 'completed',
      riskScore: 12,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      location: { latitude: 37.7749, longitude: -122.4194, accuracy: 10, timestamp: Date.now() },
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
    total: 25.97,
    status: 'delivered',
    createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    shippingAddress: {
      street: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    transaction: {
      id: 'txn_002',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-002',
      amount: 25.97,
      currency: 'USD',
      status: 'completed',
      riskScore: 8,
      timestamp: Date.now() - 5 * 60 * 1000,
      location: { latitude: 37.7749, longitude: -122.4194, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('fresh', Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'ORD-2024-003',
    userId: 'usr_demo_001',
    items: [
      { product: products[2], quantity: 1 },
    ],
    total: 1999.00,
    status: 'shipped',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    shippingAddress: {
      street: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    transaction: {
      id: 'txn_003',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-003',
      amount: 1999.00,
      currency: 'USD',
      status: 'completed',
      riskScore: 25,
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      location: { latitude: 37.7749, longitude: -122.4194, accuracy: 10, timestamp: Date.now() },
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
    total: 447.00,
    status: 'processing',
    createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    shippingAddress: {
      street: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    transaction: {
      id: 'txn_004',
      userId: 'usr_demo_001',
      orderId: 'ORD-2024-004',
      amount: 447.00,
      currency: 'USD',
      status: 'completed',
      riskScore: 15,
      timestamp: Date.now() - 30 * 60 * 1000,
      location: { latitude: 37.7749, longitude: -122.4194, accuracy: 10, timestamp: Date.now() },
      metadata: {} as any,
      items: [],
    },
    refundWindow: getRefundWindow('fashion', Date.now() - 30 * 60 * 1000),
  },
];
