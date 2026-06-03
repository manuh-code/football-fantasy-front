import { ApiLinks } from "./ApiLinks";
import { ApiPagination } from "./ApiPagination"
import { ApiSimplePagination } from "./ApiSimplePagination";

export interface ApiResponse<T, M = unknown> {
    timestamp: string,
    code: number,
    message: string,
    data: T ;
    meta: M | null;
    pagination: ApiPagination | ApiSimplePagination | null;
    links: ApiLinks | null;
}