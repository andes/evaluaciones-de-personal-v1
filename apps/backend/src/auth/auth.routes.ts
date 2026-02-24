import * as express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { User } from '../users/user.schema';
import jwt from 'jsonwebtoken';


dotenv.config();

const router = express.Router();

/**
 * 🔐 LOGIN
 */
router.post('/login', async (req: Request, res: Response) => {
    const { dni, password } = req.body;



    try {
        const user = await User.findOne({ dni });
        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

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
            return res.status(500).json({ message: 'Error interno: JWT_SECRET no configurado' });
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });


        res.json({ message: 'Login exitoso', token, user: payload });

    } catch (error: any) {
        console.error('Error en /login:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * 🧾 REGISTRO DE NUEVO USUARIO
 */
router.post('/register', async (req: Request, res: Response) => {
    try {

        // 🔹 Limpia los campos vacíos ("")
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });

        const { dni, password, nombre, email, rol } = req.body;

        // 🔹 Validaciones básicas
        if (!dni || !password || !nombre || !email || !rol) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // 🔹 Verifica duplicados
        const existingUser = await User.findOne({ $or: [{ dni }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe (DNI o Email duplicado)' });
        }

        // 🔹 Crea el nuevo usuario
        const newUser = new User({ dni, password, nombre, email, rol });
        await newUser.save();

        res.status(201).json({
            message: ' Usuario creado correctamente',
            user: {
                id: newUser._id,
                dni: newUser.dni,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
            }
        });

    } catch (error: any) {
        console.error(' Error en /register:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * 📋 LISTAR TODOS LOS USUARIOS
 */
router.get('/users', async (_req: Request, res: Response) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error: any) {
        console.error('Error en /users:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * ✏️ ACTUALIZAR USUARIO
 */
router.put('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Si no envía password, no la actualiza
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente', user: updatedUser });
    } catch (error: any) {
        console.error('Error en PUT /users/:id:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * 🗑️ ELIMINAR USUARIO
 */
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado', user: deletedUser });
    } catch (error: any) {
        console.error('Error en DELETE /users/:id:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

export default router;
