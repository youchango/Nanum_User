import api from './config';

export const categoryService = {
    getCategoryTree: async () => {
        try {
            const response = await api.get('/categories');
            const result = response.data;

            if (result && result.data) {
                const rawData = result.data; // 이미 트리 구조(root 항목들의 배열)

                // 2. 트리를 프론트엔드 포맷에 맞게 재귀적으로 매핑
                const mapCategory = (cat) => ({
                    id: cat.categoryId,
                    name: cat.categoryName,
                    imageUrl: cat.imageUrl,
                    subs: cat.children ? cat.children.map(mapCategory) : []
                });

                const categoryTree = rawData.map(mapCategory);

                return categoryTree;
            }
            return [];
        } catch (error) {
            console.error("❌ [API] 카테고리 로딩 실패:", error.response?.status, error.message);
            throw error;
        }
    }
};