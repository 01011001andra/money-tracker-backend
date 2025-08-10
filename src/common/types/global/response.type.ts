export interface BaseResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
