import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(): boolean {
        const rolUsuario = (this.authService.getRol() || '').trim().toLowerCase();


        if (rolUsuario === 'administrador') {

            return true;
        } else {

            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'Usuario no posee permisos para acceder a esta sección.',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                this.router.navigate(['/menu']);
            });
            return false;
        }
    }
}
