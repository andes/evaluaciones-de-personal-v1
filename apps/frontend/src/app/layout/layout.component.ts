
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
    constructor(private router: Router) { }

    get isLoginRoute(): boolean {
        return this.router.url.includes('/login');
    }

    toggleMenu(): void {
        const nav = document.getElementById('navmenu');
        if (nav) {
            nav.classList.toggle('open');
        }
    }
}