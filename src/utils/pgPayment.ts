interface PaymentRequest {
    orderNo: string;
    amount: number;
    orderName: string;
    paymentMethod: string;
}

interface PaymentResult {
    paymentKey: string;
    success: boolean;
}

export const requestPgPayment = async ({ orderNo, amount, orderName, paymentMethod }: PaymentRequest): Promise<PaymentResult> => {
    // Mock: 실제로는 PG 팝업이 열리고 사용자가 결제
    // 여기서는 바로 성공 반환
    return {
        paymentKey: `mock_${orderNo}_${Date.now()}`,
        success: true,
    };
};
