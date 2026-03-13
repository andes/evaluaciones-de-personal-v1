import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-header-sistema',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './header-sistema.component.html',
    styleUrls: ['./header-sistema.component.css']
})
export class HeaderSistemaComponent implements OnInit {

    nombreUsuario = '';
    rolUsuario = '';

    ngOnInit(): void {

        this.nombreUsuario = localStorage.getItem('nombreUsuario') || '';
        this.rolUsuario = localStorage.getItem('rolUsuario') || '';

    }

}