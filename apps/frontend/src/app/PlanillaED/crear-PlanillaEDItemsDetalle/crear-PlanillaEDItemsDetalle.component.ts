import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanillaEDService } from '../../services/PlanillaED.Service';
import { ItemsService } from '../../services/items.service';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';

const Swal = require('sweetalert2').default;

@Component({
    selector: 'app-crear-planilla-ed-items-detalle',
    standalone: true,
    templateUrl: './crear-PlanillaEDItemsDetalle.component.html',
    styleUrls: ['./crear-PlanillaEDItemsDetalle.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
    ]
})
export class CrearPlanillaEDItemsDetalleComponent implements OnInit {

    planillaId = '';
    descripcionPlanilla = '';
    descripcionCategoria = '';
    categoriaId = '';
    items: any[] = [];
    todosLosItems: any[] = [];
    itemSeleccionado = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private planillaEDService: PlanillaEDService,
        private itemsService: ItemsService
    ) { }

    ngOnInit(): void {
        combineLatest([
            this.route.paramMap,
            this.route.queryParams
        ]).subscribe(([paramMap, queryParams]) => {
            this.planillaId = paramMap.get('id') ?? '';
            this.categoriaId = queryParams['categoriaId'] ?? '';
            this.descripcionPlanilla = queryParams['descripcion'] ?? '';
            this.descripcionCategoria = queryParams['descripcionCategoria'] ?? '';



            this.cargarItems();
            this.cargarTodosLosItems();
        });
    }


    cargarItems(): void {
        if (!this.planillaId || !this.categoriaId) return;

        this.planillaEDService.obtenerItemsPorPlanillaYCategoria(this.planillaId, this.categoriaId)
            .subscribe({
                next: (resp: any) => {
                    this.items = resp.items ?? [];
                },
                error: err => console.error('Error al cargar los ítems de la planilla:', err)
            });
    }


    cargarTodosLosItems(): void {
        this.itemsService.getItems().subscribe({
            next: (resp: any) => {

                this.todosLosItems = Array.isArray(resp) ? resp : (resp.items ?? []);
            },
            error: err => console.error('Error al cargar ítems desde ItemsService:', err)
        });

    }



    agregarNuevoItem(): void {
        if (!this.itemSeleccionado) return;

        const item = this.todosLosItems.find(i => i._id === this.itemSeleccionado);
        if (!item) return;

        this.planillaEDService.existsItemInPlanilla(this.planillaId, item.descripcion).subscribe({
            next: response => {
                if (response.exists) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Ítem duplicado',
                        text: 'El ítem ya existe en la planilla.'
                    });
                    return;
                }

                const categoriaConItems = {
                    categoria: this.categoriaId,
                    descripcionCategoria: this.descripcionCategoria,
                    items: [{ idItem: item._id, descripcion: item.descripcion, valor: item.valor }]
                };

                this.planillaEDService.agregarCategoriaItems(this.planillaId, categoriaConItems).subscribe({
                    next: () => this.cargarItems(),
                    error: err => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el ítem.' })
                });
            },
            error: err => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al verificar ítem.' })
        });
    }

    eliminarItem(item: any): void {
        if (!item?.descripcion) return;

        this.planillaEDService.eliminarItem(this.planillaId, item.descripcion).subscribe({
            next: () => this.cargarItems(),
            error: err => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el ítem.' })
        });
    }

    onPlanillaEDClick(): void {
        this.router.navigate(['/listar-planillaEDRouter']);
    }
}
