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

    const response: ApiResponse = {
        success: false,
        message
    };

    // Solo mostrar detalles técnicos en desarrollo
    if (process.env.NODE_ENV !== 'production' && error) {
        response.error = error;
    }

    return res.status(status).json(response);
};