export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}

export const successResponse = <T>(
    res: any,
    data: T,
    message = 'Operación exitosa',
    status = 200
) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (
    res: any,
    message = 'Error en la operación',
    status = 500,
    error: any = null
) => {
    return res.status(status).json({
        success: false,
        message,
        error
    });
};
