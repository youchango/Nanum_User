import api from './config';
import type { ApiResponse } from '../types/common';

import type { Address, AddressForm } from '../types/address';

const addressService = {
    getAddresses: (): Promise<ApiResponse<Address[]>> => 
        api.get<ApiResponse<Address[]>>('/address-book').then(res => res.data),
    
    createAddress: (data: AddressForm): Promise<ApiResponse<Address>> => 
        api.post<ApiResponse<Address>>('/address-book', data).then(res => res.data),
    
    updateAddress: (id: number | string, data: AddressForm): Promise<ApiResponse<Address>> => 
        api.put<ApiResponse<Address>>(`/address-book/${id}`, data).then(res => res.data),
    
    deleteAddress: (id: number | string): Promise<ApiResponse<void>> => 
        api.delete<ApiResponse<void>>(`/address-book/${id}`).then(res => res.data),
    
    setDefault: (id: number | string): Promise<ApiResponse<void>> => 
        api.put<ApiResponse<void>>(`/address-book/${id}/default`).then(res => res.data),
};

export default addressService;
