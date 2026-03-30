# 🔍 FindIt — Foro de Objetos Perdidos

[![CubePath](https://img.shields.io/badge/Desplegado%20en-CubePath-00C853?style=for-the-badge&logo=cloud&logoColor=white)](https://TU_URL_AQUI)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow?style=for-the-badge)](./LICENSE)

> Plataforma privada para que organizaciones (universidades, empresas, colegios) gestionen objetos perdidos y encontrados de forma rápida y segura.

**🌐 Demo en vivo:** [FindIt](http://144.225.147.89:3000)

---

## 📸 Capturas


| Página de inicio | Dashboard | Publicar objeto |
|---|---|---|
| ![inicio](https://github.com/user-attachments/assets/8e1ffc28-926c-4c44-8e69-b0faebc748f6) | ![dashboard](https://github.com/user-attachments/assets/c6db513f-5956-465e-a8e4-b3ab8fc397f9) | ![nuevo](https://github.com/user-attachments/assets/51546b43-338e-4242-8ae9-54f01506722f) |

---

## 🧩 El problema que resuelve

En universidades, empresas y colegios, los objetos perdidos se reportan por grupos de WhatsApp, carteles físicos o correos masivos — métodos caóticos, ineficientes y sin seguimiento.

**FindIt** centraliza todo en un foro privado por organización donde:
- Cualquier miembro puede reportar un objeto perdido o encontrado
- Se adjuntan fotos para identificar fácilmente
- Se marca como resuelto cuando el objeto es recuperado
- El contacto del publicador es visible para coordinarse directamente

---

## ✨ Funcionalidades

- 🔐 **Autenticación** — Registro e inicio de sesión con dos roles: `persona` y `organización`
- 🏢 **Organizaciones privadas** — Cada organización tiene su propio foro
- 📋 **Feed de objetos** — Listado de objetos perdidos y encontrados con filtros por estado y categoría
- 📷 **Fotos** — Subida de imágenes adjuntas a cada publicación
- ✅ **Resolución** — Marcar y desmarcar objetos como resueltos
- 👤 **Perfil editable** — Nombre, foto de perfil y método de contacto configurable (correo, WhatsApp, enlace)
- 📬 **Contacto inteligente** — Detecta automáticamente si el contacto es un correo, número de WhatsApp o URL

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 14** | Framework frontend con App Router |
| **Supabase** | Base de datos PostgreSQL + Auth + Storage |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos (inline styles + variables CSS) |
| **CubePath** | Hosting y despliegue de la aplicación |

---

## ☁️ Cómo se usó CubePath

El proyecto está desplegado íntegramente en **CubePath**, aprovechando:

- **Servidor de aplicación** para correr el servidor de Next.js en producción
- **Variables de entorno** configuradas desde el panel de CubePath para las credenciales de Supabase (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Deploy continuo** desde el repositorio de GitHub

CubePath permitió tener el entorno de producción listo en minutos, sin configurar infraestructura manualmente.

---

## 🚀 Correr localmente

```bash
# 1. Clona el repositorio
git clone https://github.com/Josuram-xd/findit.git
cd findit

# 2. Instala dependencias
npm install

# 3. Configura las variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Corre el servidor de desarrollo
npm run dev
```

### Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=https://ketpuixlckofirkyrphl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldHB1aXhsY2tvZmlya3lycGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTI2MjcsImV4cCI6MjA5MDQ2ODYyN30.2UgPafKUTWhlLtUsZr-gU_9bupe9eZIIWV4o1CcvksY
```

---

## 🗃️ Estructura de la base de datos

```
profiles       — Usuarios (nombre, tipo, contacto, avatar_url)
organizations  — Organizaciones (nombre, descripción, dirección)
memberships    — Relación usuario ↔ organización
items          — Objetos perdidos/encontrados (título, descripción, estado, categoría, imagen, resuelto)
```

---

## 👤 Autores

**Josuram** — [@Josuram-xd](https://github.com/Josuram-xd)

**jn_cipher** — [@jn_cipher](https://github.com/Juanescuaran2041)

Proyecto creado para la **Hackatón CubePath 2026** 🏆

---

*Hecho con ☕ y muchas ganas de ganar*
