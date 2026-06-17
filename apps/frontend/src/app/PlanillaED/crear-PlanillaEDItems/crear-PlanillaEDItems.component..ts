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
        HeaderComponent
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
    items: any[] = [];

    categoriaSeleccionada = '';
    itemSeleccionado = '';
    idEvaluacion: string = '';
    idAgente: string = '';

    constructor(
        private route: ActivatedRoute,
        private _PlanillaEDService: PlanillaEDService,
        private _CategoryService: CategoryService,
        private router: Router
    ) { }
    ngOnInit(): void {

        // 1️⃣ Obtener ID de la planilla
        this.idPlanilla = this.route.snapshot.paramMap.get('id') ?? '';

        console.log('ID PLANILLA:', this.idPlanilla);

        if (!this.idPlanilla) {
            console.warn('⚠ No se recibió idPlanilla en la ruta');
            return;
        }

        // 2️⃣ Obtener query params
        this.route.queryParams.subscribe(params => {
            this.descripcionPlanilla = params['descripcion'] ?? '';
            this.efectorNombre = params['efector'] ?? '';
            this.servicioNombre = params['servicio'] ?? '';
        });

        // 3️⃣ Cargar datos
        this.cargarItems();
        this.cargarCategorias();
        this.cargarCategoriasDePlanilla();
    }

    cargarItems(): void {
        this._PlanillaEDService.obtenerItems().subscribe({
            next: (resp: any) => this.items = resp?.data ?? [],
            error: err => console.error('Error al cargar items:', err)
        });
    }

    cargarCategorias(): void {
        this._CategoryService.obtenerCategoriasOrdenadas().subscribe({
            next: (resp: any[]) => {
                console.log(resp);
                this.categorias = resp;
            },
            error: err => console.error('Error al cargar categorías:', err)
        });
    }
    cargarCategoriasDePlanilla(): void {

        this._PlanillaEDService.obtenerCategoriasPorPlanilla(this.idPlanilla).subscribe({
            next: (resp: any) => {

                console.log('RESPUESTA obtenerCategoriasPorPlanilla:', resp);

                this.categoriasPlanilla = resp?.data?.categorias ?? [];
            },
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
            next: (response: any) => {

                console.log('RESPUESTA existsItemInPlanilla:', response);

                if (response?.exists) {
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
                        {
                            idItem: item._id,
                            descripcion: item.descripcion,
                            valor: item.valor
                        }
                    ]
                };

                console.log('ENVIANDO A agregarCategoriaItems:', categoriaConItems);

                this._PlanillaEDService.agregarCategoriaItems(this.idPlanilla, categoriaConItems).subscribe({
                    next: (resp: any) => {

                        console.log('RESPUESTA agregarCategoriaItems:', resp);

                        // 🔎 Solo mostramos éxito si realmente el backend confirma éxito
                        if (resp?.success === false) {
                            return Swal.fire({
                                icon: 'error',
                                title: 'Error lógico',
                                text: resp?.message || 'El backend no guardó correctamente.'
                            });
                        }

                        this.cargarCategoriasDePlanilla();

                        Swal.fire({
                            icon: 'success',
                            title: 'Guardado con éxito',
                            text: 'Categoría e ítems guardados correctamente.'
                        });
                    },
                    error: err => {
                        console.error('Error al guardar categoría/items:', err);
                        Swal.fire('Error', 'No se pudo guardar la categoría e ítems.', 'error');
                    }
                });
            },
            error: err => {
                console.error('Error al verificar ítem:', err);
                Swal.fire('Error', 'Ocurrió un error al verificar el ítem.', 'error');
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

    volver(): void {
        this.router.navigate(['/planillaed']);
    }
}