import { TipoEvaluacionService } from '../services/tipoevaluacion.service';
import { PlanillaEDService } from '../services/PlanillaED.Service';
import { TipoCierreEvaluacionService } from '../services/TipoCierreEvaluacionService';
import { EvaluacionResultadosService } from '../services/evaluacionResulado.service';
import { HeaderComponent } from '../header/header.component';
import { EvaluacionService } from '../services/evaluacion.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentesService } from '../services/agentes.service';
import { PlanillaEDCabeceraService } from '../services/PlanillaEDCabecera.service';
import { PlanillaEDDetalleService } from '../services/PlanillaEDDetalle.service';
import { PlanillaEDListadosService } from '../services/PlanillaEDListados.service';

imports: [CommonModule, FormsModule]
import { v4 as uuidv4 } from 'uuid';


const Swal = require('sweetalert2').default;
import { Component, OnInit } from '@angular/core';




@Component({
    selector: 'app-evaluacion-agente',
    standalone: true,
    templateUrl: './evaluacionAgente.component.html',
    styleUrls: ['./evaluacionAgente.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent                                  // <-- AGREGAR
    ]
})
export class EvaluacionAgenteComponent implements OnInit {

    totalItemsConValor = 0;
    sumaPuntajes = 0;
    promedioPuntaje = 0;

    // --- IDs desde ruta ---
    idCabecera: string = '';

    // --- Cabecera ---
    cabecera: any = null;

    // --- Agentes ---
    agentes: any[] = [];
    agentesFiltrados: any[] = [];
    filtroAgente: string = '';
    agenteSeleccionado: any = null;

    // --- Tipos de evaluación ---
    tiposEvaluacion: any[] = [];
    idTipoEvaluacion: string | null = null;

    // --- Agentes evaluados ---
    agentesYaEvaluados: any[] = [];

    // --- Modal cerrar evaluación ---
    mostrarModalCerrar: boolean = false;
    idEvaluacionDetalle: string = '';
    idAgenteCerrar: string = '';
    nombreAgenteCerrar: string = '';
    motivoSeleccionado: any = null;
    fechaCierre: any = null;

