import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { PlanillaEDService } from '../services/PlanillaED.Service';
import { PlanillaEDCabeceraService } from '../services/PlanillaEDCabecera.service';
import { AgentesService } from '../services/agentes.service';
import { PlanillaEDDetalleService } from '../services/PlanillaEDDetalle.service';
import { TipoEvaluacionService, TipoEvaluacion } from '../services/tipoevaluacion.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import { EfectoresService } from '../services/efectores.service';
import { RouterModule, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { HeaderSistemaComponent } from '../header/header-sistema.component';

const Swal = require('sweetalert2').default;

@Component({
    selector: 'app-evaluacion-cabecera',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        RouterModule,
        HeaderSistemaComponent
    ],
    providers: [EfectoresService],
    templateUrl: './evaluacionCabecera.component.html',
    styleUrls: ['./evaluacionCabecera.component.css']
})
export class EvaluacionCabeceraComponent implements OnInit {

    tiposEvaluacion: TipoEvaluacion[] = [];
    cabecerasEncontradas: any[] = [];

    evaluacionCabecera: any = {};
    categoriasDesdePlanilla: any[] = [];

    agentesFiltrados: any[] = [];
    efectores: any[] = [];
    servicios: any[] = [];

    filtroAgente: string = '';
    tipoBusqueda: string = 'nombre';

    idTipoEvaluacion: string = '';
    idEfector: string = '';
    idServicio: string = '';
    idGuardado: string | null = null;

    nombreAgenteEvaluador: string = '';

    mostrarModal: boolean = false;

    isLoading: boolean = false;
    isLoadingAgentes: boolean = false;
    isEvaluandoAgente: boolean = false;

    constructor(
        private authService: AuthService,
        private planillaService: PlanillaEDService,
        private planillaEDCabeceraService: PlanillaEDCabeceraService,
        private agentesService: AgentesService,
        private evaluacionDetalleService: PlanillaEDDetalleService,
        private tipoEvaluacionService: TipoEvaluacionService,
        private efectoresService: EfectoresService,
        private serviciosService: ServiciosService,
        private router: Router
    ) { }

    ngOnInit(): void {

        this.nombreAgenteEvaluador = this.authService.getNombre();

        this.evaluacionCabecera = {
            periodo: '',
            agenteevaluador: {
                idUsuarioEvaluador: this.authService.getId(),
                nombreUsuarioEvaluador: this.nombreAgenteEvaluador
            },
            usuario: this.authService.getNombre(),
            fechaMod: new Date().toISOString()
        };

        this.cargarTiposEvaluacion();
        this.cargarEfectores();
        this.cargarServicios();
        this.obtenerAgentesDisponibles();
        this.buscarCabeceras();
    }

    get textoBusqueda(): string {
        return this.tipoBusqueda === 'nombre'
            ? 'Buscar por Nombre'
            : 'Buscar por Legajo';
    }

    volver() {
        window.history.back();
    }

    cargarTiposEvaluacion() {
        this.tipoEvaluacionService.obtenerTipos().subscribe({
            next: (res: any) => {
                this.tiposEvaluacion = Array.isArray(res.data) ? res.data : [];
            },
            error: (err) => {
                console.error('Error al cargar tipos:', err);
                this.tiposEvaluacion = [];
            }
        });
    }

    buscarAgentesBackend(valor: string) {

        //  console.log("VALOR :", valor);

        this.isLoadingAgentes = true;

        this.agentesService.obtenerAgentes(valor, this.tipoBusqueda)
            .subscribe({
                next: (resp: any) => {
                    this.agentesFiltrados = resp.data || resp;
                    this.isLoadingAgentes = false;
                },
                error: () => {
                    this.agentesFiltrados = [];
                    this.isLoadingAgentes = false;
                }
            });
    }

    obtenerAgentesDisponibles() {

        this.isLoadingAgentes = true;

        this.agentesService.obtenerAgentes('', this.tipoBusqueda)
            .subscribe({
                next: (resp: any) => {
                    this.agentesFiltrados = resp.data || [];
                    this.isLoadingAgentes = false;
                },
                error: () => {
                    this.agentesFiltrados = [];
                    this.isLoadingAgentes = false;
                }
            });
    }

    cargarEfectores() {

        this.efectoresService.getEfectores().subscribe({
            next: (res) => {
                this.efectores = res.data || [];
            },
            error: (err) => {
                console.error('Error al cargar efectores', err);
                this.efectores = [];
            }
        });
    }

    cargarServicios() {

        this.serviciosService.getServicios().subscribe({
            next: (res) => {
                this.servicios = res.data || [];
            },
            error: (err) => {
                console.error('Error al cargar servicios', err);
                this.servicios = [];
            }
        });
    }

