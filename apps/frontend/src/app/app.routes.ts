import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './users/login/login.component';
import { MenuComponent } from './menu/menu.component';
import { UserAbmComponent } from './user-abm/user-abm.component';
import { AuthGuard } from './auth.guard';
import { CategoriaComponent } from './comunes/categoria/categoria.component';
import { ServiciosComponent } from './comunes/servicios/servicios.component';
import { ItemsComponent } from './comunes/items/items.component';
import { AgentesComponent } from './comunes/agentes/agentes.component';
import { TipoEvaluacionComponent } from './comunes/tipoevaluacion/tipoEvaluacion.component';
// import { TipoEvaluacionService } from './services/tipoevaluacion.service';
import { ListarPlanillaEDComponent } from './PlanillaED/listar-PlanillaED/listar-PlanillaED.component';
import { CrearPlanillaEDItemsDetalleComponent } from './PlanillaED/crear-PlanillaEDItemsDetalle/crear-PlanillaEDItemsDetalle.component';
import { CrearPlanillaEDItemsComponent } from './PlanillaED/crear-PlanillaEDItems/crear-PlanillaEDItems.component.';
import { CrearPlanillaEDComponent } from './PlanillaED/crear-PlanillaED/crear-PlanillaED.component';
import { EvaluacionCabeceraComponent } from './Evaluacion/evaluacionCabecera.component';
import { EvaluacionAgenteComponent } from './Evaluacion/evaluacionAgente.component';
import { EvaluacionItemsComponent } from './Evaluacion/evaluacionItems.component';
import { EvaluacionListadoComponent } from './Evaluacion/evaluacionListado.component';


export const appRoutes: Route[] = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'menu', component: MenuComponent },
            { path: 'userabm', component: UserAbmComponent, canActivate: [AuthGuard] },
            { path: 'categoria', component: CategoriaComponent, canActivate: [AuthGuard] },
            { path: 'servicios', component: ServiciosComponent, canActivate: [AuthGuard] },
            { path: 'tipoEvaluacion', component: TipoEvaluacionComponent, canActivate: [AuthGuard] },
            { path: 'items', component: ItemsComponent, canActivate: [AuthGuard] },
            { path: 'agentes', component: AgentesComponent, canActivate: [AuthGuard] },
            { path: 'planillaed', component: ListarPlanillaEDComponent, canActivate: [AuthGuard] },
            { path: 'crearplanillaItems/:id', component: CrearPlanillaEDItemsComponent, canActivate: [AuthGuard] },

            { path: 'crearplanillaED', component: CrearPlanillaEDComponent, canActivate: [AuthGuard] },
            {
                path: 'crearplanillaItemsDetalle/:id',
                component: CrearPlanillaEDItemsDetalleComponent,
                canActivate: [AuthGuard]
            },
            //evaluacion
            {
                path: 'evaluacion-cabecera',
                component: EvaluacionCabeceraComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'evaluacion-agente/:id',
                component: EvaluacionAgenteComponent,
                canActivate: [AuthGuard]
            },

            {
                path: 'evaluacion-items/:idEvaluacion/:idAgente',
                component: EvaluacionItemsComponent,
                canActivate: [AuthGuard],
                pathMatch: 'full'
            },

            {
                path: 'evaluaciones-listado',
                component: EvaluacionListadoComponent,
                canActivate: [AuthGuard],
                pathMatch: 'full'
            }








        ]
    },
    { path: '**', redirectTo: 'home' }
];
