import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Items {
    _id?: string;
    descripcion: string;
    valor: number;
}

@Injectable({
    providedIn: 'root'
})
export class ItemsService {

    // private apiUrl = 'http://localhost:3000/api/rmItems';
    private apiUrlUpdate = 'http://localhost:3000/api/rItems';
    private apiUrl = 'http://localhost:3000/api/comunes/items/rEvaDesemp';

    constructor(private http: HttpClient) { }

    // 🔹 Obtener todos los ítems
    getItems(): Observable<Items[]> {
        return this.http.get<Items[]>(this.apiUrl);
    }

    // 🔹 Crear ítem
    createItem(item: Items): Observable<Items> {
        return this.http.post<Items>(this.apiUrl, item);
    }

    // 🔹 Actualizar ítem
    updateItem(id: string, item: Items): Observable<Items> {
        return this.http.put<Items>(`${this.apiUrlUpdate}/${id}`, item);
    }

    // 🔹 Eliminar ítem
    deleteItem(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // (Opcional) obtener por id
    getItemById(id: string): Observable<Items> {
        return this.http.get<Items>(`${this.apiUrl}/${id}`);
    }
}
