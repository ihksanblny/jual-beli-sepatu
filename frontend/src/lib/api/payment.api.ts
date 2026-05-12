import { api } from './client';

export const paymentApi = {
  createIntent: async (amount: number, currency: string = 'usd') => {
    const response = await api.post('/payment/intent', { amount, currency });
    return response.data;
  },
};
