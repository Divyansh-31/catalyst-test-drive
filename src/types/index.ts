// FraudX Schema Types
export interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number;
  ip?: string;
  city?: string;
  country?: string;
}

export interface RiskMetadata {
  deviceFingerprint: string;
  sessionId: string;
  geoLocation: GeoLocation;
  userAgent: string;
  screenResolution: string;
  timezone: string;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  riskScore: number;
  timestamp: number;
  location: GeoLocation;
  metadata: RiskMetadata;
  items: CartItem[];
  refundWindow?: RefundWindow;
}

export interface RefundWindow {
  type: 'blinkit' | 'amazon' | 'standard';
  expiresAt: number;
  duration: number; // in milliseconds
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  verified: boolean;
  createdAt: number;
  riskProfile: 'low' | 'medium' | 'high';
  metadata: RiskMetadata;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: ProductCategory;
  stock: number;
  rating: number;
  reviews: number;
  badge?: 'new' | 'sale' | 'bestseller';
}

export type ProductCategory = 'electronics' | 'fresh' | 'fashion' | 'home' | 'beauty';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  shippingAddress: Address;
  transaction: Transaction;
  refundWindow: RefundWindow;
}

export type OrderStatus = 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refund_requested' | 'refunded';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OTPState {
  sent: boolean;
  expiresAt: number;
  attemptsRemaining: number;
}
