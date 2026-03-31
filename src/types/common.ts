/**
 * 전역 공통 타입 정의
 */

export interface ApiResponse<T> {
  status: string;    // 정규화된 상태 코드 ("200", etc)
  success: boolean;   // SUCCESS 상태시 true로 정규화됨
  data: T;
  message: string | null;
}

export interface ErrorResponse {
  status: string;
  success: false;
  message: string;
  data: null;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SearchDTO {
  page?: number;
  size?: number;
  recordSize?: number;
  keyword?: string;
  type?: string;
  siteCd?: string;
  categoryId?: number | null;
  sort?: string;
}
