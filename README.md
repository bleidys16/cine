# CineApp — Sistema Web de Gestión de Cine

Sistema web completo para gestión de cartelera, venta de tiquetes y control de acceso a una sala de cine.

**Taller de Desarrollo de Software — SENA CNCA Nodo TIC ADSO17**

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Estilos | CSS Modules (tema cinematográfico oscuro) |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL en **Neon** |
| Autenticación | JWT + Bcrypt |
| Control de versiones | Git + GitHub |

---

## Estructura del proyecto

```
cine/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/    # Navbar, PeliculaCard, SeatGrid
│   │   ├── context/       # AuthContext (JWT global)
│   │   ├── pages/         # Home, DetallePelicula, Compra, Admin...
│   │   └── services/      # api.js (Axios configurado)
│   └── .env.example
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── controllers/   # auth, peliculas, funciones, tiquetes
│   │   ├── db/            # connection.js + schema.sql
│   │   ├── middleware/     # auth.js (JWT + rol)
│   │   └── routes/        # auth, peliculas, funciones, tiquetes
│   └── .env.example
└── README.md
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/bleidys16/cine.git
cd cine
```

### 2. Configurar la base de datos en Neon

1. Ir a [https://neon.tech](https://neon.tech) y crear una cuenta gratuita
2. Crear un nuevo proyecto → copiar la **Connection String**
3. En el panel SQL de Neon, ejecutar el archivo `backend/src/db/schema.sql`
   - Esto crea todas las tablas, inserta los 150 asientos y datos de ejemplo

### 3. Configurar el Backend

```bash
cd backend
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL=postgresql://usuario:password@ep-xxxx.neon.tech/cinedb?sslmode=require
JWT_SECRET=una_clave_secreta_larga_y_segura
PORT=3001
```

```bash
npm install
npm run dev
```

El servidor corre en `http://localhost:3001`

### 4. Configurar el Frontend

```bash
cd ../frontend
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

```bash
npm install
npm run dev
```

La app corre en `http://localhost:5173`

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@cine.com | password |

> El hash por defecto en el seed corresponde a `password`. Para cambiarlo, genera un nuevo hash con bcrypt y actualiza el SQL.

---

## Endpoints de la API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/registrar` | Crear cuenta |

### Películas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/peliculas` | No | Listar películas activas |
| GET | `/api/peliculas/todas` | Admin | Listar todas |
| GET | `/api/peliculas/:id` | No | Obtener una |
| POST | `/api/peliculas` | Admin | Crear |
| PUT | `/api/peliculas/:id` | Admin | Actualizar |
| DELETE | `/api/peliculas/:id` | Admin | Desactivar |

### Funciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/funciones` | No | Funciones disponibles |
| GET | `/api/funciones/pelicula/:id` | No | Por película |
| GET | `/api/funciones/:id/asientos` | No | Estado de asientos |
| POST | `/api/funciones` | Admin | Crear |
| PUT | `/api/funciones/:id` | Admin | Actualizar |

### Tiquetes
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/tiquetes/comprar` | Cliente | Comprar tiquete |
| POST | `/api/tiquetes/validar` | Admin | Validar acceso |
| GET | `/api/tiquetes/mis-tiquetes` | Cliente | Historial |
| GET | `/api/tiquetes/dashboard` | Admin | Estadísticas |

---

## Modelo de base de datos

```
usuarios ──── tiquetes ──── detalle_tiquete ──── asientos
                 │                                    │
              funciones ───── asientos_funcion ───────┘
                 │
             peliculas
```

**Regla crítica:** `UNIQUE(funcion_id, asiento_id)` en `asientos_funcion` garantiza que ningún asiento pueda venderse dos veces para la misma función.

---

## Funcionalidades principales

- **Cartelera pública** con búsqueda y filtro por género
- **Detalle de película** con funciones disponibles y asientos libres
- **Mapa visual de 150 asientos** (10 filas × 15 columnas) con estados en tiempo real
- **Compra con transacción atómica** — evita doble venta simultánea
- **Generación de código QR único** por tiquete
- **Validación de tiquetes** por código o escáner QR (válido / usado / inválido)
- **Panel admin** con dashboard, CRUD de películas y funciones
- **Autenticación JWT** con roles (admin / cliente)

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Sara Cervantes | Líder |
| Bleidys Larios | Desarrollo Frontend |
| Camilo Caballero | Desarrollo Backend |
| Juan Esper | QA / Documentador |

---

## Despliegue

| Servicio | URL |
|----------|-----|
| Frontend | https://cine-psi-lilac.vercel.app |
| Backend | https://cine-41x4.onrender.com |
