import { Router } from 'express';
import { RolModel } from './roles.schemas';
import { verifyToken } from '../auth/auth.middleware';
import { authorizeRoles } from '../auth/role.middleware';

import {
    successResponse,
    errorResponse
} from '../Utilidades/apiResponse';

const router = Router();

router.get(
    '/rmRoles',
    verifyToken,
    authorizeRoles('administrador'),
    async (req, res) => {

        try {

            const data = await RolModel
                .find()
                .sort({ nombre: 1 });

            return successResponse(
                res,
                data,
                'Roles obtenidos correctamente'
            );

        } catch (error) {

            return errorResponse(
                res,
                'Error al obtener roles',
                500,
                error
            );
        }
    }
);


router.get(
    '/rmRoles/:id',
    verifyToken,
    authorizeRoles('administrador'),
    async (req, res) => {

        try {

            const respuesta = await RolModel.findById(req.params.id);

            if (!respuesta) {

                return errorResponse(
                    res,
                    'Rol no encontrado',
                    404
                );
            }

            return successResponse(
                res,
                respuesta,
                'Rol obtenido correctamente'
            );

        } catch (error) {

            return errorResponse(
                res,
                'Error al buscar rol',
                500,
                error
            );
        }
    }
);


router.post(
    '/seedRoles',
    verifyToken,
    authorizeRoles('administrador'),
    async (req, res) => {

        try {

            const rolesBase = [

                {
                    nombre: 'administrador',
                    descripcion: 'Administrador del sistema',
                    activo: true
                },

                {
                    nombre: 'director',
                    descripcion: 'Director del área',
                    activo: true
                },

                {
                    nombre: 'evaluador',
                    descripcion: 'Evaluador del sistema',
                    activo: true
                },

                {
                    nombre: 'usuario',
                    descripcion: 'Usuario evaluado',
                    activo: true
                }
            ];



            const resultados = [];

            for (const rol of rolesBase) {

                const existe = await RolModel.findOne({
                    nombre: rol.nombre
                });

                if (!existe) {

                    const nuevoRol = new RolModel(rol);

                    await nuevoRol.save();

                    resultados.push({
                        rol: rol.nombre,
                        estado: 'creado'
                    });

                } else {

                    resultados.push({
                        rol: rol.nombre,
                        estado: 'ya existe'
                    });
                }
            }

            return successResponse(
                res,
                resultados,
                'Roles inicializados correctamente'
            );

        } catch (error) {

            return errorResponse(
                res,
                'Error al crear roles',
                500,
                error
            );
        }
    }
);


router.put(
    '/rmRoles/:id',
    verifyToken,
    authorizeRoles('administrador'),
    async (req, res) => {

        try {

            const respuesta = await RolModel.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!respuesta) {

                return errorResponse(
                    res,
                    'Rol no encontrado',
                    404
                );
            }

            return successResponse(
                res,
                respuesta,
                'Rol actualizado correctamente'
            );

        } catch (error) {

            return errorResponse(
                res,
                'Error al actualizar rol',
                400,
                error
            );
        }
    }
);




export default router;