import { api } from './client';

export const userApi = {
  getAddresses: async () => {
    const response = await api.get('/user/addresses');
    return response.data;
  },
  addAddress: async (addressData: any) => {
    const response = await api.post('/user/address', addressData);
    return response.data;
  },
  updateAddress: async (id: string, addressData: any) => {
    const response = await api.put(`/user/address/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id: string) => {
    const response = await api.delete(`/user/address/${id}`);
    return response.data;
  },
};
