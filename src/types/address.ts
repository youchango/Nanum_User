export interface Address {
    id: number;
    addressName: string | null;
    receiverName: string;
    receiverPhone: string;
    zipcode: string;
    address: string;
    addressDetail: string | null;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddressForm {
    addressName: string | null;
    receiverName: string;
    receiverPhone: string;
    zipcode: string;
    address: string;
    addressDetail: string;
    isDefault: boolean;
}
