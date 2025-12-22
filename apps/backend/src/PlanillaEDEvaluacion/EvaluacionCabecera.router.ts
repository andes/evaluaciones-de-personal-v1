import { Router, Request, Response } from 'express';
import { PlanillaEvaluacionCabeceraModel } from '../PlanillaEDEvaluacion/EvaluacionCabecera.schema';
import * as mongoose from 'mongoose';

import { ServicioModel } from '../comunes/Servicios/Schemas/servicios';
import { EfectorModel } from '../comunes/Efectores/schemas/efectores';
import { TipoCierreEvaluacionModel } from '../comunes/tipoCierreEvaluacion/TipoCierreEvaluacion.schema';

const router = Router();

/* ============================================================
   1) RUTA: CREAR CABECERA
   ============================================================ */
router.post('/planillaedcabecera', async (req: Request, res: Response) => {
    try {
        const {
            periodo,
            agenteevaluador,
            Efector,
            Servicio,
            usuario
        } = req.body;

        // Validación de campos obligatorios
        if (!periodo || !agenteevaluador || !Efector || !Servicio || !usuario) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Obtener nombres de efector y servicio desde DB (para mostrar)
        const efectorDB = await EfectorModel.findById(Efector.idEfector).lean();
        const servicioDB = await ServicioModel.findById(Servicio.idServicio).lean();

        const nuevaCabecera = new PlanillaEvaluacionCabeceraModel({
            periodo: new Date(periodo),

            agenteevaluador: {
                idUsuarioEvaluador: agenteevaluador.idUsuarioEvaluador,
                nombreUsuarioEvaluador: agenteevaluador.nombreUsuarioEvaluador
            },

            Efector: {
                idEfector: Efector.idEfector,
                nombre: efectorDB?.nombre ?? 'Desconocido'
            },

            Servicio: {
                idServicio: Servicio.idServicio,
                nombre: servicioDB?.descripcion ?? 'Desconocido'
            },

            fechaCierre: new Date('1900-01-01'),
            usuario,
            fechaMod: new Date(),

            tipoCierreEvaluacion: {
                id: new mongoose.Types.ObjectId("688240f09cca123543c84b04"),
                nombre: "Evaluación Abierta"
            }
        });

        const cabeceraGuardada = await nuevaCabecera.save();

        res.status(201).json({
            success: true,
            data: cabeceraGuardada,
            message: 'Cabecera de evaluación creada exitosamente'
        });

    } catch (error) {
        console.error('Error al crear cabecera:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear cabecera',
            error: error instanceof Error ? error.message : error
        });
    }
});




/* ============================================================
   2) RUTA: VERIFICAR SI EXISTE CABECERA
   ============================================================ */
router.post('/planillaedcabecera/existe', async (req: Request, res: Response) => {
    try {
        const { periodo, agenteevaluador, Efector, Servicio } = req.body;

        if (!periodo || !agenteevaluador || !Efector || !Servicio) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        const existeCabecera = await PlanillaEvaluacionCabeceraModel.findOne({
            periodo: new Date(periodo),
            'agenteevaluador.idUsuarioEvaluador': new mongoose.Types.ObjectId(agenteevaluador.idUsuarioEvaluador),
            'Efector.idEfector': Efector.idEfector,
            'Servicio.idServicio': Servicio.idServicio
        });

        return res.status(200).json({
            success: true,
            existe: !!existeCabecera,
            data: existeCabecera || null
        });

    } catch (error) {
        console.error('Error al verificar cabecera:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al verificar',
            error
        });
    }
});

/* ============================================================
   3) RUTA: BUSCAR POR USUARIO EVALUADOR
   ============================================================ */
router.get('/planillaedcabecera/buscar', async (req: Request, res: Response) => {
    try {
        const { idUsuarioEvaluador } = req.query;

        if (!idUsuarioEvaluador) {
            return res.status(400).json({
                success: false,
                message: 'Falta idUsuarioEvaluador'
            });
        }

        const cabeceras = await PlanillaEvaluacionCabeceraModel.find({
            'agenteevaluador.idUsuarioEvaluador': new mongoose.Types.ObjectId(idUsuarioEvaluador as string)
        }).sort({ periodo: 1 });

        res.status(200).json({
            success: true,
            total: cabeceras.length,
            data: cabeceras
        });

    } catch (error) {
        console.error('Error buscar cabeceras:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar cabeceras',
            error
        });
    }
});

/* ============================================================
   4) GET CABECERA POR ID (IMPORTANTE: ANTES QUE '/')
   ============================================================ */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }

        const cabecera = await PlanillaEvaluacionCabeceraModel.findById(id);

        if (!cabecera) {
            return res.status(404).json({ success: false, message: 'Cabecera no encontrada' });
        }

        res.status(200).json({
            success: true,
            data: cabecera
        });

    } catch (error) {
        console.error('Error obtener cabecera:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error
        });
    }
});

/* ============================================================
   5) ELIMINAR CABECERA POR ID
   ============================================================ */
router.delete('/evaluacioncabecera/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cabeceraEliminada = await PlanillaEvaluacionCabeceraModel.findByIdAndDelete(id);

        if (!cabeceraEliminada) {
            return res.status(404).json({
                success: false,
                message: 'Cabecera no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cabecera eliminada'
        });

    } catch (error) {
        console.error('Error eliminar cabecera:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error
        });
    }
});

/* ============================================================
   6) ELIMINAR TODAS LAS CABECERAS
   ============================================================ */
router.delete('/evaluacioncabecera', async (req: Request, res: Response) => {
    try {
        const resultado = await PlanillaEvaluacionCabeceraModel.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'Todas las cabeceras eliminadas',
            deleted: resultado.deletedCount
        });

    } catch (error) {
        console.error('Error eliminar todas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error
        });
    }
});

/* ============================================================
   7) RUTA GENERAL (VA SIEMPRE AL FINAL)
   ============================================================ */
router.get('/', async (_req: Request, res: Response) => {
    try {
        const cabeceras = await PlanillaEvaluacionCabeceraModel.find();

        res.status(200).json({
            success: true,
            data: cabeceras
        });

    } catch (error) {
        console.error('Error obtener cabeceras:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error
        });
    }
});

export default router;