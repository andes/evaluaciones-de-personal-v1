import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';


interface OpcionMenu {
    texto: string;
    ruta: string;
}

interface BloqueMenu {
    titulo: string;
    icono: string;
    roles: string[];
    opciones: OpcionMenu[];
}

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

    nombreUsuario: string = '';
    rolUsuario: string = '';

    menuVisible: BloqueMenu[] = [];

    menuCompleto: BloqueMenu[] = [

        {
            titulo: 'Parámetros',
            icono: 'bi bi-gear-fill',
            roles: ['administrador'],
            opciones: [
                { texto: 'Usuarios', ruta: '/userabm' },
                { texto: 'Roles', ruta: '/roles' }
            ]
        },

        {
            titulo: 'Comunes',
            icono: 'bi bi-bar-chart-fill',
            roles: ['administrador'],
            opciones: [
                { texto: 'Categorías', ruta: '/categoria' },
                { texto: 'Ítems', ruta: '/items' },
                { texto: 'Tipo Evaluación', ruta: '/tipoEvaluacion' },
                { texto: 'Servicios', ruta: '/servicios' },
                //{ texto: 'Agentes', ruta: '/agentes' }
            ]
        },

        {
            titulo: 'Planilla Evaluación',
            icono: 'bi bi-card-checklist',
            roles: ['administrador', 'director'],
            opciones: [
                { texto: 'Agentes', ruta: '/agentes' },
                { texto: 'Planilla de Evaluación', ruta: '/planillaed' }
            ]
        },

        {
            titulo: 'Evaluación',
            icono: 'bi bi-clipboard-check',
            roles: ['administrador', 'director', 'evaluador'],
            opciones: [
                { texto: 'Crear Evaluaciones', ruta: '/evaluacion-cabecera' }
            ]
        },

        {
            titulo: 'Informes',
            icono: 'bi bi-file-earmark-bar-graph',
            roles: ['administrador', 'director', 'evaluador', 'usuario'],
            opciones: [
                { texto: 'Evaluaciones', ruta: '/evaluaciones-listado' },
                { texto: 'Promedios', ruta: '/promedios' }
            ]
        },

        {
            titulo: 'Acerca de',
            icono: 'bi bi-info-circle',
            roles: ['administrador', 'director', 'evaluador', 'usuario'],
            opciones: [
                { texto: 'Acerca de', ruta: '/acerca' }
            ]
        }

    ];

    constructor(private authService: AuthService) { }
    ngOnInit(): void {

        this.nombreUsuario = this.authService.getNombre();
        this.rolUsuario = this.authService.getRol();

        console.log('NOMBRE USUARIO:', this.nombreUsuario);
        console.log('ROL USUARIO:', this.rolUsuario);

        this.menuVisible = this.menuCompleto.filter(
            bloque => bloque.roles.includes(this.rolUsuario)
        );

        console.log('MENU FILTRADO:', this.menuVisible);

    }

}