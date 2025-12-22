import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentesService } from '../services/agentes.service';
import { AuthService } from '../auth.service';

import { PlanillaEDCabeceraService, PlanillaEDCabecera } from '../services/PlanillaEDCabecera.service';
import { PlanillaEDDetalleService } from '../services/PlanillaEDDetalle.service';
import { PlanillaEDItemsService } from '../services/PlanillaEDIItems.service';
import { EvaluacionResultadosService } from '../services/evaluacionResulado.service';



import { HeaderComponent } from '../header/header.component';

@Component({
    standalone: true,
    selector: 'app-evaluacion-items',
    templateUrl: './evaluacionItems.component.html',
    styleUrls: ['./evaluacionItems.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HeaderComponent
    ]
})
export class EvaluacionItemsComponent implements OnInit {

    idEvaluacion: string = '';
    idAgente: string = '';
    cabecera: PlanillaEDCabecera | null = null;
    nombreAgenteEvaluado: string = '';
    categorias: any[] = [];

    mostrarModalValor: boolean = false;
    valorIngresado: number | null = null;
    itemSeleccionado: any = null;

    // Totales
    totalItems: number = 0;
    totalItemsConValor: number = 0;
    sumaPuntajes: number = 0;
    promedioPuntajes: number = 0;

    constructor(
        private route: ActivatedRoute,
        private cabeceraService: PlanillaEDCabeceraService,
        private detalleService: PlanillaEDDetalleService,
        private planillaEDItemsService: PlanillaEDItemsService,
        private resultadosService: EvaluacionResultadosService,
        private router: Router,
        private authService: AuthService,
        private agentesService: AgentesService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const idEval = params.get('idEvaluacion');
            const idAg = params.get('idAgente');

            if (idEval && idAg) {
                this.idEvaluacion = idEval;
                this.idAgente = idAg;


                this.obtenerAgenteEvaluado();
                this.obtenerCabecera();
                this.obtenerCategoriasEItems();
                this.cargarResultadosEvaluacion();
            } else {
                console.warn('No se recibieron idEvaluacion o idAgente en la ruta');
            }
        });
    }

    obtenerAgenteEvaluado(): void {
        if (!this.idAgente) return;

        this.agentesService.obtenerAgentePorId(this.idAgente).subscribe({
            next: (agente) => {
                this.nombreAgenteEvaluado = `${agente.legajo} - ${agente.nombre}`;
            },
            error: (err) => {
                console.error('Error al obtener agente evaluado:', err);
                this.nombreAgenteEvaluado = 'Agente no encontrado';
            }
        });
    }


    obtenerCabecera(): void {
        if (!this.idEvaluacion) return;
        this.cabeceraService.obtenerCabeceraG(this.idEvaluacion).subscribe({
            next: r => this.cabecera = r.data,
            error: e => console.error('Error cabecera:', e)
        });
    }

    obtenerCategoriasEItems(): void {
        if (!this.idEvaluacion || !this.idAgente) return;
        this.detalleService.obtenerCategoriasEItemsPorEvaluacion(this.idEvaluacion, this.idAgente).subscribe({
            next: r => this.categorias = r.data,
            error: e => console.error('Error categorías:', e)
        });
    }

    evaluarItem(item: any): void {
        this.itemSeleccionado = item;
        this.valorIngresado = item.puntaje ?? null;
        this.mostrarModalValor = true;
    }

    cerrarModalValor(): void {
        this.mostrarModalValor = false;
        this.itemSeleccionado = null;
        this.valorIngresado = null;
    }

    guardarValor(): void {
        if (!this.itemSeleccionado || this.valorIngresado == null) return this.cerrarModalValor();

        // Aquí usamos _id directamente si idItem no existe
        const idItemString = this.itemSeleccionado.idItem || this.itemSeleccionado._id;

        if (!idItemString) {
            console.error('❌ idItem no definido:', this.itemSeleccionado);
            return;
        }

        const payload = {
            idPlanillaEvaluacionCabecera: this.idEvaluacion,
            idAgenteEvaluado: this.idAgente,
            idItem: idItemString,
            nuevoPuntaje: this.valorIngresado
        };


        this.planillaEDItemsService.actualizarPuntaje(payload).subscribe({
            next: (resp) => {
                if (resp.success) {
                    this.itemSeleccionado.puntaje = this.valorIngresado;
                    this.cargarResultadosEvaluacion();
                }
                this.cerrarModalValor();
            },
            error: (err) => {
                console.error('❌ Error al actualizar puntaje:', err);
                this.cerrarModalValor();
            }
        });
    }




    cargarResultadosEvaluacion(): void {
        if (!this.idEvaluacion || !this.idAgente) return;

        this.resultadosService.obtenerTotales(this.idEvaluacion, this.idAgente).subscribe({
            next: resp => {
                this.totalItems = +resp.totalItems || 0;
                this.sumaPuntajes = +resp.totalPuntaje || 0;

                this.resultadosService.contarItemsConValor(this.idEvaluacion, this.idAgente).subscribe({
                    next: valResp => {
                        this.totalItemsConValor = +valResp.totalItems || 0;
                        this.promedioPuntajes = this.totalItemsConValor > 0
                            ? this.sumaPuntajes / this.totalItemsConValor
                            : 0;
                    }
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/evaluacion-agente', this.idEvaluacion]);
    }
}