    motivosCierre: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cabeceraService: PlanillaEDCabeceraService,
        private agentesService: AgentesService,
        private detalleService: PlanillaEDDetalleService,
        private tipoEvalService: TipoEvaluacionService,
        private planillaEDService: PlanillaEDService,
        private tipoCierreService: TipoCierreEvaluacionService,
        private resultadosService: EvaluacionResultadosService,
        private evaluacionService: EvaluacionService,
        private planillaEDListadosService: PlanillaEDListadosService,

    ) { }

    // ============================================================
    //                         ON INIT
    // ============================================================
    ngOnInit(): void {
        // Leer parámetros de la ruta de forma segura
        this.route.paramMap.subscribe(paramMap => {
            this.idCabecera = paramMap.get('id') || '';

            if (this.idCabecera) {
                this.cargarCabecera();
                this.cargarAgentesYaEvaluados();

                // 🔹 Cargar totales solo si tenemos idCabecera
                //    Podés usar un idAgente real o un valor de ejemplo

            } else {
                console.warn('No se recibió idCabecera en la ruta.');
            }
        });

        // Cargar datos generales
        this.cargarAgentes();
        this.cargarTiposEvaluacion();
        this.cargarMotivosCierre();
    }

    //  Método cargarTotales dentro de la clase
    cargarTotales(idCabecera: string, idAgente: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.resultadosService.obtenerTotales(idCabecera, idAgente).subscribe({
                next: (resp) => {
                    this.totalItemsConValor = resp?.totalItems || 0;
                    this.sumaPuntajes = resp?.totalPuntaje || 0;
                    this.promedioPuntaje = this.totalItemsConValor > 0
                        ? this.sumaPuntajes / this.totalItemsConValor
                        : 0;


                    resolve();
                },
                error: (err) => reject(err)
            });
        });
    }

    cargarCabecera() {

        this.cabeceraService.obtenerCabecera(this.idCabecera).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.cabecera = res.data;

                } else {
                    Swal.fire('Error', 'No se pudo cargar la cabecera.', 'error');
                }
            },
            error: (err) => {

                Swal.fire('Error', 'No se pudo cargar la cabecera.', 'error');
            }
        });
    }







    cargarAgentes() {
        this.agentesService.obtenerTodosAgentes().subscribe({
            next: (resp: any[]) => {
                this.agentes = resp;
                this.agentesFiltrados = [...this.agentes];
            },
            error: () => Swal.fire('Error', 'No se pudieron cargar los agentes.', 'error')
        });
    }


    cargarTiposEvaluacion() {
        this.tipoEvalService.obtenerTipos().subscribe({
            next: (data) => this.tiposEvaluacion = data,
            error: () => Swal.fire('Error', 'No se pudieron cargar los tipos.', 'error')
        });
    }

    cargarMotivosCierre() {
        this.tipoCierreService.obtenerTodos().subscribe({
            next: (data) => this.motivosCierre = data,
            error: () => Swal.fire('Error', 'No se pudieron cargar los motivos.', 'error')
        });
    }

    cargarAgentesYaEvaluados() {
        this.detalleService.getAgentesPorCabecera(this.idCabecera)
            .subscribe({
                next: (resp: any) => {

                    this.agentesYaEvaluados = resp.data ?? resp;
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo cargar listado de evaluados.', 'error');
                }
            });
    }






    //                      FILTRO AGENTES

    filtrarAgentes() {
        const f = this.filtroAgente.toLowerCase();
        this.agentesFiltrados = this.agentes.filter(a =>
            a.nombre.toLowerCase().includes(f) ||
            (a.legajo && a.legajo.toString().includes(f))
        );
    }


    //                  AGREGAR / EVALUAR AGENTE

    evaluarAgente(agente: any) {
        if (!agente) {
            Swal.fire('Atención', 'Seleccioná un agente.', 'warning');
            return;
        }
        if (!this.idTipoEvaluacion) {
            Swal.fire('Atención', 'Seleccioná un tipo de evaluación.', 'warning');
            return;
        }

        this.detalleService.existeEvaluacion(this.idCabecera, agente._id).subscribe({
            next: (data: any) => {
                if (data.existe) {
                    Swal.fire('Atención', 'Este agente ya tiene evaluación.', 'info');
                } else {
                    this.crearEvaluacion(agente);
                }
            }
        });
    }


    crearEvaluacion(agente: any) {

        const tipoAbierta = this.motivosCierre.find(
            (t: any) => t.nombre === 'Evaluación Abierta'
        );

        if (!tipoAbierta) {
            Swal.fire(
                'Error',
                'No se encontró el tipo de cierre "Evaluación Abierta"',
                'error'
            );
            return;
        }

        const payload = {
            idPlanillaEvaluacionCabecera: this.idCabecera,
            agenteEvaluado: {
                idAgenteEvaluado: agente._id,
                nombreAgenteEvaluado: agente.nombre,
                legajo: agente.legajo || 'SIN_LEGAJO'
            },
            tipoCierreEvaluacion: {
                idTipoCierreEvaluacion: '691b1629fac1f621db17efa5',
                nombreTipoCierreEvaluacion: 'Evaluación Abierta'
            },
            categorias: []
        };

        this.detalleService.crearEvaluacionDetalle(payload).subscribe({
            next: () => {
                Swal.fire('Ok', 'Agente agregado a evaluación.', 'success');
                this.cargarAgentesYaEvaluados();
            },
            error: () => {
                Swal.fire('Error', 'No se pudo crear evaluación.', 'error');
            }
        });
    }





    //                     VER DETALLE / VOLVER

    verItemsEvaluacion(agente: any) {


        this.router.navigate(['/evaluacion-items', this.idCabecera, agente.idAgenteEvaluado]);
    }


    volverACabecera() {
        this.router.navigate(['/evaluacion-cabecera']);
    }

    // ============================================================
    //                     MODAL CERRAR EVALUACIÓN
    // ============================================================
    abrirModalCerrar(idEvaluacion: string, idAgente: string, nombre: string) {
        this.mostrarModalCerrar = true;
        this.idEvaluacionDetalle = idEvaluacion;
        this.idAgenteCerrar = idAgente;
        this.nombreAgenteCerrar = nombre;
        this.fechaCierre = new Date().toISOString().split('T')[0];
    }

    cerrarModalCerrar() {
        this.mostrarModalCerrar = false;
        this.motivoSeleccionado = null;
    }

    confirmarCierre() {
        if (!this.motivoSeleccionado) {
            Swal.fire('Atención', 'Elegí un motivo.', 'warning');
            return;
        }

        // 🔥 Aseguramos el formato correcto del body
        const tipoCierre = {
            idTipoCierreEvaluacion: this.motivoSeleccionado._id,
            nombreTipoCierreEvaluacion: this.motivoSeleccionado.nombre,
            detalle: this.motivoSeleccionado.detalle || '',
            descripcion: this.motivoSeleccionado.descripcion || ''
        };



        this.detalleService.cerrarEvaluacion(
            this.idEvaluacionDetalle,
            this.idAgenteCerrar,
            tipoCierre
        ).subscribe({
            next: () => {
                Swal.fire('OK', 'Evaluación cerrada.', 'success');
                this.cerrarModalCerrar();
                this.cargarAgentesYaEvaluados();
            },
            error: (err) => {
                console.error("ERROR CIERRE:", err);
                Swal.fire('Error', 'No se pudo cerrar la evaluación.', 'error');
            }
        });
    }




    //                        IMPRIMIR PDF



    imprimirEvaluacion(agente: any): void {
        const idAgente = agente.idAgenteEvaluado;
        const idCabecera = this.idCabecera;

        if (!idCabecera || !idAgente) {
            Swal.fire('Error', 'Faltan datos para generar el PDF', 'error');
            return;
        }

        // 🔹 Primero crgo los totales desde el backend
        this.cargarTotales(idCabecera, idAgente).then(() => {


            const totalItems = this.totalItemsConValor;
            const sumaPuntajes = this.sumaPuntajes;
            const promedio = this.promedioPuntaje;

            // 🔹 Obtenemos la evaluación completa
            this.planillaEDListadosService.obtenerEvaluacionCompleta(idCabecera).subscribe(
                (resp) => {
                    if (!resp || !resp.detalles) {
                        Swal.fire('Error', 'No se encontraron detalles para la evaluación', 'error');
                        return;
                    }

                    const detalleAgente = resp.detalles.find(
                        d => d.agenteEvaluado.idAgenteEvaluado === idAgente
                    );

                    if (!detalleAgente) {
                        Swal.fire('Error', 'No se encontró la evaluación de este agente', 'error');
                        return;
                    }

                    const doc = new jsPDF();

                    // 🔹 Cabecera principal
                    doc.setFontSize(18);
                    doc.setFont("helvetica", "bold");
                    doc.text("Evaluación de Desempeño", 105, 15, { align: "center" });

                    // 🔹 Datos del agente
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Legajo: ${detalleAgente.agenteEvaluado.legajo || '-'}`, 10, 30);
                    doc.text(`Nombre: ${detalleAgente.agenteEvaluado.nombreAgenteEvaluado.toUpperCase()}`, 10, 38);

                    // 🔹 Datos de la evaluación
                    doc.text(`Efector: ${resp.cabecera.Efector.nombre}`, 10, 50);
                    doc.text(`Servicio: ${resp.cabecera.Servicio.nombre}`, 10, 58);
                    doc.text(`Período: ${new Date(resp.cabecera.periodo).toLocaleDateString()}`, 10, 66);

                    // 🔹 Construcción de filas por categoría e ítems
                    const bodyRows: any[] = [];
                    detalleAgente.categorias.forEach((cat: any) => {
                        bodyRows.push([{
                            content: cat.descripcionCategoria,
                            colSpan: 2,
                            styles: { halign: 'left', fontStyle: 'bold', fillColor: [144, 238, 144] }
                        }]);
                        cat.items.forEach((item: any) => {
                            bodyRows.push([item.descripcion, item.puntaje]);
                        });
                    });

                    autoTable(doc, {
                        body: bodyRows,
                        startY: 75,
                        theme: 'grid',
                        styles: { fontSize: 11 },
                        columnStyles: {
                            0: { cellWidth: 150 },
                            1: { cellWidth: 40, halign: 'center' }
                        }
                    });

                    // 🔹 Final de tabla
                    let finalY = 75;
                    if ((doc as any).lastAutoTable) {
                        finalY = (doc as any).lastAutoTable.finalY;
                    }

                    // 🔹 Cuadro con totales
                    doc.setDrawColor(0);
                    doc.setFillColor(240, 240, 240);
                    doc.rect(10, finalY + 10, 190, 35, 'FD');

                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Total de ítems con valor: ${totalItems}`, 15, finalY + 18);
                    doc.text(`Suma de puntajes: ${sumaPuntajes}`, 15, finalY + 25);
                    doc.text(`Promedio de puntaje: ${promedio.toFixed(2)}`, 15, finalY + 32);

                    // 🔹 Estado y fecha de cierre (FUERA DEL CUADRO)
                    let tipoCierre = '-';
                    if (resp.cabecera.tipoCierreEvaluacion && resp.cabecera.tipoCierreEvaluacion.nombre) {
                        tipoCierre = resp.cabecera.tipoCierreEvaluacion.nombre;
                    }

                    let fechaCierreTexto = '';
                    if (tipoCierre !== 'Evaluación Abierta') {
                        fechaCierreTexto = resp.cabecera.fechaCierre
                            ? new Date(resp.cabecera.fechaCierre).toLocaleDateString()
                            : '-';
                    }

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    // Lo colocamos justo debajo del cuadro de totales
                    doc.text(`Estado de la evaluación: ${tipoCierre}`, 15, finalY + 50);
                    if (fechaCierreTexto) {
                        doc.text(`Fecha de Cierre: ${fechaCierreTexto}`, 15, finalY + 58);
                    }

                    // 🔹 Pie de página
                    const pageHeight = doc.internal.pageSize.height;
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Generado el ${new Date().toLocaleDateString()} - Sistema de Evaluación`, 105, pageHeight - 10, { align: "center" });

                    // 🔹 Guardamos el PDF
                    doc.save(`Evaluacion_${detalleAgente.agenteEvaluado.nombreAgenteEvaluado}.pdf`);
                },
                (err) => {
                    console.error('Error al obtener evaluación completa:', err);
                    Swal.fire('Error', 'No se pudo generar el PDF', 'error');
                }
            );
        }).catch(err => {
            console.error('Error al cargar totales:', err);
            Swal.fire('Error', 'No se pudieron cargar los totales', 'error');
        });
    }


}
