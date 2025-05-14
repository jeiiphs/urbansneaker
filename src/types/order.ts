export interface OrderItem {
  id: string;
  orderId: string;
  sneakerId: number;
  quantity: number;
  size: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}