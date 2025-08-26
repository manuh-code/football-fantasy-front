import { ApiLinks } from "./ApiLinks";
import { ApiPagination } from "./ApiPagination"

export interface ApiResponse<T> {
    timestamp: string,
    code: number,
    message: string,
    data: T ;
    pagination: ApiPagination | null;
    links: ApiLinks | null;
}