# PostCare IPSCSF

Este documento ofrece una introducción general al repositorio **PostCare_IPSCSF**, explicando su arquitectura, pila tecnológica y estructura organizativa.  
Sirve como punto de partida para comprender cómo funcionan conjuntamente los componentes del sistema.

## 📁 ¿Qué es PostCare_IPSCSF?

PostCare_IPSCSF es una aplicación web completa que consta de dos componentes independientes pero complementarios:

- **Backend:** una API REST basada en Python y creada con FastAPI que proporciona funcionalidad del lado del servidor.
- **Frontend:** una aplicación de página única (SPA) basada en React, desarrollada con TypeScript y Vite, que proporciona la interfaz de usuario.

El repositorio se encuentra actualmente en su fase inicial de desarrollo, con aplicaciones base que muestran la arquitectura y el flujo de trabajo general.

---

## 📄 Documentación

La documentación detallada del proyecto se encuentra en la carpeta [`documentation/`](documentation):

- 📘 [Guía de instalación y ejecución](documentation/setup.md)
- 🏗️ [Arquitectura del sistema](documentation/architecture.md)
- 🐳 [Uso de Docker y Docker Compose](documentation/docker.md)
- 🧪 [Flujo de desarrollo](documentation/development.md)

> 👉 Si querés empezar rápido, revisá primero la  
> **[Guía paso a paso para correr la app](documentation/setup.md)**

---

## 🧰 Stack Tecnológico

### Tecnologías del Backend

| Tecnología | Versión | Propósito | Ubicación |
|----------|--------|----------|----------|
| Python | 3.11 | Entorno de ejecución | Backend |
| FastAPI | Latest | Framework web y API REST | backend/main.py |
| Async/Await | Nativo | Manejo de solicitudes asíncronas | backend |

### Tecnologías del Frontend

| Tecnología | Versión | Propósito | Ubicación |
|----------|--------|----------|----------|
| React | ^19.2.0 | UI Library | Frontend |
| TypeScript | ~5.9.3 | JavaScript tipado | Frontend |
| Vite | ^7.2.2 | Build tool y dev server | Frontend |
| React DOM | ^19.2.0 | Renderizado DOM | Frontend |

---