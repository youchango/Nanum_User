/**
 * Mock PG SDK — 실제 PG 연동 시 이 파일만 교체
 * 토스페이먼츠/포트원 등의 SDK로 대체
 */
export const requestPgPayment = async ({ orderNo, amount, orderName, paymentMethod }) => {
    // Mock: 실제로는 PG 팝업이 열리고 사용자가 결제
    // 여기서는 바로 성공 반환
    return {
        paymentKey: `mock_${orderNo}_${Date.now()}`,
        success: true,
    };
};
