# FleetCore - Sistema de Gestión de Mantenimiento de Flota de Vehículos
## Prueba de Desempeño – Módulo 6.2 NestJS

---

### 📌 Información del Coder
* **Nombre:** Coder (Desarrollador Backend)
* **Clan:** Riwi Dev Clan
* **Proyecto:** API REST FleetCore - Ciclo de Vida de Mantenimientos

---

## 🚀 Descripción del Proyecto
API REST construida con **NestJS**, **TypeScript**, **PostgreSQL** y **TypeORM** para administrar el ciclo de vida completo de los mantenimientos de la flota vehicular de FleetCore.

El sistema resuelve la trazabilidad de vehículos, asignación de mecánicos y talleres, control estricto de disponibilidad según estados, prevención de cruces de horarios y control transaccional atómico.

### 🛡️ Buenas Prácticas y Decisiones de Arquitectura
1. **Seguridad y Hashing:** Se utiliza `bcrypt` (10 rondas de sal) para el almacenamiento criptográfico seguro de contraseñas.
2. **Control de Acceso Basado en Roles (RBAC):** Roles oficiales del sistema: `ADMIN` y `TECHNICIAN`.
3. **Mínimo 3 Decoradores Personalizados:**
   * `@Roles(...)`: Declara los roles autorizados para el endpoint.
   * `@CurrentUser()`: Extrae el usuario autenticado de la petición.
   * `@Public()`: Marca endpoints exentos de autenticación JWT.
4. **Respuestas Uniformes y Manejo Centralizado de Errores:**
   * `ResponseInterceptor`: Formatea todas las respuestas exitosas `{ success: true, statusCode, data, timestamp }`.
   * `HttpExceptionFilter`: Captura excepciones y convierte violaciones de unicidad / integridad de PostgreSQL a códigos HTTP semánticos (409 Conflict, 400 Bad Request) evitando errores 500 no controlados.
5. **Transacciones Atómicas:** Sincronización entre el cambio de estado de mantenimientos (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`) y el estado del vehículo (`AVAILABLE`, `IN_MAINTENANCE`) implementada con `QueryRunner` de TypeORM.
6. **Autenticación Externa (API Key):** Endpoint para consumo externo protegido mediante el encabezado `x-api-key` y `ApiKeyGuard`.

---

## 🛠️ Requisitos Previos
* **Node.js** (v20 o superior)
* **npm** (v10 o superior)
* **PostgreSQL** (v15 o superior) o **Docker & Docker Compose**

---

## ⚙️ Paso a Paso para Levantar el Proyecto

### 1. Clonar e Instalar Dependencias
```bash
git clone <url-del-repositorio>
cd "prueba de nest"
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Contenido de `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fleetcore
JWT_SECRET=cambia-este-secreto
JWT_EXPIRES_IN=1h
API_KEYS=demo-key-partner-1,demo-key-partner-2
```

### 3. Ejecutar el Seeder de Base de Datos
Poblar la base de datos de manera automática e **idempotente** (ejecutarlo varias veces no duplica datos):
```bash
npm run seed
```

### 4. Iniciar el Servidor en Desarrollo
```bash
npm run start:dev
```
La aplicación estará disponible en: `http://localhost:3000`

---

## 🐳 Despliegue con Docker (Opcional Extra)
Se incluye configuración completa con `Dockerfile` multi-stage y `docker-compose.yml`:
```bash
# Levantar contenedor de base de datos y API
docker compose up -d --build
```

---

## 📖 Documentación Interactiva (Swagger)
Una vez levantada la API, accede a la documentación interactiva Swagger:
👉 **URL de Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

En Swagger puedes:
* Usar el botón **Authorize** con el token JWT obtenido en el login: `Bearer <token>`.
* Probar el header `x-api-key` (`demo-key-partner-1`) en las rutas externas.

---

## 🔑 Credenciales de Prueba (Generadas por el Seeder)

| Rol | Correo Electrónico | Contraseña | Descripción |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@fleetcore.com` | `Password123*` | Administrador con acceso total |
| **TECHNICIAN** | `carlos.tecnico@fleetcore.com` | `Password123*` | Técnico vinculado al mecánico Carlos Pérez |
| **TECHNICIAN** | `laura.tecnico@fleetcore.com` | `Password123*` | Técnico vinculado al mecánico Laura Gómez |

### Claves API para Integraciones Externas:
* `demo-key-partner-1`
* `demo-key-partner-2`

---

## 📋 Datos Iniciales del Seeder

* **Mecánicos:**
  * Carlos Pérez (Activo, vinculado a `carlos.tecnico@fleetcore.com`)
  * Laura Gómez (Activo, vinculado a `laura.tecnico@fleetcore.com`)
  * Pedro Ramírez (Inactivo)
* **Talleres:**
  * Taller Centro (Activo)
  * Taller Norte (Inactivo)
* **Vehículos:**
  * `ABC123` (Chevrolet NPR, Estado: `AVAILABLE`)
  * `XYZ789` (Renault Master, Estado: `AVAILABLE`)
  * `MNT456` (Hino Dutro, Estado: `IN_MAINTENANCE` con mantenimiento `IN_PROGRESS`)
  * `OLD000` (Ford Cargo, Estado: `INACTIVE`)
* **Mantenimientos:**
  * 1 `COMPLETED` en vehículo `ABC123` (Historial con costos y kilometraje final)
  * 1 `IN_PROGRESS` en vehículo `MNT456`

---

## 🧪 Pruebas y Evidencias
* Se adjunta la colección de Postman: [`FleetCore_API.postman_collection.json`](./FleetCore_API.postman_collection.json).
* Se adjunta el respaldo de la base de datos: [`fleetcore_dump.sql`](./fleetcore_dump.sql).
