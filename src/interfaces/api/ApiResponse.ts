
export interface ApiResponse<T> {
    timestamp: string,
    code: number,
    message: string,
    data: T
}