import { Router, Request, Response } from 'express';

const router = Router();

// Ruta GET de prueba
router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Ruta de prueba funcionando ' });
});

export default router;
