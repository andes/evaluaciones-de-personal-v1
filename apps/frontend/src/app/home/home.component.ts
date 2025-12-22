import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {

    // 💡 Si más adelante querés mostrar ayudas, modales o tips
    ayuda = true;

    // 🧭 Menú principal (por si querés hacerlo dinámico más adelante)
    menuList = [
        { label: 'Home', route: '/home', active: true },
        { label: 'Acerca de', route: '/acercade' },
        { label: 'Clientes', route: '/clientes' },
        { label: 'Servicios', route: '/servicios' },
        { label: 'Login', route: '/login' },
        { label: 'Contacto', route: '/contact' }
    ];

    // ✨ Variable opcional para animaciones o interacciones
    animationClass = '';

    // 🔹 Método para cambiar la animación o el estado activo
    setAnimation(anim: string) {
        this.animationClass = anim;
    }
}
