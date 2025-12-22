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
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


const Swal = require('sweetalert2').default;

@Component({
    selector: 'app-evaluacion-cabecera',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        RouterModule
    ],
    templateUrl: './evaluacionCabecera.component.html',
    styleUrls: ['./evaluacionCabecera.component.css']
})
export class EvaluacionCabeceraComponent implements OnInit {

    tiposEvaluacion: TipoEvaluacion[] = [];
    evaluacionCabecera: any = {};
    cabeceraSeleccionada: any = null;
    idTipoEvaluacion: string = '';

    nombreAgenteEvaluador: string = '';
    idGuardado: string | null = null;
    tipoBusqueda: string = 'nombre';
    cabecerasEncontradas: any[] = [];

    evaluacion: any = {};
    agentesDisponibles: any[] = [];
    filtroAgente: string = '';
    categoriasDesdePlanilla: any[] = [];

    mostrarModal: boolean = false;
    isLoading: boolean = true;
    isLoadingAgentes: boolean = false;

    idEfector: string = '';
    idServicio: string = '';
    efectores: any[] = [];
    servicios: any[] = [];
    //  isLoadingAgentes = false; // ya la tenías para la grilla
    isEvaluandoAgente = false; // nueva para cuando se hace click en "Elegir"




    constructor(
        private authService: AuthService,
        private planillaService: PlanillaEDService,
        private planillaEDCabeceraService: PlanillaEDCabeceraService,
        private agentesService: AgentesService,
        private evaluacionDetalleService: PlanillaEDDetalleService,
        private _tipoEvaluacionService: TipoEvaluacionService,
        private efectoresService: EfectoresService,
        private serviciosService: ServiciosService,
        private router: Router,
    ) { }

    ngOnInit(): void {



        this.obtenerAgentesDisponibles();
        this.cargarTiposEvaluacion();

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

        // Ya no existe efector / servicio → se elimina toda esa lógica.
        this.isLoading = false;

        // Cargar la grilla de cabeceras (solo por evaluador)
        this.buscarCabeceras();
        this.cargarEfectores();
        this.cargarServicios();

    }

    get textoBusqueda(): string {
        return this.tipoBusqueda === 'nombre' ? 'Buscar por Nombre' : 'Buscar por Legajo';
    }



    obtenerAgentesDisponibles() {
        this.isLoadingAgentes = true;
        this.agentesService.obtenerTodosAgentes().subscribe({
            next: (agentes) => {
                this.agentesDisponibles = agentes;
                this.isLoadingAgentes = false;
            },
            error: (err) => {
                console.error('Error al obtener agentes:', err);
                this.agentesDisponibles = [];
                this.isLoadingAgentes = false;
            }
        });
    }

    guardarCabecera(): void {

        // Validar Efector
        if (!this.idEfector) {
            Swal.fire({
                icon: 'warning',
                title: 'Efector requerido',
                text: 'Debes seleccionar un Efector antes de guardar.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Validar Servicio
        if (!this.idServicio) {
            Swal.fire({
                icon: 'warning',
                title: 'Servicio requerido',
                text: 'Debes seleccionar un Servicio antes de guardar.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Armar el objeto a enviar
        const efectorSeleccionado = this.efectores.find(e => e._id === this.idEfector) || { nombre: '' };
        const servicioSeleccionado = this.servicios.find(s => s._id === this.idServicio) || { nombre: '' };


        const payload = {
            ...this.evaluacionCabecera,
            Efector: {
                idEfector: this.idEfector,
                nombre: efectorSeleccionado.nombre
            },
            Servicio: {
                idServicio: this.idServicio,
                nombre: servicioSeleccionado.nombre
            }
        };




        this.planillaEDCabeceraService.crearCabeceraEvaluacion(payload).subscribe({
            next: (respuestaCreacion) => {
                const data = respuestaCreacion.data || {};
                this.idGuardado = data._id || data.id || 'Sin ID';

                this.buscarCabeceras();
                this.mostrarModal = true;
                this.obtenerAgentesDisponibles();

                Swal.fire({
                    icon: 'success',
                    title: 'Registro guardado',
                    text: 'La cabecera fue guardada exitosamente.',
                    confirmButtonText: 'Aceptar'
                });
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: 'Hubo un problema al guardar la cabecera.',
                    confirmButtonText: 'Cerrar'
                });
            }
        });
    }



    get agentesFiltrados() {
        const filtro = this.filtroAgente.toLowerCase();
        if (!filtro) return this.agentesDisponibles;

        return this.agentesDisponibles.filter(agente => {
            if (this.tipoBusqueda === 'nombre') return agente.nombre.toLowerCase().includes(filtro);
            if (this.tipoBusqueda === 'legajo') return agente.legajo.toString().includes(filtro);
            return false;
        });
    }

    cargarEfectores(): void {
        this.efectores = [];
        this.efectoresService.getEfectores().subscribe({
            next: (list) => this.efectores = list || [],
            error: (err) => {
                console.error('Error al cargar efectores', err);
                this.efectores = [];
            }
        });
    }

    cargarServicios() {
        this.serviciosService.getServicios().subscribe({
            next: (lista) => {

                this.servicios = lista;       // ← NO lista.data
            },
            error: (err) => {
                console.error('Error al cargar servicios', err);
                this.servicios = [];
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


    cargarPlanillaPorTipoEvaluacion(): void {

        if (!this.idTipoEvaluacion) {
            Swal.fire({
                icon: 'warning',
                title: 'Tipo de evaluación requerido',
                text: 'Debes seleccionar un tipo antes de continuar.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        this.planillaService.getPlanillaPorTipoEvaluacion(this.idTipoEvaluacion).subscribe({
            next: (planilla) => {

                if (!planilla || !planilla._id) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Planilla no encontrada',
                        text: 'No existe una planilla para ese tipo.',
                        confirmButtonText: 'Aceptar'
                    });
                    this.categoriasDesdePlanilla = [];
                    return;
                }

                this.categoriasDesdePlanilla = planilla.categorias || [];
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Tipo de evaluación inexistente',
                    text: 'Este tipo no tiene ítems cargados.',
                    confirmButtonText: 'Aceptar'
                });
                this.categoriasDesdePlanilla = [];
            }
        });
    }

    cargarTiposEvaluacion() {
        this._tipoEvaluacionService.obtenerTipos().subscribe((data: TipoEvaluacion[]) => {
            this.tiposEvaluacion = data;
        });
    }

    generateFakeObjectId(): string {
        const hex = '0123456789abcdef';
        let objectId = '';
        for (let i = 0; i < 24; i++) objectId += hex[Math.floor(Math.random() * 16)];
        return objectId;
    }

    buscarCabeceras(): void {
        const idUsuarioEvaluador = this.authService.getId() || '';

        if (!idUsuarioEvaluador) {
            console.warn('No hay usuario evaluador definido.');
            this.cabecerasEncontradas = [];
            return;
        }

        this.planillaEDCabeceraService.buscarCabecerasPorEvaluador(idUsuarioEvaluador)
            .subscribe({
                next: (data) => {
                    this.cabecerasEncontradas = data.data || [];
                },
                error: (err) => {
                    console.error('Error al buscar cabeceras:', err);
                    this.cabecerasEncontradas = [];
                }
            });
    }
    volver(): void {
        this.router.navigate(['/menu']);
    }



}