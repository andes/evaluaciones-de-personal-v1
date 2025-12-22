import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanillaEDService } from '../../services/PlanillaED.Service';
import { CategoryService } from '../../services/categoria.service';
import { HeaderComponent } from '../../header/header.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const Swal = require('sweetalert2').default;

@Component({
    selector: 'app-crear-planilla-ed-items',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,   // ✔ ya funciona si es standalone
    ],
    templateUrl: './crear-PlanillaEDItems.component.html',
    styleUrls: ['./crear-PlanillaEDItems.component.css']
})
export class CrearPlanillaEDItemsComponent implements OnInit {

    idPlanilla = '';
    descripcionPlanilla = '';
    efectorNombre = '';
    servicioNombre = '';
    categorias: any[] = [];
    categoriasPlanilla: any[] = [];
    categoriaSeleccionada = '';
    items: any[] = [];
    itemSeleccionado = '';

    constructor(
        private route: ActivatedRoute,
        private _PlanillaEDService: PlanillaEDService,
        private _CategoryService: CategoryService,
        private router: Router
    ) { }

    ngOnInit(): void {

        // Primero obtenemos el ID desde la ruta (/crearplanillaItems/:id)
        this.route.paramMap.subscribe(paramMap => {
            this.idPlanilla = paramMap.get('id') ?? '';



            if (!this.idPlanilla) {
                console.warn("⚠ No se recibió idPlanilla en paramMap");
            }
        });

        // Luego obtenemos los datos adicionales por queryParams
        this.route.queryParams.subscribe(params => {
            this.descripcionPlanilla = params['descripcion'];
            this.efectorNombre = params['efector'];
            this.servicioNombre = params['servicio'];

            this.cargarItems();
            this.cargarCategorias();
            this.cargarCategoriasDePlanilla();
        });

    }


    cargarItems(): void {
        this._PlanillaEDService.obtenerItems().subscribe({
            next: items => this.items = items,
            error: err => console.error('Error al cargar items:', err)
        });
    }

    cargarCategorias(): void {
        this._CategoryService.obtenerCategoriasOrdenadas().subscribe({
            next: categorias => this.categorias = categorias,
            error: err => console.error('Error al cargar categorías:', err)
        });
    }

    cargarCategoriasDePlanilla(): void {
        if (!this.idPlanilla) return;

        this._PlanillaEDService.obtenerCategoriasPorPlanilla(this.idPlanilla).subscribe({
            next: data => this.categoriasPlanilla = data.categorias,
            error: err => console.error('Error al cargar categorías de la planilla:', err)
        });
    }


    aceptarSeleccion(): void {

        if (!this.categoriaSeleccionada || !this.itemSeleccionado) {
            return Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Selecciona categoría e ítem antes de continuar.',
            });
        }

        const categoria = this.categorias.find(c => c._id === this.categoriaSeleccionada);
        const item = this.items.find(i => i._id === this.itemSeleccionado);

        if (!categoria || !item) {
            return Swal.fire({
                icon: 'error',
                title: 'Selección inválida',
                text: 'No se encontró la categoría o el ítem.',
            });
        }

        this._PlanillaEDService.existsItemInPlanilla(this.idPlanilla, item.descripcion).subscribe({
            next: response => {

                if (response.exists) {
                    return Swal.fire({
                        icon: 'warning',
                        title: 'Ítem duplicado',
                        text: 'El ítem ya existe en la planilla.'
                    });
                }

                const categoriaConItems = {
                    categoria: categoria._id,
                    descripcionCategoria: categoria.descripcion,
                    items: [
                        { idItem: item._id, descripcion: item.descripcion, valor: item.valor }
                    ]
                };

                this._PlanillaEDService.agregarCategoriaItems(this.idPlanilla, categoriaConItems).subscribe({
                    next: () => {
                        this.cargarCategoriasDePlanilla();
                        Swal.fire({
                            icon: 'success',
                            title: 'Guardado con éxito',
                            text: 'Categoría e ítems guardados correctamente.'
                        });
                    },
                    error: err => {
                        console.error('Error al guardar categoría/items:', err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo guardar la categoría e ítems.'
                        });
                    }
                });
            },
            error: err => {
                console.error('Error al verificar ítem:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al verificar la existencia del ítem.'
                });
            }
        });
    }
    navegarADetalle(categoriaId: string, descripcionCategoria: string): void {


        this.router.navigate([`/crearplanillaItemsDetalle/${this.idPlanilla}`], {
            queryParams: {
                categoriaId,
                descripcionCategoria,
                descripcion: this.descripcionPlanilla
            }
        });
    }


    onPlanillaEDClick(): void {
        this.router.navigate(['/listar-planillaEDRouter']);
    }
    volver() {
        this.router.navigate(['/planillaed']);
    }
}
