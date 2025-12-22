import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AgentesService, ModAgente } from '../../services/agentes.service';
import { HeaderComponent } from '../../header/header.component';

@Component({
    selector: 'app-agentes',
    standalone: true,
    templateUrl: './agentes.component.html',
    styleUrls: ['./agentes.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class AgentesComponent implements OnInit {
    filtroNombre: string = '';
    agentesFiltrados: ModAgente[] = [];
    agentes: ModAgente[] = [];
    mostrarModal = false;
    esEdicion = false;
    cargando: boolean = false;


    agenteSeleccionado: ModAgente | null = null;

    nuevoAgente: ModAgente = {
        legajo: '',
        dni: '',
        nombre: ''
    };

    constructor(
        private agentesService: AgentesService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarAgentes();
        //  this.filtrarAgentes();
    }

    filtrarAgentes(): void {
        if (!this.filtroNombre) {
            this.agentesFiltrados = this.agentes;
        } else {
            const texto = this.filtroNombre.toLowerCase();
            this.agentesFiltrados = this.agentes.filter(a =>
                a.nombre.toLowerCase().includes(texto)
            );
        }
    }
    cargarAgentes(): void {
        this.cargando = true;

        this.agentesService.obtenerTodosAgentes().subscribe({
            next: data => {
                this.agentes = data;
                this.filtrarAgentes();
                this.cargando = false;
            },
            error: err => {
                console.error('Error al cargar agentes:', err);
                Swal.fire('❌ Error', 'No se pudieron cargar los agentes', 'error');
                this.cargando = false;
            }
        });
    }




    abrirModal(agente?: ModAgente): void {
        if (agente) {
            this.esEdicion = true;
            this.agenteSeleccionado = agente;
            this.nuevoAgente = { ...agente };
        } else {
            this.esEdicion = false;
            this.agenteSeleccionado = null;
            this.nuevoAgente = { legajo: '', dni: '', nombre: '' };
        }

        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarAgente(): void {
        if (this.esEdicion && this.agenteSeleccionado) {
            this.agentesService.modificarAgente(this.agenteSeleccionado._id!, this.nuevoAgente)
                .subscribe({
                    next: () => {
                        Swal.fire(' Éxito', 'Agente actualizado', 'success');
                        this.cargarAgentes();
                        this.cerrarModal();
                    },
                    error: () => Swal.fire(' Error', 'No se pudo actualizar', 'error')
                });
        } else {
            this.agentesService.crearAgente(this.nuevoAgente)
                .subscribe({
                    next: () => {
                        Swal.fire(' Éxito', 'Agente creado', 'success');
                        this.cargarAgentes();
                        this.cerrarModal();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo crear', 'error')
                });
        }
    }

    eliminarAgente(id: string): void {
        Swal.fire({
            title: '¿Eliminar agente?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(r => {
            if (r.isConfirmed) {
                this.agentesService.eliminarAgente(id).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Agente eliminado', 'success');
                        this.cargarAgentes();
                    },
                    error: () => Swal.fire(' Error', 'No se pudo eliminar', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
