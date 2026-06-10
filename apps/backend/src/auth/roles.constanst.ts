export const ROLES = {

    ADMINISTRADOR: 'administrador',

    DIRECTOR: 'director',

    EVALUADOR: 'evaluador',

    USUARIO: 'usuario'
};

export const PERMISOS = {

    GESTION_AGENTES: [
        ROLES.ADMINISTRADOR,
        ROLES.DIRECTOR,
        ROLES.EVALUADOR
    ],

    SOLO_ADMIN: [
        ROLES.ADMINISTRADOR
    ],

    GESTION_EVALUACIONES: [
        ROLES.ADMINISTRADOR,
        ROLES.DIRECTOR
    ],
    GESTION_USUARIOS: [
        ROLES.USUARIO,

    ]
};