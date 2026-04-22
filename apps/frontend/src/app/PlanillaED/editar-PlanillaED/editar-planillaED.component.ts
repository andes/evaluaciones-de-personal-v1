import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanillaEDService } from '../../services/PlanillaED.Service';
import { CategoryService } from '../../services/categoria.service';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';

const Swal = require('sweetalert2').default;

@Component({
    selector: 'app-editar-planilla-ed',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        HeaderSistemaComponent,
    ],
    templateUrl: './editar-planillaED.component.html',
    styleUrls: ['./editar-planillaED.component.css']
})
export class EditarPlanillaEDComponent implements OnInit {

    // 🔹 Datos principales
    idPlanilla: string = '';
    descripcionPlanilla: string = '';

    // 🔹 Listas
    categorias: any[] = [];
    categoriasPlanilla: any[] = [];
    items: any[] = [];

    // 🔹 Selecciones
    categoriaSeleccionada: string = '';
    itemSeleccionado: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private planillaService: PlanillaEDService,
        private categoriaService: CategoryService
    ) { }

    ngOnInit(): void {
        // 🔹 Obtener ID desde la URL
        this.idPlanilla = this.route.snapshot.paramMap.get('id') || '';

        if (!this.idPlanilla) {
            console.warn('⚠ No se recibió idPlanilla');
            return;
        }

        // 🔹 Obtener descripción por queryParams
        this.planillaService.getPlanillaEDById(this.idPlanilla).subscribe({
            next: (planilla) => {
                console.log('Planilla recibida:', planilla);

                this.descripcionPlanilla = planilla.data.descripcion;
            },
            error: (err) => {
                console.error('Error al traer planilla:', err);
            }
        });

        // 🔹 Cargar datos
        this.cargarDatos();
    }

    cargarDatos(): void {

        // 🔹 Items
        this.planillaService.obtenerItems().subscribe({
            next: (resp: any) => {
                this.items = resp?.data || [];
            },
            error: (err) => {
                console.error('Error cargando items:', err);
            }
        });

        // 🔹 Categorías
        this.categoriaService.obtenerCategoriasOrdenadas().subscribe({
            next: (resp: any[]) => {
                this.categorias = resp;
            },
            error: (err) => {
                console.error('Error cargando categorías:', err);
            }
        });

        // 🔹 Categorías de la planilla
        this.planillaService.obtenerCategoriasPorPlanilla(this.idPlanilla).subscribe({
            next: (resp: any) => {
                this.categoriasPlanilla = resp?.data?.categorias || [];
            },
            error: (err) => {
                console.error('Error cargando categorías de planilla:', err);
            }
        });
    }

    aceptarSeleccion(): void {

        // 🔹 Validación básica
        if (!this.categoriaSeleccionada || !this.itemSeleccionado) {
            return Swal.fire('Atención', 'Seleccioná categoría e ítem', 'warning');
        }

        const categoria = this.categorias.find(c => c._id === this.categoriaSeleccionada);
        const item = this.items.find(i => i._id === this.itemSeleccionado);

        if (!categoria || !item) {
            return Swal.fire('Error', 'Selección inválida', 'error');
        }

        // 🔹 Armar objeto
        const data = {
            categoria: categoria._id,
            descripcionCategoria: categoria.descripcion,
            items: [
                {
                    idItem: item._id,
                    descripcion: item.descripcion,
                    valor: item.valor
                }
            ]
        };

        // 🔹 Guardar
        this.planillaService.agregarCategoriaItems(this.idPlanilla, data).subscribe({
            next: () => {
                this.cargarDatos();

                // 🔹 Limpiar selección
                this.categoriaSeleccionada = '';
                this.itemSeleccionado = '';

                Swal.fire('OK', 'Ítem agregado correctamente', 'success');
            },
            error: (err) => {
                console.error('Error guardando:', err);
                Swal.fire('Error', 'No se pudo guardar el ítem', 'error');
            }
        });
    }

    navegarADetalle(categoriaId: string, descripcionCategoria: string): void {
        this.router.navigate([`/editarplanillaItemsDetalle/${this.idPlanilla}`], {
            queryParams: {
                categoriaId,
                descripcionCategoria,
                descripcion: this.descripcionPlanilla
            }
        });
    }

    volver(): void {
        this.router.navigate(['/listar-planillaED']);
    }
}