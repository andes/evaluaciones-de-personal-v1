import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { LayoutComponent } from './layout/layout.component';
import { UserAbmComponent } from './user-abm/user-abm.component';
// import { NxWelcomeComponent } from ' from './nx-welcome.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,
    MenuComponent,
    LayoutComponent,
    UserAbmComponent,
    HomeComponent], // eliminamos NxWelcome
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';
}
