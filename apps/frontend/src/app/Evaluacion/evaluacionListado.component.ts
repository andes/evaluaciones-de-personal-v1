import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { PlanillaEDListadosService } from '../services/PlanillaEDListados.service';
import { TipoCierreEvaluacionService } from '../services/TipoCierreEvaluacionService';


@Component({
    selector: 'app-evaluacion-listado',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HeaderComponent
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

    constructor(
        private planillaEDListadosService: PlanillaEDListadosService,
        private tipoCierreEvaluacionService: TipoCierreEvaluacionService
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
                    this.evaluaciones = resp.data || [];
                },
                error: err => {
                    console.error('Error al cargar evaluaciones', err);
                    this.evaluaciones = [];
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

        // 🔍 1️⃣ VER QUÉ VALOR TIENE EL FILTRO
        console.log('👉 valorFiltro:', this.valorFiltro);
        console.log('👉 tipo valorFiltro:', typeof this.valorFiltro);


        if (!this.valorFiltro) {
            console.log('⚠️ No hay filtro, cargo grilla completa');
            this.cargarGrilla();
            return;
        }


        console.log(
            '🚀 Llamando getEvaluacionesPorTipoCierre con:',
            this.valorFiltro
        );

        this.planillaEDListadosService
            .getEvaluacionesPorTipoCierre(this.valorFiltro)
            .subscribe({
                next: resp => {

                    console.log('✅ Respuesta backend:', resp);

                    this.evaluaciones = resp.data || [];
                },
                error: err => {
                    console.error('❌ Error al filtrar por estado', err);
                    this.evaluaciones = [];
                }
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
