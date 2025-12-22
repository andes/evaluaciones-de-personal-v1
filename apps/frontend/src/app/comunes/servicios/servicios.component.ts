import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiciosService } from '../../services/servicios.service';
import { HeaderComponent } from '../../header/header.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-servicios',
    standalone: true,
    templateUrl: './servicios.component.html',
    styleUrls: ['./servicios.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class ServiciosComponent implements OnInit {

    servicios: any[] = [];
    mostrarModal = false;
    esEdicion = false;

    servicioSeleccionado: any = null;

    nuevoServicio = {
        nombre: ''
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
            next: data => this.servicios = data,
            error: () => Swal.fire('❌ Error', 'No se pudieron cargar los servicios', 'error')
        });
    }

    abrirModal(servicio?: any): void {
        if (servicio) {
            this.esEdicion = true;
            this.servicioSeleccionado = servicio;
            this.nuevoServicio.nombre = servicio.nombre;
        } else {
            this.esEdicion = false;
            this.servicioSeleccionado = null;
            this.nuevoServicio.nombre = '';
        }

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarServicio(): void {

        if (this.esEdicion && this.servicioSeleccionado) {
            this.serviciosService.actualizarServicio(
                this.servicioSeleccionado._id,
                this.nuevoServicio
            ).subscribe({
                next: () => {
                    Swal.fire(' Éxito', 'Servicio actualizado', 'success');
                    this.cargarServicios();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar', 'error')
            });

        } else {
            this.serviciosService.crearServicio(this.nuevoServicio).subscribe({
                next: () => {
                    Swal.fire(' Éxito', 'Servicio creado', 'success');
                    this.cargarServicios();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo crear', 'error')
            });
        }
    }

    eliminarServicio(id: string): void {
        Swal.fire({
            title: '¿Eliminar servicio?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(res => {
            if (res.isConfirmed) {
                this.serviciosService.eliminarServicio(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Servicio eliminado', 'success');
                        this.cargarServicios();
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
