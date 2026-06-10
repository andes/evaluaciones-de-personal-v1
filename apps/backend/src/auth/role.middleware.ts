import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../Utilidades/apiResponse';

// Extendemos Request para acceder al usuario autenticado
interface AuthRequest extends Request {
    user?: any;
}

export const authorizeRoles = (...roles: string[]) => {
    return (req: any, res: any, next: any) => {


        if (!roles.includes(req.user?.rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: 'Acceso denegado'
            });
        }

        next();
    };
};