import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ServiciosService {

    private apiUrl = 'http://localhost:3000/api/comunes/servicios';

    constructor(private http: HttpClient) { }


    getServicios(): Observable<any> {
        return this.http.get(`${this.apiUrl}/rmServicios`);
    }


    getServicioPorId(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/rmServicios/${id}`);
    }


    crearServicio(servicio: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/rmServicios`, servicio);
    }


    actualizarServicio(id: string, servicio: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/rmServicios/${id}`, servicio);
    }

    eliminarServicio(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/rsServicios/${id}`);
    }
}
