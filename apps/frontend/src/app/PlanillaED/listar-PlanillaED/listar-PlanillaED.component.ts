import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanillaEDService } from "../../services/PlanillaED.Service";
import { jsPDF } from 'jspdf';
import { AuthService } from '../../auth.service';
const Swal = require('sweetalert2').default;
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-listar-planilla-ed',
    standalone: true,
    templateUrl: './listar-PlanillaED.component.html',
    styleUrls: ['./listar-PlanillaED.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent
    ]
})
export class ListarPlanillaEDComponent implements OnInit {
    public listPlanillaED: any[] = [];
    public filterPlanillaED: any[] = [];
    public searchTerm: string = '';
    usuarioActual: any = null;
    rolUsuario: string = '';

    constructor(
        private _PlanillaEDService: PlanillaEDService,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // 🔹 1. Cargar usuario actual
        this.usuarioActual = {
            id: this.authService.getDni(), // DNI como ID
            nombre: this.authService.getNombre(),
            rol: this.authService.getRol(),
            idefector: null,
            idservicio: null
        };

        // 🔹 Guardar rol del usuario
        this.rolUsuario = this.usuarioActual?.rol ?? '';

        // 🔹 2. Validar si el usuario es "Agente"
        if (this.rolUsuario === 'Agente') {
            Swal.fire({
                title: 'Acceso denegado',
                text: 'El rol "Agente" no puede ingresar a este módulo.',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                this.router.navigate(['/home']); // Redirige al home
            });

            return; // Detiene ngOnInit
        }

        // 3. Si pasa validación, continuar


        this.obtenerPlanillaED(); // ← llamada a tu método original
    }
    obtenerPlanillaED() {
        this._PlanillaEDService.getPlanillasED().subscribe(
            (data: any[]) => {
                this.listPlanillaED = data;
                this.filterPlanillaED = data;
            },
            (error) => {
                console.error('Error al obtener las planillas:', error);
            }
        );
    }
    crearplanillaED() {
        this.router.navigate(['/crearplanillaED']);
    }

    crearNuevoPlanillaEDM() {
        this.router.navigate(['crear-planillaEDRouter']);
    }

    public onPlanillaEDClick(): void {
        this.router.navigate(['/listar-planillaEDRouter']);
    }

    eliminarPlanilla(planillaId: string) {
        if (confirm('¿Estás seguro de que deseas eliminar esta planilla?')) {
            this._PlanillaEDService.eliminaPlanillaEDid(planillaId).subscribe(
                () => {

                    this.obtenerPlanillaED(); // Vuelve a cargar la lista de planillas
                },
                (error) => {
                    console.error('Error al eliminar la planilla:', error);
                }
            );
        }// 🔙 redirige a Home al presionar Aceptar
    }



    /**
     * Método que se llama al presionar el botón "Listar".
     * Consulta la planilla por ID y genera un PDF con sus datos.
     */
    public ListarrPlanillaED(planillaId: string): void {
        this._PlanillaEDService.getPlanillaEDById(planillaId).subscribe({
            next: (data) => {
                this.generarPDF(data);
            },
            error: (error) => {
                console.error('Error al obtener la planilla para generar PDF:', error);
            }
        });
    }

