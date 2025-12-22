import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.services';
import { HeaderComponent } from '../header/header.component';
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

    // ✅ Inicialización consistente con backend
    nuevoUsuario = {
        dni: '',
        password: '',
        nombre: '',
        email: '',
        rol: ''
    };

    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.usuarios = data;
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

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
