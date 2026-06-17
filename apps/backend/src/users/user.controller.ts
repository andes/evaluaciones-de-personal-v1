import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

const router = express.Router();
const isDev = process.env.NODE_ENV === 'development';

/**
 * Obtener todos los usuarios (con filtros opcionales)
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {

    const { apellido, nombre, documento, email, active } = req.query;
    const query: any = {};

    if (apellido) query.apellido = new RegExp(apellido as string, 'i');
    if (nombre) query.nombre = new RegExp(nombre as string, 'i');
    if (documento) query.documento = new RegExp(documento as string, 'i');
    if (email) query.email = new RegExp(email as string, 'i');
    if (active !== undefined) query.active = active === 'true';

    const users = await User.find(query, '-password').lean();

    return successResponse(res, users, 'Usuarios obtenidos correctamente');

  } catch (error) {

    console.error(error);
    return errorResponse(res, 'Error al obtener usuarios', 500, isDev ? error : undefined);

  }
});


/**
 * Obtener usuario por ID
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'ID inválido', 400);
    }

    const user = await User.findById(id, '-password').lean();

    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    return successResponse(res, user, 'Usuario obtenido correctamente');

  } catch (error) {

    console.error(error);
    return errorResponse(res, 'Error al buscar usuario', 500, isDev ? error : undefined);

  }
});


/**
 * Crear nuevo usuario
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {

    const newUser = new User(req.body);
    await newUser.save();

    return successResponse(res, newUser, 'Usuario creado correctamente', 201);

  } catch (error: any) {

    console.error(error);
    return errorResponse(res, 'Error al crear usuario', 400, isDev ? error : undefined);

  }
});


/**
 * Actualizar usuario
 */
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'ID inválido', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    return successResponse(res, updatedUser, 'Usuario actualizado correctamente');

  } catch (error) {

    console.error(error);
    return errorResponse(res, 'Error al actualizar usuario', 400, isDev ? error : undefined);

  }
});

//put servicios agrega servcios al usuario
router.put('/:id/servicios', async (req: Request, res: Response) => {
  console.log('BODY:', JSON.stringify(req.body, null, 2));
  console.log('SERVICIOS:', JSON.stringify(req.body.servicios, null, 2));
  try {

    const { id } = req.params;

    console.log('BODY:', req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Body undefined'
      });
    }

    console.log('SERVICIOS:', req.body.servicios);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'ID inválido', 400);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    user.set({
      servicios: req.body.servicios || []
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Servicios actualizados correctamente',
      user
    });

  } catch (error: any) {


    console.log(error);
    console.log('MESSAGE:', error?.message);
    console.log('STACK:', error?.stack);
    console.log('========================================');

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar servicios',
      error: error?.message || error
    });
  }

});



/**
 * Eliminar usuario
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'ID inválido', 400);
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    return successResponse(res, null, 'Usuario eliminado correctamente');

  } catch (error) {

    console.error(error);
    return errorResponse(res, 'Error al eliminar usuario', 400, isDev ? error : undefined);

  }
});

export const UsersRouter = router;