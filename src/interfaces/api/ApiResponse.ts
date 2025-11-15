import { ApiLinks } from "./ApiLinks";
import { ApiPagination } from "./ApiPagination"
import { ApiSimplePagination } from "./ApiSimplePagination";

export interface ApiResponse<T> {
    timestamp: string,
    code: number,
    message: string,
    data: T ;
    pagination: ApiPagination | ApiSimplePagination | null;
    links: ApiLinks | null;
}