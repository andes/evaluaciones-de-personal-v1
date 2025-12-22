import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoEvaluacion {
    _id?: string;
    nombre: string;
    descripcion?: string;
}

@Injectable({
    providedIn: 'root',
})
export class TipoEvaluacionService {
    private apiUrl = 'http://localhost:3000/api/tipoevaluacion';

    constructor(private http: HttpClient) { }

    obtenerTipos(): Observable<TipoEvaluacion[]> {
        return this.http.get<TipoEvaluacion[]>(this.apiUrl);
    }

    obtenerTipo(id: string): Observable<TipoEvaluacion> {
        return this.http.get<TipoEvaluacion>(`${this.apiUrl}/${id}`);
    }

    crearTipo(tipo: TipoEvaluacion): Observable<TipoEvaluacion> {
        return this.http.post<TipoEvaluacion>(this.apiUrl, tipo);
    }

    actualizarTipo(id: string, tipo: TipoEvaluacion): Observable<TipoEvaluacion> {
        return this.http.put<TipoEvaluacion>(`${this.apiUrl}/${id}`, tipo);
    }

    eliminarTipo(id: string): Observable<{ mensaje: string }> {
        return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
    }


}
