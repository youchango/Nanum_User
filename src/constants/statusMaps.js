export const ORDER_STATUS_MAP = {
    PAYMENT_WAIT: '결제 대기',
    PAID: '결제 완료',
    PREPARING: '상품 준비중',
    SHIPPING: '배송중',
    DELIVERED: '배송 완료',
    CANCELLED: '취소됨',
    REFUNDED: '환불됨',
};

export const TAX_BILL_STATUS_MAP = {
    REQUESTED: { label: '신청', color: 'bg-gray-100 text-gray-500' },
    ISSUED: { label: '발행완료', color: 'bg-green-50 text-green-600' },
    CANCELLED: { label: '취소', color: 'bg-red-50 text-red-400' },
    FAILED: { label: '실패', color: 'bg-red-50 text-red-400' },
};

export const PAYMENT_METHOD_MAP = {
    CARD: '신용카드',
    BANK_TRANSFER: '실시간계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE: '휴대폰결제',
    EASY_PAY: '간편결제',
};

export const CLAIM_TYPE_MAP = {
    EXCHANGE: '교환',
    RETURN: '반품',
    REFUND: '환불',
};

export const CLAIM_STATUS_MAP = {
    REQUESTED: { label: '신청', color: 'bg-gray-100 text-gray-500' },
    REVIEWING: { label: '검토중', color: 'bg-blue-50 text-blue-500' },
    APPROVED: { label: '승인', color: 'bg-green-50 text-green-600' },
    REJECTED: { label: '반려', color: 'bg-red-50 text-red-400' },
    COMPLETED: { label: '처리완료', color: 'bg-[#968064]/10 text-[#968064]' },
};

export const CLAIM_REASON_MAP = {
    ORDER_ERROR: '주문 착오',
    CHANGE_OF_MIND: '단순 변심',
    DEFECTIVE: '상품 불량',
    DAMAGED: '상품 파손',
    MISDELIVERY: '오배송',
    OTHER: '기타',
};

export const PAYMENT_METHOD_REVERSE_MAP = {
    '신용카드': 'CARD',
    '가상계좌': 'VIRTUAL_ACCOUNT',
    '무통장입금': 'BANK_TRANSFER',
    '카카오페이': 'EASY_PAY',
};
