import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import Swal from 'sweetalert2';

import { ItemsService, Items } from '../../services/items.service';

@Component({
    selector: 'app-items',
    standalone: true,
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,


        NgIf,
        NgFor
    ]
})
export class ItemsComponent implements OnInit {

    items: Items[] = [];
    mostrarModal = false;
    editando = false;

    itemActual: Items = { descripcion: '', valor: 0 };

    constructor(
        private itemsService: ItemsService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarItems();
    }

    cargarItems(): void {
        this.itemsService.getItems().subscribe({
            next: (data) => this.items = data,
            error: () => Swal.fire('Error', 'No se pudieron cargar los ítems', 'error')
        });
    }

    abrirModalNuevo(): void {
        this.editando = false;
        this.itemActual = { descripcion: '', valor: 0 };
        this.mostrarModal = true;
    }

    abrirModalEditar(item: Items): void {
        this.editando = true;
        this.itemActual = { ...item };
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarItem(): void {
        if (!this.itemActual.descripcion.trim()) {
            Swal.fire('⚠️ Atención', 'La descripción es obligatoria', 'warning');
            return;
        }

        if (this.editando && this.itemActual._id) {
            this.itemsService.updateItem(this.itemActual._id, this.itemActual).subscribe({
                next: () => {
                    Swal.fire('Ítem actualizado', 'success');
                    this.cargarItems();
                    this.cerrarModal();
                },
                error: () => Swal.fire('Error', 'No se pudo actualizar el ítem', 'error')
            });
        } else {
            this.itemsService.createItem(this.itemActual).subscribe({
                next: () => {
                    Swal.fire('Ítem creado', 'success');
                    this.cargarItems();
                    this.cerrarModal();
                },
                error: () => Swal.fire(' Error', 'No se pudo crear el ítem', 'error')
            });
        }
    }

    eliminarItem(id?: string): void {
        if (!id) return;

        Swal.fire({
            title: '¿Eliminar ítem?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((r) => {
            if (r.isConfirmed) {
                this.itemsService.deleteItem(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Ítem eliminado', 'success');
                        this.cargarItems();
                    },
                    error: () => Swal.fire(' Error', 'No se pudo eliminar', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
