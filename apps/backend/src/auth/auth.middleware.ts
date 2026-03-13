import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../Utilidades/apiResponse';

export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return errorResponse(res, 'Acceso denegado. No hay token.', 401);
    }

    // Formato esperado: Bearer TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
        return errorResponse(res, 'Token mal formado', 401);
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        req.user = decoded;

        next();

    } catch (error) {

        return errorResponse(
            res,
            'Token inválido o expirado',
            401
        );

    }
};