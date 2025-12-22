import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService, Categoria } from '../../services/categoria.service';
import { HeaderComponent } from '../../header/header.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-categoria',
    standalone: true,
    templateUrl: './categoria.component.html',
    styleUrls: ['./categoria.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class CategoriaComponent implements OnInit {

    categorias: Categoria[] = [];
    mostrarModal = false;
    esEdicion = false;

    categoriaSeleccionada: any = null;

    nuevaCategoria = {
        descripcion: ''
    };

    constructor(
        private categoryService: CategoryService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarCategorias();
    }

    cargarCategorias(): void {
        this.categoryService.obtenerCategoriasOrdenadas().subscribe({
            next: (data) => this.categorias = data,
            error: () => Swal.fire(' Error', 'No se pudieron cargar las categorías', 'error')
        });
    }

    abrirModal(categoria?: Categoria): void {
        if (categoria) {
            this.esEdicion = true;
            this.categoriaSeleccionada = categoria;
            this.nuevaCategoria.descripcion = categoria.descripcion;
        } else {
            this.esEdicion = false;
            this.categoriaSeleccionada = null;
            this.nuevaCategoria.descripcion = '';
        }

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarCategoria(): void {

        if (this.esEdicion && this.categoriaSeleccionada) {
            this.categoryService.actualizarCategoria(
                this.categoriaSeleccionada._id,
                this.nuevaCategoria
            ).subscribe({
                next: () => {
                    Swal.fire(' Éxito', 'Categoría actualizada', 'success');
                    this.cargarCategorias();
                    this.cerrarModal();
                },
                error: () => Swal.fire(' Error', 'No se pudo actualizar', 'error')
            });
        } else {
            this.categoryService.guardarCategoria(this.nuevaCategoria).subscribe({
                next: () => {
                    Swal.fire(' Éxito', 'Categoría creada', 'success');
                    this.cargarCategorias();
                    this.cerrarModal();
                },
                error: () => Swal.fire('Error', 'No se pudo crear', 'error')
            });
        }
    }

    eliminarCategoria(id: string): void {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((r) => {
            if (r.isConfirmed) {
                this.categoryService.eliminarCategoria(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Categoría eliminada', 'success');
                        this.cargarCategorias();
                    },
                    error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
