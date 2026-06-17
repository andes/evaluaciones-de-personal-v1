import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { PlanillaEDListadosService } from '../services/PlanillaEDListados.service';
import { TipoCierreEvaluacionService } from '../services/TipoCierreEvaluacionService';
import { AgentesService } from '../services/agentes.service';
import { PlanillaEDCabeceraService } from '../services/PlanillaEDCabecera.service';
import { PlanillaEDDetalleService } from '../services/PlanillaEDDetalle.service';
import { TipoEvaluacionService } from '../services/tipoevaluacion.service';
import { EvaluacionResultadosService } from '../services/evaluacionResulado.service';
import { EvaluacionService } from '../services/evaluacion.service';
import { PlanillaEDService } from '../services/PlanillaED.Service';
import { HeaderSistemaComponent } from '../header/header-sistema.component';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const Swal = require('sweetalert2').default;


@Component({
    selector: 'app-evaluacion-listado',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HeaderComponent,
        HeaderSistemaComponent

    ],
    templateUrl: './evaluacionListado.component.html',
    styleUrls: ['./evaluacionListado.component.css']
})
export class EvaluacionListadoComponent implements OnInit {

    // 🔹 Combo de filtro
    tipoFiltro: string = '';

    // 🔹 Grilla
    evaluaciones: any[] = [];

    // 🔹 Selects
    agentes: any[] = [];
    evaluadores: any[] = [];
    estados: any[] = [];
    filtroAgenteLegajo: string = '';
    filtroAgenteNombre: string = '';
    filtroEvaluadorNombre: string = '';
    tiposCierre: any[] = [];
    valorFiltro: string = '';

    totalItemsConValor = 0;
    sumaPuntajes = 0;
    promedioPuntaje = 0;

    idCabecera = '';

    cabecera: any = null;


    agentesFiltrados: any[] = [];
    agentesYaEvaluados: any[] = [];

    filtroAgente = '';
    agenteSeleccionado: any = null;

    tiposEvaluacion: any[] = [];
    idTipoEvaluacion: string | null = null;

    motivosCierre: any[] = [];

    mostrarModalCerrar = false;

    idEvaluacionDetalle = '';
    idAgenteCerrar = '';
    nombreAgenteCerrar = '';

    motivoSeleccionado: any = null;
    fechaCierre: any = null;

    isLoadingAgentes = false;
    tipoBusqueda = 'nombre';
    evaluacionSeleccionada: any = null;



    constructor(
        private planillaEDListadosService: PlanillaEDListadosService,
        private tipoCierreEvaluacionService: TipoCierreEvaluacionService,
        private cabeceraService: PlanillaEDCabeceraService,
        private agentesService: AgentesService,
        private detalleService: PlanillaEDDetalleService,
        private tipoEvalService: TipoEvaluacionService,
        private planillaEDService: PlanillaEDService,
        private tipoCierreService: TipoCierreEvaluacionService,
        private resultadosService: EvaluacionResultadosService,
        private evaluacionService: EvaluacionService,


    ) { }


    ngOnInit(): void {
        this.cargarGrilla();
        this.cargarTiposCierre();
    }

    onTipoFiltroChange(): void {
        // limpiar filtros al cambiar tipo
        this.filtroAgenteLegajo = '';
        this.filtroAgenteNombre = '';
    }

    filtrarPorAgente(): void {

        // opcional: evitar búsquedas vacías
        if (!this.filtroAgenteLegajo && !this.filtroAgenteNombre) {
            this.cargarGrilla();
            return;
        }

        this.planillaEDListadosService
            .buscarPorAgente(this.filtroAgenteLegajo, this.filtroAgenteNombre)
            .subscribe({
                next: resp => {
                    this.evaluaciones = resp.data || [];
                },
                error: err => {
                    console.error('Error al buscar por agente', err);
                    this.evaluaciones = [];
                }
            });
    }

    cargarGrilla(): void {
        this.planillaEDListadosService.obtenerEvaluacionesResumen()
            .subscribe({
                next: resp => {

                    console.log('RESPUESTA COMPLETA', resp);

                    this.evaluaciones = resp.data || [];
                },
                error: err => {
                    console.error(err);
                }
            });
    }

    cargarTiposCierre(): void {
        this.tipoCierreEvaluacionService.obtenerTodos()
            .subscribe({
                next: resp => {
                    this.tiposCierre = resp;

                },
                error: err => {
                    console.error(err);
                    this.tiposCierre = [];
                }
            });
    }






    filtrarPorEvaluador(): void {

        if (!this.filtroEvaluadorNombre) {
            this.cargarGrilla();
            return;
        }

        this.planillaEDListadosService
            .buscarPorEvaluador(undefined, this.filtroEvaluadorNombre)
            .subscribe({
                next: resp => {
                    this.evaluaciones = resp.data || [];
                },
                error: err => {
                    console.error('Error al buscar por evaluador', err);
                    this.evaluaciones = [];
                }
            });
    }

