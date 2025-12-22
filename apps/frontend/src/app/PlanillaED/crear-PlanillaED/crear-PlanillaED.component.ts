import { Component, OnInit } from '@angular/core';
import { PlanillaEDService } from '../../services/PlanillaED.Service';
import { Router } from '@angular/router';
import { TipoEvaluacionService, TipoEvaluacion } from '../../services/tipoevaluacion.service';

import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-crear-planilla',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent
    ],
    templateUrl: './crear-PlanillaED.component.html',
    styleUrls: ['./crear-PlanillaED.component.css']
})
export class CrearPlanillaEDComponent implements OnInit {

    tiposEvaluacion: TipoEvaluacion[] = [];

    nuevoPlanillaED: any = {
        fechaCreacion: new Date(),
        descripcion: '',
        tipoEvaluacion: ''
    };

    constructor(
        private _PlanillaEDService: PlanillaEDService,
        private router: Router,
        private _tipoEvaluacionService: TipoEvaluacionService
    ) { }

    ngOnInit(): void {
        this.cargarTiposEvaluacion();
    }

    cargarTiposEvaluacion() {
        this._tipoEvaluacionService.obtenerTipos().subscribe((data: TipoEvaluacion[]) => {
            this.tiposEvaluacion = data;
        });
    }

    guardarPlanilla() {
        if (!this.nuevoPlanillaED.descripcion || !this.nuevoPlanillaED.tipoEvaluacion) {
            alert('Debe completar la descripción y el tipo de evaluación.');
            return;
        }

        const tipo = this.tiposEvaluacion.find(t => t._id === this.nuevoPlanillaED.tipoEvaluacion);

        if (!tipo) {
            alert('Tipo de evaluación no válido.');
            return;
        }

        const nuevaPlanilla = {
            descripcion: this.nuevoPlanillaED.descripcion,
            fechaCreacion: new Date(),
            tipoEvaluacion: {
                idTipoEvaluacion: tipo._id,
                nombre: tipo.nombre
            }
        };

        this._PlanillaEDService.guardarPlanillaED(nuevaPlanilla).subscribe({
            next: (response) => {

                Swal.fire({
                    icon: 'success',
                    title: 'Planilla creada',
                    text: 'La planilla fue registrada correctamente.',
                    confirmButtonText: 'Aceptar'
                });

                this.router.navigate([`/crearplanillaItems/${response._id}`], {
                    queryParams: {
                        descripcion: nuevaPlanilla.descripcion
                    }
                });
            },
            error: (error) => {

                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear la planilla',
                    text: error?.error?.message || 'Ocurrió un error inesperado.',
                    confirmButtonText: 'Cerrar'
                });

            }
        });

    }

    public onPlanillaEDClick(): void {
        this.router.navigate(['/listar-planillaEDRouter']);
    }

    volver() {
        this.router.navigate(['/planillaed']);
    }
}
