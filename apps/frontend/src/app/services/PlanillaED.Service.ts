import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

const Swal = require('sweetalert2');



export interface IPlanillaED extends Document {
    fechaCreacion: Date;
    idEfector: string;
    descripcion: string;
    idServicio: string;
}

export interface Categoria {
    _id: string;
    descripcion: string;
}


@Injectable({
    providedIn: 'root'
})
export class PlanillaEDService {

    private baseUrl = 'http://localhost:3000/api';
    constructor(private http: HttpClient) { }

    getPlanillasED(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/planillasED`);
    }

    obtenerEfectores(): Observable<any[]> {

        return this.http.get<any[]>('http://localhost:3000/api/rmEfectores');
    }

    obtenerServicios(): Observable<any[]> {
        return this.http.get<any[]>('http://localhost:3000/api/rmServicios');
    }

    obtenerServicioPorId(id: string): Observable<any> {
        return this.http.get<any>(`http://localhost:3000/api/rmServicios/${id}`);
    }


    obtenerEfectorPorId(id: string): Observable<any> {
        return this.http.get<any>(`http://localhost:3000/api/efectores/${id}`);
    }

    obtenerEfectorPorIdE(id: string): Observable<any> {
        return this.http.get<any>(`http://localhost:3000/api/rmEfectores/${id}`);
    }


    // planillaED.service.ts
    obtenerServicioPorIdE(id: string): Observable<any> {

        return this.http.get<any>(`http://localhost:3000/api/rmServicios/${id}`);
    }


    eliminaPlanillaEDid(id: string): Observable<any> {
        return this.http.delete<any>(`http://localhost:3000/api/planillasED/${id}`);
    }


    obtenerCategorias(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/categorias`);
    }


    guardarPlanillaED(planilla: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/planillasED`, planilla).pipe(
            catchError((error) => {
                if (error.status === 400) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Atención',
                        text: 'Ya existe una planilla con este Efector y Servicio.',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al guardar la planilla.',
                        confirmButtonText: 'Cerrar'
                    });
                }
                return throwError(() => error);
            })
        );
    }

    obtenerCategoriasOrdenadas(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`).pipe(  // Reemplazado para que sea más específico
            map(categorias => categorias.sort((a, b) => a.descripcion.localeCompare(b.descripcion)))
        );
    }

    obtenerItems(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/comunes/items/rEvaDesemp`).pipe(
            catchError((error) => {
                console.error('Error al obtener los items:', error);
                return throwError(error);
            })
        );
    }


    actualizarPlanilla(idPlanilla: string, categoria: any): Observable<any> {

        return this.http.put(`${this.baseUrl}/planillasED/${idPlanilla}`, { categoria })
            .pipe(
                catchError((error) => {
                    console.error('Error al actualizar la planilla:', error);
                    return throwError(error);
                })
            );
    }
    //agregar items nuevo a la planilla con categoria y itemsy id evaluacion solicitada
    agregarCategoriaItems(planillaId: string, categoriaConItems: any): Observable<any> {
        const url = `${this.baseUrl}/planillasED/${planillaId}/categorias`;


        return this.http.put(url, categoriaConItems).pipe(
            catchError((error) => {
                console.error('Error al agregar categoría e ítems:', error);
                return throwError(error);
            })
        );
    }


    obtenerCategoriasPorPlanilla(planillaId: string): Observable<any> {
        const url = `${this.baseUrl}/planillasED/${planillaId}/categorias`;
        return this.http.get<any>(url);
    }



    //items duplicado en planilla
    existsItemInPlanilla(planillaId: string, itemDesc: string): Observable<{ exists: boolean }> {

        const url = `${this.baseUrl}/planillasED/${planillaId}/items/existe?itemDesc=${encodeURIComponent(itemDesc)}`;
        return this.http.get<{ exists: boolean }>(url).pipe(
            catchError((error) => {
                console.error('Error al verificar existencia del ítem:', error);
                return throwError(error);
            })
        );
    }

    eliminarItem(idDocumento: string, descripcionItem: string): Observable<any> {
        const url = `${this.baseUrl}/eliminar-item`;
        return this.http.request('delete', url, { body: { idDocumento, descripcionItem } });
    }

    //obtener planilla por id para listado 

    getPlanillaEDById(id: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/planillasED/${id}`).pipe(
            catchError((error) => {
                console.error('Error al obtener la planilla por ID:', error);
                return throwError(error);
            })
        );
    }

    //crear cabecera 
    crearCabecera(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/evaluacioncabecera`, data).pipe(
            catchError((error) => {
                console.error('Error al guardar cabecera:', error);
                return throwError(error);
            })
        );
    }

    crearCabeceraEvaluacion(cabecera: any) {
        return this.http.post('http://localhost:3000/api/planillaed', cabecera);
    }

    getPlanillaPorEfectorYServicio(idEfector: string, idServicio: string): Observable<any> {
        const params = new HttpParams()
            .set('idEfector', idEfector)
            .set('idServicio', idServicio);

        return this.http.get(`${this.baseUrl}/planillasED/buscar-por-efector-servicio`, { params });
    }
    getPlanillaPorTipoEvaluacion(idTipoEvaluacion: string): Observable<any> {
        const url = `${this.baseUrl}/planillasED/buscar-por-tipo-evaluacion/${idTipoEvaluacion}`;
        return this.http.get<any>(url).pipe(
            catchError((error) => {
                console.error('Error al buscar planilla por tipoEvaluacion', error);
                return throwError(error);
            })
        );
    }

    // Método para obtener los ítems de una categoría específica de una planilla
    obtenerItemsPorPlanillaYCategoria(planillaId: string, categoriaId: string): Observable<any> {
        const url = `${this.baseUrl}/planillasED/${planillaId}/categorias/${categoriaId}/items`;
        return this.http.get<any>(url).pipe(
            catchError((error) => {
                console.error('Error al obtener los items por planilla y categoría:', error);
                return throwError(() => error);
            })
        );
    }




}