    filtrarPorEstado(): void {




        if (!this.valorFiltro) {
            console.log('No hay filtro, cargo grilla completa');
            this.cargarGrilla();
            return;
        }




        this.planillaEDListadosService
            .getEvaluacionesPorTipoCierre(this.valorFiltro)
            .subscribe({
                next: resp => {

                    console.log('Respuesta backend:', resp);

                    this.evaluaciones = resp.data || [];
                },
                error: err => {
                    console.error(' Error al filtrar por estado', err);
                    this.evaluaciones = [];
                }
            });
    }

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

    imprimirEvaluacion(agente: any): void {

        console.log('REGISTRO SELECCIONADO');
        console.log(JSON.stringify(agente, null, 2));

        const idAgente =
            agente?.agenteEvaluado?.idAgenteEvaluado;

        const idCabecera =
            agente?.idCabecera;

        console.log('idAgente', idAgente);
        console.log('idCabecera', idCabecera);

        if (!idCabecera || !idAgente) {
            Swal.fire('Error', 'Faltan datos para generar el PDF', 'error');
            return;
        }

        // 🔹 Primero cargamos los totales desde el backend
        this.cargarTotales(idCabecera, idAgente).then(() => {

            const totalItems = this.totalItemsConValor;
            const sumaPuntajes = this.sumaPuntajes;
            const promedio = this.promedioPuntaje;

            // 🔹 Obtenemos la evaluación completa
            this.planillaEDListadosService.obtenerEvaluacionCompleta(idCabecera).subscribe(
                (resp: any) => {

                    const datos = resp.data;

                    if (!datos || !datos.detalles) {
                        Swal.fire('Error', 'No se encontraron detalles para la evaluación', 'error');
                        return;
                    }

                    const detalleAgente = datos.detalles.find(
                        (d: any) => d.agenteEvaluado.idAgenteEvaluado === idAgente
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
                    doc.text(`Efector: ${datos.cabecera.Efector.nombre}`, 10, 50);
                    doc.text(`Servicio: ${datos.cabecera.Servicio.nombre}`, 10, 58);
                    doc.text(`Período: ${new Date(datos.cabecera.periodo).toLocaleDateString()}`, 10, 66);

                    // 🔹 Construcción de filas
                    const bodyRows: any[] = [];

                    detalleAgente.categorias.forEach((cat: any) => {

                        bodyRows.push([{
                            content: cat.descripcionCategoria,
                            colSpan: 2,
                            styles: {
                                halign: 'left',
                                fontStyle: 'bold',
                                fillColor: [144, 238, 144]
                            }
                        }]);

                        cat.items.forEach((item: any) => {
                            bodyRows.push([
                                item.descripcion,
                                item.puntaje
                            ]);
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

                    // 🔹 Posición final de la tabla
                    let finalY = 75;

                    if ((doc as any).lastAutoTable) {
                        finalY = (doc as any).lastAutoTable.finalY;
                    }

                    // 🔹 Cuadro de totales
                    doc.setDrawColor(0);
                    doc.setFillColor(240, 240, 240);
                    doc.rect(10, finalY + 10, 190, 35, 'FD');

                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Total de ítems con valor: ${totalItems}`, 15, finalY + 18);
                    doc.text(`Suma de puntajes: ${sumaPuntajes}`, 15, finalY + 25);
                    doc.text(`Promedio de puntaje: ${promedio.toFixed(2)}`, 15, finalY + 32);

                    // 🔹 Estado y fecha de cierre
                    let tipoCierre = '-';

                    if (
                        datos.cabecera.tipoCierreEvaluacion &&
                        datos.cabecera.tipoCierreEvaluacion.nombre
                    ) {
                        tipoCierre = datos.cabecera.tipoCierreEvaluacion.nombre;
                    }

                    let fechaCierreTexto = '';

                    if (tipoCierre !== 'Evaluación Abierta') {
                        fechaCierreTexto = datos.cabecera.fechaCierre
                            ? new Date(datos.cabecera.fechaCierre).toLocaleDateString()
                            : '-';
                    }

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);

                    doc.text(`Estado de la evaluación: ${tipoCierre}`, 15, finalY + 50);

                    if (fechaCierreTexto) {
                        doc.text(`Fecha de cierre: ${fechaCierreTexto}`, 15, finalY + 58);
                    }

                    // 🔹 Pie de página
                    const pageHeight = doc.internal.pageSize.height;

                    doc.setFontSize(10);
                    doc.text(
                        `Generado el ${new Date().toLocaleDateString()} - Sistema de Evaluación`,
                        105,
                        pageHeight - 10,
                        { align: "center" }
                    );

                    // 🔹 Guardar PDF
                    doc.save(
                        `Evaluacion_${detalleAgente.agenteEvaluado.nombreAgenteEvaluado}.pdf`
                    );

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


    buscarEvaluaciones(): void {

        switch (this.tipoFiltro) {

            case '':
                // TODOS
                this.cargarGrilla();
                break;

            case 'agente':
                this.filtrarPorAgente();
                break;

            case 'evaluador':
                this.filtrarPorEvaluador();
                break;

            case 'estado':
                this.filtrarPorEstado();
                break;

            default:
                this.cargarGrilla();
                break;
        }
    }


    volver(): void { }
}
