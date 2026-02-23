#  Sistema de Evaluación de Desempeño – Monorepo

Sistema web para la gestión integral de evaluaciones de desempeño del personal.

Proyecto versión 2 desarrollado bajo arquitectura Monorepo utilizando Nx, separadofrontend y backend.

---

##  Arquitectura del Proyecto

Este sistema está organizado como un monorepo con las siguientes caracteristicas:

- Separación entre aplicaciones
- Reutilización de código mediante librerías compartidas
- Escalabilidad modular
- Control centralizado de dependencias
- Optimización de builds y tareas

### Estructura

```
apps/
  frontend   → Aplicación Angular
  backend    → API REST (Node.js + Express)

libs/
  shared     → Interfaces, modelos y utilidades reutilizables
```

---

##  Tecnologías Utilizadas

 - Angular 20.2.4
 - Angular CLI 20.2.2
 - Node.js 20.19.5
 - npm 10.8.2
 - Express
 - MongoDB
 - Nx (Arquitectura Monorepo)
 - TypeScript 5.9.2
 - RxJS 7.8.2

---

##  Seguridad Implementada

El backend cuenta con:

- Autenticación mediante JWT  
- Middleware de verificación de token  
- Doble capa de seguridad (Frontend + Backend)  
- Estandarización de respuestas API mediante `apiResponse`  
 

---

## ⚙ Instalación

```bash
npm install
```

---

##  Ejecutar el Proyecto en Desarrollo

Levantar el sistema completo (frontend + backend):

```bash
npm start
```

## 👨‍💻 Autor

Desarrollado por **Flavio Vila**  
Versión 2
