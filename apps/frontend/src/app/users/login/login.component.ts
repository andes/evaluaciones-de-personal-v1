import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.services';
import { HomeComponent } from '../../home/home.component';
import { AuthService } from '../../auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, HomeComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

    dni: string = '';
    password: string = '';
    errorMessage: string = '';

    @ViewChild('loginForm', { static: false }) loginForm!: NgForm;

    constructor(
        private userService: UserService,
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Limpiar sesión anterior
        this.authService.logout();
        this.dni = '';
        this.password = '';
    }

    ngAfterViewInit(): void {
        this.resetForm();
        this.cdr.detectChanges();
    }


    //                    LOGIN

    onLogin() {

        if (!this.dni || !this.password) {
            this.errorMessage = 'Todos los campos son obligatorios.';
            this.resetForm();
            return;
        }

        this.userService.login(this.dni, this.password).subscribe({
            next: (response) => {

                if (response?.token && response?.user) {

                    // Guardar token + usuario
                    this.authService.guardarToken(response.token, response.user);

                    // Guardar info rápida en localStorage
                    localStorage.setItem('nombreUsuario', response.user.nombre || '');
                    localStorage.setItem('rolUsuario', response.user.rol || '');
                    localStorage.setItem('usuarioId', response.user.id || '');

                    Swal.fire({
                        icon: 'success',
                        title: 'Bienvenido',
                        text: `Hola ${response.user.nombre}`,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    // Redirigir al menú
                    this.router.navigate(['/menu']);

                } else {
                    this.errorMessage = 'DNI o contraseña incorrectos.';
                    this.resetForm();
                }
            },

            error: () => {
                this.errorMessage = 'DNI o contraseña inexistente.';
                this.resetForm();
            }
        });
    }


    //                    RESET FORM

    resetForm() {

        if (this.loginForm) {
            this.loginForm.resetForm({
                dni: '',
                password: ''
            });
        }

        this.dni = '';
        this.password = '';

        try {
            this.cdr.detectChanges();
        } catch { }
    }
}
