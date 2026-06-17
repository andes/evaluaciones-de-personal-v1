// tareas realizadas 
// Se tipó el payload del JWT para adjuntar al request
// los datos del usuario autenticado (id, dni, nombre, email y rol)
// evitando el uso de "any" y mejorando la validación en TypeScript.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../Utilidades/apiResponse';

interface JwtPayload {
    id: string;
    dni: string;
    nombre: string;
    email: string;
    rol: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const verifyToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return errorResponse(res, 'Acceso denegado. No hay token.', 401);
    }

    // Bearer TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
        return errorResponse(res, 'Token mal formado', 401);
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        console.log('TOKEN DECODIFICADO:', decoded);

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