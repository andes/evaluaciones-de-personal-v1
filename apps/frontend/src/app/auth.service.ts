import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    dni?: string;
    nombre?: string;
    email?: string;
    rol?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api';
    private tokenKey = 'token';
    private loggedInSubject = new BehaviorSubject<boolean>(false);
    public authStatus = this.loggedInSubject.asObservable();

    private usuario: any = {};

    constructor(private http: HttpClient, private router: Router) {
        this.setLoggedIn(!!this.token);
        this.decodeStoredToken();
    }

    // 🔹 Login
    login(dni: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { dni, password });
    }

    // 🔹 Guardar token + usuario
    guardarToken(token: string, usuario: any) {

        // Asegurarse que tenga _id
        const usuarioGuardado = {
            ...usuario,
            _id: usuario.id || usuario._id // toma el id que venga del backend
        };

        // Guardar en localStorage
        localStorage.setItem('usuario', JSON.stringify(usuarioGuardado));

        // Guardar token
        localStorage.setItem(this.tokenKey, token);

        // Loguear
        this.decodeToken(token);
        this.setLoggedIn(true);

        // Opcional para UI
        if (usuario.nombre) localStorage.setItem('nombreUsuario', usuario.nombre);
        if (usuario.rol) localStorage.setItem('rolUsuario', usuario.rol);

        // Actualizar this.usuario
        this.usuario = usuarioGuardado;
    }


    // 🔹 Logout
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('usuario');
        localStorage.removeItem('nombreUsuario');
        localStorage.removeItem('rolUsuario');
        localStorage.removeItem('usuarioId');

        this.usuario = {};
        this.setLoggedIn(false);

        this.router.navigate(['/login']);
    }

    get token(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    get isAuthenticated(): boolean {
        return !!this.token;
    }

    private setLoggedIn(status: boolean) {
        this.loggedInSubject.next(status);
    }

    // 🔹 Decodificar token
    private decodeToken(token: string) {
        try {
            const decoded = jwtDecode(token) as DecodedToken;

            // NO pisamos el id
            this.usuario = {
                ...this.usuario, // <-- mantiene el _id guardado en localStorage
                dni: decoded.dni,
                nombre: decoded.nombre,
                email: decoded.email,
                rol: decoded.rol
            };

        } catch (error) {
            console.error('❌ Error al decodificar token:', error);
            this.usuario = {};
        }
    }

    // 🔹 Decodificar token guardado
    private decodeStoredToken() {
        const token = this.token;
        const data = localStorage.getItem('usuario');

        if (data) {
            this.usuario = JSON.parse(data);
        }

        if (token) {
            this.decodeToken(token);
        }
    }

    // 🔹 Getters
    getDni(): string {
        return this.usuario?.dni || '';
    }

    getNombre(): string {
        return this.usuario?.nombre || '';
    }

    getEmail(): string {
        return this.usuario?.email || '';
    }

    getRol(): string {
        return this.usuario?.rol || '';
    }

    getId(): string | null {
        return this.usuario?._id || this.usuario?.id || null;
    }

}
