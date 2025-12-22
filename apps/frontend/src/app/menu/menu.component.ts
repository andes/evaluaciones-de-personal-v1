import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

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

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.nombreUsuario = this.authService.getNombre();
        this.rolUsuario = this.authService.getRol();


    }
}