    guardarCabecera() {

        if (!this.idEfector) {
            Swal.fire('Atención', 'Debes seleccionar un efector', 'warning');
            return;
        }

        if (!this.idServicio) {
            Swal.fire('Atención', 'Debes seleccionar un servicio', 'warning');
            return;
        }

        const efector = this.efectores.find(e => e._id === this.idEfector);
        const servicio = this.servicios.find(s => s._id === this.idServicio);

        const payload = {
            ...this.evaluacionCabecera,
            Efector: {
                idEfector: this.idEfector,
                nombre: efector?.nombre
            },
            Servicio: {
                idServicio: this.idServicio,
                nombre: servicio?.nombre
            }
        };

        this.planillaEDCabeceraService.crearCabeceraEvaluacion(payload)
            .subscribe({
                next: (resp: any) => {

                    this.idGuardado = resp.data?._id;

                    this.buscarCabeceras();
                    this.mostrarModal = true;

                    Swal.fire('OK', 'Cabecera guardada', 'success');
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo guardar', 'error');
                }
            });
    }

    cargarPlanillaPorTipoEvaluacion() {

        if (!this.idTipoEvaluacion) return;

        this.planillaService.getPlanillaPorTipoEvaluacion(this.idTipoEvaluacion)
            .subscribe({
                next: (res: any) => {

                    const planilla = res.data;

                    if (!planilla) {
                        Swal.fire('Error', 'No existe planilla para ese tipo', 'error');
                        return;
                    }

                    this.categoriasDesdePlanilla = planilla.categorias || [];
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo cargar la planilla', 'error');
                }
            });
    }
    buscarCabeceras() {

        const idUsuario = this.authService.getId();
        if (!idUsuario) return;

        this.planillaEDCabeceraService.buscarCabecerasPorEvaluador(idUsuario)
            .subscribe({
                next: (data: any) => {

                    console.log("RESPUESTA COMPLETA:", data);
                    console.log("ARRAY CABECERAS:", data.data);

                    this.cabecerasEncontradas = data.data || [];
                },
                error: () => {
                    this.cabecerasEncontradas = [];
                }
            });
    }

    evaluarAgente(agente: any): void {
        this.isEvaluandoAgente = true; // Inicia la animación

        const categoriasTransformadas = this.categoriasDesdePlanilla.map(cat => ({
            idCategoria: cat.categoria._id,
            descripcionCategoria: cat.categoria.descripcion,
            items: cat.items.map(item => ({
                idItem: item._id,
                descripcion: item.descripcion,
                puntaje: 0
            }))
        }));

        const detalleEvaluacion = {
            _id: this.generateFakeObjectId(),
            idPlanillaEvaluacionCabecera: this.idGuardado,
            agenteEvaluado: {
                idAgenteEvaluado: agente._id,
                nombreAgenteEvaluado: agente.nombre,
                legajo: agente.legajo
            },
            categorias: categoriasTransformadas
        };

        // Verificar si ya existe la evaluación
        this.evaluacionDetalleService.existeEvaluacion(this.idGuardado!, agente._id).subscribe({
            next: (respuesta) => {
                if (respuesta.existe) {
                    this.isEvaluandoAgente = false; // Detener spinner
                    Swal.fire({
                        icon: 'warning',
                        title: 'Agente ya evaluado',
                        text: `El agente ${agente.legajo} ${agente.nombre} ya fue evaluado.`,
                        confirmButtonText: 'Aceptar'
                    });
                    return;
                }

                // Crear evaluación
                this.evaluacionDetalleService.crearEvaluacionDetalle(detalleEvaluacion).subscribe({
                    next: () => {
                        // Corregir items
                        this.evaluacionDetalleService.corregirItemsPorDescripcion(detalleEvaluacion._id).subscribe({
                            next: () => {
                                this.isEvaluandoAgente = false; // Detener spinner
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Evaluación guardada',
                                    text: `Se agregó el agente: ${agente.legajo} ${agente.nombre}`,
                                    showCancelButton: true,
                                    confirmButtonText: 'Sí, agregar otro',
                                    cancelButtonText: 'No, continuar'
                                }).then(result => {
                                    if (result.isConfirmed) this.obtenerAgentesDisponibles();
                                });
                            },
                            error: () => {
                                this.isEvaluandoAgente = false;
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'No se pudieron corregir los ítems de la evaluación.',
                                    confirmButtonText: 'Cerrar'
                                });
                            }
                        });
                    },
                    error: () => {
                        this.isEvaluandoAgente = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo guardar la evaluación.',
                            confirmButtonText: 'Cerrar'
                        });
                    }
                });
            },
            error: () => {
                this.isEvaluandoAgente = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo verificar la evaluación existente.',
                    confirmButtonText: 'Cerrar'
                });
            }
        });
    }


    generateFakeObjectId(): string {
        const hex = '0123456789abcdef';
        let objectId = '';
        for (let i = 0; i < 24; i++) {
            objectId += hex[Math.floor(Math.random() * 16)];
        }
        return objectId;
    }
}