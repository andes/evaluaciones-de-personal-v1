import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoEvaluacionService, TipoEvaluacion } from '../../services/tipoevaluacion.service';
import { HeaderComponent } from '../../header/header.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-tipo-evaluacion',
    standalone: true,
    templateUrl: './tipoEvaluacion.component.html',
    styleUrls: ['./tipoEvaluacion.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class TipoEvaluacionComponent implements OnInit {

    tipos: TipoEvaluacion[] = [];
    mostrarModal = false;
    esEdicion = false;
    tipoSeleccionado: TipoEvaluacion | null = null;

    nuevoTipo: TipoEvaluacion = {
        nombre: '',
        descripcion: ''
    };

    constructor(
        private tipoService: TipoEvaluacionService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarTipos();
    }

    cargarTipos(): void {
        this.tipoService.obtenerTipos().subscribe({
            next: (response: any) => {
                this.tipos = response.data;
            },
            error: () =>
                Swal.fire('Error', 'No se pudieron cargar los tipos de evaluación', 'error')
        });
    }

    abrirModal(tipo?: TipoEvaluacion): void {
        if (tipo) {
            this.esEdicion = true;
            this.tipoSeleccionado = tipo;
            this.nuevoTipo = { ...tipo };
        } else {
            this.esEdicion = false;
            this.tipoSeleccionado = null;
            this.nuevoTipo = { nombre: '', descripcion: '' };
        }

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarTipo(): void {
        if (this.esEdicion && this.tipoSeleccionado?._id) {
            this.tipoService.actualizarTipo(this.tipoSeleccionado._id, this.nuevoTipo).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Tipo de evaluación actualizado', 'success');
                    this.cargarTipos();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar', 'error')
            });
        } else {
            this.tipoService.crearTipo(this.nuevoTipo).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Tipo de evaluación creado', 'success');
                    this.cargarTipos();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo crear', 'error')
            });
        }
    }

    eliminarTipo(id: string): void {
        Swal.fire({
            title: '¿Eliminar tipo de evaluación?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((r) => {
            if (r.isConfirmed) {
                this.tipoService.eliminarTipo(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Tipo de evaluación eliminado', 'success');
                        this.cargarTipos();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo eliminar', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
