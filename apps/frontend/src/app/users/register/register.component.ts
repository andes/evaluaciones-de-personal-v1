import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    username: string = '';
    legajo: string = '';
    password: string = '';
    errorMessage: string = '';

    onRegister() {
        if (this.username && this.legajo && this.password) {

            this.errorMessage = '';
        } else {
            this.errorMessage = 'Todos los campos son obligatorios.';

        }
    }
}
