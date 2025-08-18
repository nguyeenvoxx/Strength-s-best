import { API_CONFIG } from './config';

export interface Card {
  _id: string;
  userId: string;
  cardNumber: string; // Full card number (encrypted)
  maskedCardNumber: string; // Masked number like "**** **** **** 1234"
  cardType: string; // visa, mastercard, amex
  expiryDate: string;
  cardHolder: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddCardRequest {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType?: string;
}

export interface UpdateCardRequest {
  cardHolder?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

const API_BASE_LEGACY = API_CONFIG.BASE_URL.replace('/api/v1', '/api');

export const getUserCards = async (token: string): Promise<Card[]> => {
  const res = await fetch(`${API_BASE_LEGACY}/cards`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách thẻ');
  const data = await res.json();
  // Backend trả { status, results, data: Card[] }
  return (data && Array.isArray(data.data)) ? (data.data as Card[]) : [];
}

export const addCard = async (token: string, cardData: AddCardRequest): Promise<any> => {
  const res = await fetch(`${API_BASE_LEGACY}/cards/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(cardData)
  });
  if (!res.ok) throw new Error('Không thể thêm thẻ');
  return res.json();
}

export const updateCard = async (token: string, cardId: string, updateData: UpdateCardRequest): Promise<Card> => {
  const res = await fetch(`${API_BASE_LEGACY}/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Không thể cập nhật thẻ');
  const data = await res.json();
  return data.data?.card as Card;
}

export const deleteCard = async (token: string, cardId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_LEGACY}/cards/${cardId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Không thể xóa thẻ');
}

export const setDefaultCard = async (token: string, cardId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_LEGACY}/cards/${cardId}/set-default`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Không thể đặt mặc định');
  await res.json();
}

export const createStripeCustomerSession = async (token: string): Promise<{ customerId: string; ephemeralKey: string; }> => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/customer-session`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Không thể tạo phiên Stripe');
  const data = await res.json();
  return { customerId: data.data.customerId, ephemeralKey: data.data.ephemeralKey };
}

// Đồng bộ thẻ từ Stripe về DB (fallback khi webhook chưa tới)
export const syncStripePaymentMethods = async (token: string): Promise<void> => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/sync-payment-methods`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Không thể đồng bộ thẻ Stripe');
}