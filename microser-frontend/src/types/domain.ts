export type UserRole = 'estudiante' | 'docente' | 'administrativo';

export type SessionUser = {
  userId: string;
  codigo: string;
  anioRegistro: number;
  rol: UserRole;
  mustChangePassword: boolean;
  message: string;
  token: string;
};

export type Usuario = {
  id: string;
  codigo: string;
  anioRegistro: number;
  rol: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
};

export type ProductSearchResult = {
  productId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
  seller: string;
};

export type SearchResponse = {
  query: string;
  category: string;
  total: number;
  results: ProductSearchResult[];
};

export type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
};

export type Order = {
  id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export type PaymentResult = {
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  status: 'approved' | 'rejected';
  timestamp: string;
  message: string;
};

export type Recommendation = {
  product: string;
  score: number;
};

export type RecommendationsResponse = {
  userId: string;
  recommendations: Recommendation[];
  createdAt: string;
  updatedAt: string;
  topRecommendations?: Recommendation[];
  averageScore?: number;
};

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
};
