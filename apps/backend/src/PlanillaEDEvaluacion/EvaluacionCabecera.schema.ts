import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// agente evaluador
interface IAgenteEvaluador {
    idUsuarioEvaluador: mongoose.Types.ObjectId;
    nombreUsuarioEvaluador: string;
}

// efector
interface IEfector {
    idEfector: mongoose.Types.ObjectId;
    nombre: string;
}

// servicio
interface IServicio {
    idServicio: mongoose.Types.ObjectId;
    nombre: string;
}

// tipo de cierre de evaluación
interface ITipoCierreEvaluacion {
    id: mongoose.Types.ObjectId;
    nombre: string;
    fecha: Date;
    detalle: string;
}

// interfaz principal
export interface IPlanillaEvaluacionCabecera extends mongoose.Document {
    periodo: Date;
    agenteevaluador: IAgenteEvaluador;
    Efector: IEfector;
    Servicio: IServicio;
    fechaCierre?: Date;
    tipoCierreEvaluacion?: ITipoCierreEvaluacion;
    usuario: string;
    fechaMod: Date;
}

// schema
const PlanillaEvaluacionCabeceraSchema = new Schema<IPlanillaEvaluacionCabecera>(
    {
        periodo: {
            type: Date,
            required: true
        },
        agenteevaluador: {
            idUsuarioEvaluador: {
                type: Schema.Types.ObjectId,
                ref: 'Usuario',
                required: true
            },
            nombreUsuarioEvaluador: {
                type: String,
                required: true
            }
        },
        Efector: {
            type: {
                idEfector: {
                    type: Schema.Types.ObjectId,
                    ref: 'Efector',
                    required: true
                },
                nombre: {
                    type: String,
                    required: true
                }
            },
            required: true
        },
        Servicio: {
            type: {
                idServicio: {
                    type: Schema.Types.ObjectId,
                    ref: 'Servicio',
                    required: true
                },
                nombre: {
                    type: String,
                    required: true
                }
            },
            required: true
        },
        fechaCierre: {
            type: Date
        },
        tipoCierreEvaluacion: {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'TipoCierreEvaluacion'
            },
            nombre: {
                type: String
            },
            fecha: {
                type: Date
            },
            detalle: {
                type: String,
                maxlength: 5000 // puedes ajustar según necesidad
            }
        },
        usuario: {
            type: String,
            required: true
        },
        fechaMod: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'planilla_evaluacion_cabecera',
        timestamps: false,
        versionKey: false
    }
);

// exportación del modelo
export const PlanillaEvaluacionCabeceraModel = mongoose.model<IPlanillaEvaluacionCabecera>(
    'PlanillaEvaluacionCabecera',
    PlanillaEvaluacionCabeceraSchema,
    'planilla_evaluacion_cabecera'
);

export { PlanillaEvaluacionCabeceraSchema };
