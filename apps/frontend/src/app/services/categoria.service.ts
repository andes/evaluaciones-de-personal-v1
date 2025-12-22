import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

export interface Categoria {
    _id?: string;
    descripcion: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private base = 'http://localhost:3000/api/comunes/categoriaitems';

    private apiUrl = `${this.base}/rmCategoriaItems`;
    private apiUrlPost = `${this.base}/rCategoriaItems`;

    constructor(private http: HttpClient) { }

    obtenerCategoriasOrdenadas(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(this.apiUrl).pipe(
            map(categorias => categorias.sort((a, b) => a.descripcion.localeCompare(b.descripcion)))
        );
    }

    eliminarCategoria(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrlPost}/${id}`);
    }

    guardarCategoria(categoria: Categoria): Observable<any> {
        return this.http.post(this.apiUrlPost, categoria);
    }

    obtenerCategoria(id: string): Observable<any> {
        return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
    }

    actualizarCategoria(_id: string, categoria: Categoria): Observable<any> {
        return this.http.put(`${this.apiUrlPost}/${_id}`, categoria);
    }

    verificarDescripcionUnica(nombre: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/verificar-descripcion/${nombre}`);
    }
}
