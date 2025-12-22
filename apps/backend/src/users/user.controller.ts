import express, { Request, Response } from 'express';
import { User } from './user.schema';

const router = express.Router();

/**
 * 📋 Obtener todos los usuarios (con filtros opcionales)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { apellido, nombre, documento, email, active } = req.query;
    const query: any = {};

    if (apellido) query.apellido = new RegExp(apellido as string, 'i');
    if (nombre) query.nombre = new RegExp(nombre as string, 'i');
    if (documento) query.documento = new RegExp(documento as string, 'i');
    if (email) query.email = new RegExp(email as string, 'i');
    if (active !== undefined) query.active = active === 'true';

    const users = await User.find(query, '-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

/**
 * ➕ Crear un nuevo usuario
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: 'Error al crear usuario', error: error.message });
  }
});

/**
 * ✏️ Actualizar usuario
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: 'Error al actualizar usuario', error: error.message });
  }
});

/**
 * ❌ Eliminar usuario
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    res.status(400).json({ message: 'Error al eliminar usuario', error: error.message });
  }
});

export const UsersRouter = router;
