import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiciosService } from '../../services/servicios.service';
import { HeaderComponent } from '../../header/header.component';
import Swal from 'sweetalert2';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface Servicio {
    _id?: string;
    descripcion: string;
}

@Component({
    selector: 'app-servicios',
    standalone: true,
    templateUrl: './servicios.component.html',
    styleUrls: ['./servicios.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class ServiciosComponent implements OnInit {

    servicios: Servicio[] = [];
    mostrarModal = false;
    esEdicion = false;

    servicioSeleccionado: Servicio | null = null;

    nuevoServicio: Servicio = {
        descripcion: ''
    };

    constructor(
        private serviciosService: ServiciosService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarServicios();
    }

    cargarServicios(): void {
        this.serviciosService.getServicios().subscribe({
            next: (response: ApiResponse<Servicio[]>) => {
                this.servicios = response.data; // 👈 CLAVE
            },
            error: () =>
                Swal.fire('❌ Error', 'No se pudieron cargar los servicios', 'error')
        });
    }

    abrirModal(servicio?: Servicio): void {
        if (servicio) {
            this.esEdicion = true;
            this.servicioSeleccionado = servicio;
            this.nuevoServicio = { descripcion: servicio.descripcion };
        } else {
            this.esEdicion = false;
            this.servicioSeleccionado = null;
            this.nuevoServicio = { descripcion: '' };
        }

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarServicio(): void {

        if (!this.nuevoServicio.descripcion.trim()) {
            Swal.fire('⚠️ Atención', 'El nombre es obligatorio', 'warning');
            return;
        }

        if (this.esEdicion && this.servicioSeleccionado?._id) {

            this.serviciosService.actualizarServicio(
                this.servicioSeleccionado._id,
                this.nuevoServicio
            ).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Servicio actualizado', 'success');
                    this.cargarServicios();
                    this.cerrarModal();
                },
                error: () =>
                    Swal.fire('❌ Error', 'No se pudo actualizar', 'error')
            });

        } else {

            this.serviciosService.crearServicio(this.nuevoServicio)
                .subscribe({
                    next: (resp) => {
                        Swal.fire('✅ Éxito', resp.message, 'success');
                        this.cargarServicios();
                        this.cerrarModal();
                    },
                    error: (err) => {

                        if (err.status === 409) {
                            Swal.fire('⚠️ Atención', err.error.message, 'warning');
                        } else if (err.status === 400) {
                            Swal.fire('⚠️ Atención', err.error.message, 'warning');
                        } else {
                            Swal.fire('❌ Error', 'Error inesperado del servidor', 'error');
                        }

                    }
                });
        }
    }



    volver(): void {
        this.router.navigate(['/menu']);
    }

}