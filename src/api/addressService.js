import api from './config';

const addressService = {
    getAddresses: () => api.get('/address-book'),
    createAddress: (data) => api.post('/address-book', data),
    updateAddress: (id, data) => api.put(`/address-book/${id}`, data),
    deleteAddress: (id) => api.delete(`/address-book/${id}`),
    setDefault: (id) => api.put(`/address-book/${id}/default`),
};

export default addressService;
