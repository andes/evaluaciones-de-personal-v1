import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/auth';
    //  private apiUrl = 'http://localhost:3000/api';


    constructor(private http: HttpClient) { }

    //  LOGIN
    login(dni: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { dni, password });
    }

    register(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, user);
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    getUserById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${id}`);
    }

    updateUser(id: string, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/${id}`, user);
    }

    //servicio por  usuario y rol
    updateServicios(
        id: string,
        servicios: { idServicio: string; descripcion: string }[]
    ): Observable<any> {

        return this.http.put<any>(
            `http://localhost:3000/api/users/${id}/servicios`,
            { servicios }
        );
    }
    deleteUser(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
    }
}