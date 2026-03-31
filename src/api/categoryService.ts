import api from './config';
import type { ApiResponse } from '../types/common';

export interface Category {
    id: number;
    name: string;
    imageUrl?: string;
    subs: Category[];
}

interface RawCategory {
    categoryId: number;
    categoryName: string;
    imageUrl?: string;
    children?: RawCategory[];
}

export const categoryService = {
    getCategoryTree: async (): Promise<Category[]> => {
        try {
            const response = await api.get<ApiResponse<RawCategory[]>>('/categories');
            const result = response.data;

            if (result && result.data) {
                const rawData = result.data;

                const mapCategory = (cat: RawCategory): Category => ({
                    id: cat.categoryId,
                    name: cat.categoryName,
                    imageUrl: cat.imageUrl,
                    subs: cat.children ? cat.children.map(mapCategory) : []
                });

                return rawData.map(mapCategory);
            }
            return [];
        } catch (error: any) {
            console.error("❌ [API] 카테고리 로딩 실패:", error.response?.status, error.message);
            throw error;
        }
    }
};