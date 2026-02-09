import api from './config';

export const categoryService = {
    getCategoryTree: async () => {
        try {
            console.log("📂 [API] 카테고리 데이터 요청 시작...");
            const response = await api.get('/categories');
            const result = response.data;

            // 1. 서버 응답 원본 확인
            console.log("📥 [API] 서버 응답 원본:", result);

            if (result && result.data) {
                const rawData = result.data;

                const categoryTree = rawData
                    .filter(cat => cat.depth === 1)
                    .map(main => ({
                        id: main.categoryId,
                        name: main.categoryName,
                        subs: rawData
                            .filter(sub => sub.depth === 2 && sub.parentId === main.categoryId)
                            .map(sub => ({
                                id: sub.categoryId,
                                name: sub.categoryName
                            }))
                    }));

                // 2. 가공된 트리 구조 확인
                console.log("🌳 [API] 가공된 카테고리 트리:", categoryTree);
                return categoryTree;
            }
            return [];
        } catch (error) {
            console.error("❌ [API] 카테고리 로딩 실패:", error.response?.status, error.message);
            throw error;
        }
    }
};