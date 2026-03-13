import * as express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { User } from '../users/user.schema';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';

dotenv.config();

const router = express.Router();
const isDev = process.env.NODE_ENV === 'development';


//LOGIN

router.post('/login', async (req: Request, res: Response) => {
    const { dni, password } = req.body;

    try {

        const user = await User.findOne({ dni });

        if (!user) {
            return errorResponse(res, 'Usuario no encontrado', 401);
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return errorResponse(res, 'Contraseña incorrecta', 401);
        }

        const payload = {
            id: user._id,
            dni: user.dni,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        };

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            console.error('Faltó definir JWT_SECRET en el archivo .env');
            return errorResponse(res, 'Error interno: JWT_SECRET no configurado', 500);
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return successResponse(
            res,
            { token, user: payload },
            'Login exitoso'
        );

    } catch (error) {

        console.error('Error en /login:', error);

        return errorResponse(
            res,
            'Error en el servidor',
            500,
            isDev ? error : undefined
        );
    }
});



// REGISTRO DE NUEVO USUARIO

router.post('/register', verifyToken, async (req: Request, res: Response) => {

    try {

        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });

        const { dni, password, nombre, email, rol } = req.body;

        if (!dni || !password || !nombre || !email || !rol) {
            return errorResponse(res, 'Todos los campos son obligatorios', 400);
        }

        const existingUser = await User.findOne({
            $or: [{ dni }, { email }]
        });

        if (existingUser) {
            return errorResponse(
                res,
                'El usuario ya existe (DNI o Email duplicado)',
                400
            );
        }

        const newUser = new User({ dni, password, nombre, email, rol });

        await newUser.save();

        return successResponse(
            res,
            {
                id: newUser._id,
                dni: newUser.dni,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
            },
            'Usuario creado correctamente',
            201
        );

    } catch (error) {

        console.error('Error en /register:', error);

        return errorResponse(
            res,
            'Error en el servidor',
            500,
            isDev ? error : undefined
        );
    }
});



//LISTAR USUARIOS

router.get('/users', verifyToken, async (_req: Request, res: Response) => {

    try {

        const users = await User.find({}, '-password').lean();

        return successResponse(res, users, 'Usuarios obtenidos correctamente');

    } catch (error) {

        console.error('Error en /users:', error);

        return errorResponse(
            res,
            'Error en el servidor',
            500,
            isDev ? error : undefined
        );
    }
});



// ACTUALIZAR USUARIO

router.put('/users/:id', verifyToken, async (req: Request, res: Response) => {

    try {

        const { id } = req.params;
        const updateData = { ...req.body };

        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!updatedUser) {
            return errorResponse(res, 'Usuario no encontrado', 404);
        }

        return successResponse(
            res,
            updatedUser,
            'Usuario actualizado correctamente'
        );

    } catch (error) {

        console.error('Error en PUT /users/:id:', error);

        return errorResponse(
            res,
            'Error en el servidor',
            500,
            isDev ? error : undefined
        );
    }
});



//ELIMINAR USUARIO

router.delete('/users/:id', verifyToken, async (req: Request, res: Response) => {

    try {

        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return errorResponse(res, 'Usuario no encontrado', 404);
        }

        return successResponse(
            res,
            deletedUser,
            'Usuario eliminado correctamente'
        );

    } catch (error) {

        console.error('Error en DELETE /users/:id:', error);

        return errorResponse(
            res,
            'Error en el servidor',
            500,
            isDev ? error : undefined
        );
    }
});

export default router;