export interface OrderItem {
    id: number;
    productId: string;
    productName: string;
    optionId?: number;
    optionName?: string;
    quantity: number;
    price?: number;
    pricePerUnit?: number;
    totalPrice: number;
    imageUrl?: string;
    img?: string;
    reviewYn?: boolean;
}

export interface Order {
    id: number;
    orderId?: number;
    orderNo: string;
    orderName?: string;
    memberCode: string;
    orderDate?: string;
    createdAt?: string;
    status: string;
    orderStatus?: string;
    totalAmount?: number;
    totalPrice?: number;
    shippingFee?: number;
    deliveryPrice?: number;
    paymentPrice?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    receiverName: string;
    receiverPhone: string;
    receiverZipcode: string;
    receiverAddress: string;
    receiverAddressDetail?: string;
    receiverDetail?: string;
    deliveryMsg?: string;
    deliveryMemo?: string;
    trackingNumber?: string;
    items: OrderItem[];
}

export interface OrderRequest {
    items: {
        productId: string;
        optionId?: number;
        quantity: number;
    }[];
    receiverName: string;
    receiverPhone: string;
    receiverZipcode: string;
    receiverAddress: string;
    receiverAddressDetail: string;
    deliveryMsg?: string;
    paymentMethod: string;
}

export interface OrderPrepareResult {
    orderNo: string;
    totalAmount: number;
    orderName: string;
    deliveryPrice: number;
    paymentPrice: number;
}