    private generarPDF(planilla: any): void {
        const doc = new jsPDF();
        let yPos = 10; // Posición vertical inicial

        // Título
        doc.setFontSize(16);
        const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
        doc.text('Planilla Evaluacion de Desempe ño', pageWidth / 2, yPos, { align: 'center' });

        yPos += 10;
        doc.setFontSize(12);
        yPos += 10;

        // Fecha Creación
        doc.setFont("Helvetica", "bold");
        const labelFecha = "Fecha Creación: ";
        doc.text(labelFecha, 10, yPos);
        const anchoLabelFecha = doc.getTextWidth(labelFecha);
        doc.setFont("Helvetica", "normal");

        // Formatear la fecha como dd-mm-yyyy
        const fechaValor = new Date(planilla.fechaCreacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-'); // Reemplaza las barras por guiones

        doc.text(fechaValor, 10 + anchoLabelFecha, yPos);
        yPos += 10;

        // Datos de Efector
        if (planilla.idEfector && planilla.idEfector.nombre) {
            doc.setFont("Helvetica", "bold");
            const labelEfector = "Efector: ";
            doc.text(labelEfector, 10, yPos);
            const anchoLabelEfector = doc.getTextWidth(labelEfector);
            doc.setFont("Helvetica", "normal");
            doc.text(planilla.idEfector.nombre, 10 + anchoLabelEfector, yPos);
            yPos += 10;
        }

        // Datos de Servicio
        if (planilla.idServicio && planilla.idServicio.nombre) {
            doc.setFont("Helvetica", "bold");
            const labelServicio = "Servicio: ";
            doc.text(labelServicio, 10, yPos);
            const anchoLabelServicio = doc.getTextWidth(labelServicio);
            doc.setFont("Helvetica", "normal");
            doc.text(planilla.idServicio.nombre, 10 + anchoLabelServicio, yPos);
            yPos += 10;
        }

        // Mostrar categorías e ítems
        if (planilla.categorias && Array.isArray(planilla.categorias)) {
            planilla.categorias.forEach((cat, index) => {
                // Espacio arriba de la categoría
                yPos += 10;

                // Obtener la descripción de la categoría (o valor por defecto)
                const categoriaDesc = cat.categoria ? cat.categoria.descripcion : 'Sin descripción';
                const textoCategoria = `${index + 1} ${categoriaDesc}`;

                // Configurar la fuente en negrita para la categoría
                doc.setFont("Helvetica", "bold");

                // Calcular la posición centrada del texto
                const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
                const textWidth = doc.getTextWidth(textoCategoria);
                const xCenter = (pageWidth - textWidth) / 2;

                // Dibujar el texto centrad
                doc.text(textoCategoria, xCenter, yPos);

                // Dibujar un recuadro que ocupe todo el ancho de la línea (dejando márgenes)
                const leftMargin = 10;
                const boxWidth = pageWidth - leftMargin * 2;
                // Ajustar rectY y rectHeight según el tamaño de la fuente y preferencia de diseño
                const rectY = yPos - 10;
                const rectHeight = 14;
                doc.rect(leftMargin, rectY, boxWidth, rectHeight, "S");

                yPos += 20; // Espacio adicional después del título de la categoría

                // Listar los ítems dentro de la categoría
                if (cat.items && Array.isArray(cat.items)) {
                    cat.items.forEach((item, i) => {
                        // Configurar la fuente normal para los ítems
                        doc.setFont("Helvetica", "normal");

                        // Preparar el texto del ítem
                        const textoItem = ` ${i + 1} ${item.descripcion}`;
                        // Definir el ancho máximo disponible (usando leftMargin para los márgenes)
                        const maxWidth = pageWidth - leftMargin * 2;

                        // Dividir el texto en líneas que se ajusten al ancho máximo
                        const lineas = doc.splitTextToSize(textoItem, maxWidth);

                        // Imprimir cada línea en un renglón consecutivo
                        lineas.forEach(linea => {
                            doc.text(linea, leftMargin, yPos);
                            yPos += 10; // Ajusta este valor según la altura de línea deseada
                        });
                    });
                }
            });
        }
        const nombreReporte = "Planilla Detallada";
        const totalPages = doc.getNumberOfPages(); // Obtener el número de páginas correctamente

        // Agregar pie de página y línea divisora en cada página
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i); // Establecer la página actual
            doc.setFontSize(10);

            // Obtener ancho y alto de la página
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            // Dibujar línea divisora (margen izquierdo 10px, margen derecho 10px)
            doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);

            // Texto centrado en el pie de página
            doc.text(`${nombreReporte} - Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }


        // Guarda o muestra el PDF
        // doc.save(`planilla_${planilla._id}.pdf`);
        doc.output('dataurlnewwindow');
    }
    volver(): void {
        this.router.navigate(['/menu']);
    }
}