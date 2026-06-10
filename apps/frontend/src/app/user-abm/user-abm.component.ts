import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.services';
import { HeaderComponent } from '../header/header.component';
import { ServiciosService } from '../services/servicios.service';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-user-abm',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent],
    templateUrl: './user-abm.component.html',
    styleUrls: ['./user-abm.component.css']
})
export class UserAbmComponent implements OnInit {
    usuarios: any[] = [];
    usuarioSeleccionado: any = null;
    mostrarModal = false;
    esEdicion = false;
    mostrarModalServicios = false;
    servicios: any[] = [];
    servicioSeleccionado = '';
    serviciosAsignados: any[] = [];


    // nicialización consistente con backend
    nuevoUsuario = {
        dni: '',
        password: '',
        nombre: '',
        email: '',
        rol: ''
    };

    cambioServicio(valor: any): void {

    }

    constructor(
        private userService: UserService,
        private serviciosService: ServiciosService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.userService.getUsers().subscribe({
            next: (data: any) => {



                this.usuarios = data.data;
            },
            error: (err) => {
                console.error('Error al obtener usuarios', err);
                Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
            }
        });
    }

    abrirModal(usuario?: any): void {
        if (usuario) {
            this.esEdicion = true;
            this.usuarioSeleccionado = { ...usuario };

            this.nuevoUsuario = {
                dni: usuario.dni || '',
                password: '',
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                rol: usuario.rol || ''
            };
        } else {
            this.esEdicion = false;
            this.usuarioSeleccionado = null;
            this.nuevoUsuario = {
                dni: '',
                password: '',
                nombre: '',
                email: '',
                rol: ''
            };
        }


        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarUsuario(): void {


        // ✅ Validación básica antes de enviar
        if (!this.nuevoUsuario.email || !this.nuevoUsuario.dni || !this.nuevoUsuario.nombre) {
            Swal.fire('⚠️ Campos incompletos', 'Por favor complete todos los campos obligatorios', 'warning');
            return;
        }

        if (this.esEdicion && this.usuarioSeleccionado) {
            this.userService.updateUser(this.usuarioSeleccionado._id, this.nuevoUsuario).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
                    this.cargarUsuarios();
                    this.cerrarModal();
                },
                error: (err) => {
                    console.error(' Error al actualizar:', err);
                    Swal.fire(' Error', 'No se pudo actualizar el usuario', 'error');
                }
            });
        } else {
            this.userService.register(this.nuevoUsuario).subscribe({
                next: () => {
                    Swal.fire(' Éxito', 'Usuario creado correctamente', 'success');
                    this.cargarUsuarios();
                    this.cerrarModal();
                },
                error: (err) => {
                    console.error('Error al crear usuario:', err);
                    Swal.fire(' Error', 'No se pudo crear el usuario', 'error');
                }
            });
        }
    }

    eliminarUsuario(id: string): void {
        Swal.fire({
            title: '¿Eliminar usuario?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.userService.deleteUser(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Usuario eliminado correctamente', 'success');
                        this.cargarUsuarios();
                    },
                    error: (err) => {

                        Swal.fire(' Error', 'No se pudo eliminar el usuario', 'error');
                    }
                });
            }
        });
    }

    abrirPermisos(usuario: any): void {
        this.router.navigate(['/permisos'], {
            state: {
                usuario: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            }
        });
    }

    abrirModalServicios(usuario: any): void {

        this.usuarioSeleccionado = usuario;

        this.serviciosAsignados = [...(usuario.servicios || [])];

        this.mostrarModalServicios = true;

        this.cargarServicios();
    }

    agregarServicio(): void {



        const servicio = this.servicios.find(
            s => s._id === this.servicioSeleccionado
        );


        if (!servicio) {



            Swal.fire(
                'Atención',
                'Debe seleccionar un servicio',
                'warning'
            );

            return;
        }

        const existe = this.serviciosAsignados.some(
            x => x.idServicio === servicio._id
        );

        if (existe) {

            Swal.fire(
                'Atención',
                'El servicio ya está asignado',
                'warning'
            );

            return;
        }

        this.serviciosAsignados.push({
            idServicio: servicio._id,
            descripcion: servicio.descripcion
        });



        this.userService.updateServicios(
            this.usuarioSeleccionado._id,
            this.serviciosAsignados
        ).subscribe({

            next: (resp) => {


                Swal.fire(
                    'Éxito',
                    'Servicios actualizados correctamente',
                    'success'
                );

                this.cargarUsuarios();

                // opcional: cerrar modal
                // this.cerrarModalServicios();

            },

            error: (err) => {

                Swal.fire(
                    'Error',
                    'No se pudieron guardar los servicios',
                    'error'
                );

            }

        });

    }
    cargarServicios(): void {
        this.serviciosService.getServicios().subscribe({
            next: (resp: any) => {
                this.servicios = resp.data || resp;

            }
        });
    }
    /*
        guardarServicios(): void {
    
            console.log('================================');
            console.log('ENTRO A GUARDAR');
            console.log('USUARIO:', this.usuarioSeleccionado);
            console.log('SERVICIOS:', this.serviciosAsignados);
            console.log('================================');
    
            this.userService.updateServicios(
                this.usuarioSeleccionado._id,
                this.serviciosAsignados
            ).subscribe({
    
                next: (resp) => {
    
                    console.log('RESPUESTA PUT:', resp);
    
                    Swal.fire(
                        'Éxito',
                        'Servicios actualizados correctamente',
                        'success'
                    );
    
                    this.cargarUsuarios();
                    this.cerrarModalServicios();
    
                },
    
                error: (err) => {
    
                    console.error('ERROR PUT:', err);
    
                    Swal.fire(
                        'Error',
                        'No se pudieron guardar los servicios',
                        'error'
                    );
    
                }
    
            });
    
        }
        */
    cerrarModalServicios(): void {
        this.mostrarModalServicios = false;
        this.usuarioSeleccionado = null;
    }


    volver(): void {
        this.router.navigate(['/menu']);
    }
}