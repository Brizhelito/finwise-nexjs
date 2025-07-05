# Documentación Técnica — FinWise

## Descripción General
FinWise es una aplicación web de finanzas personales que permite a los usuarios gestionar presupuestos, transacciones, categorías y metas de ahorro. Está construida con Next.js, TypeScript y Prisma ORM, siguiendo una arquitectura modular y escalable.

## Arquitectura General
- **Frontend y Backend integrados:** Next.js permite SSR y API routes en un solo proyecto.
- **ORM:** Prisma gestiona la conexión y migraciones de la base de datos.
- **Autenticación:** Basada en sesiones y JWT, con recuperación de contraseña y activación de cuenta.
- **Contextos y Providers:** React Context para manejo global de usuario y autenticación.

## Estructura de Carpetas
- `prisma/`: Esquema de base de datos y migraciones.
- `public/`: Recursos estáticos.
- `src/app/`: Páginas, layouts y rutas API.
  - `(private)/`: Rutas protegidas (dashboard, perfil, etc).
  - `(public)/`: Rutas públicas (landing, login, registro).
  - `api/`: Endpoints para autenticación, usuarios, transacciones, etc.
- `src/components/`: Componentes reutilizables y UI.
- `src/context/`: Contextos globales (ej. usuario).
- `src/controllers/`: Lógica de control (ej. autenticación).
- `src/hooks/`: Custom hooks de React.
- `src/lib/`: Librerías auxiliares (ej. prisma, session).
- `src/models/`: Modelos de datos TypeScript.
- `src/providers/`: Proveedores de contexto.
- `src/repositories/`: Acceso a datos y lógica de persistencia.
- `src/services/`: Lógica de negocio y servicios.
- `src/styles/`: Estilos personalizados.
- `src/types/`: Tipos y definiciones globales.
- `src/utils/`: Utilidades generales (validaciones, JWT, métricas, etc).

## Principales Módulos
### Autenticación
- Registro, login, recuperación y activación de cuenta.
- Uso de JWT y cookies para sesiones.
- Endpoints en `src/app/api/auth/` y lógica en `controllers/authController.ts` y `services/authService.ts`.

### Gestión de Usuarios
- Contexto global en `context/UserContext.tsx`.
- Proveedor en `providers/AuthProvider.tsx`.
- Modelo en `models/User.ts` y repositorio en `repositories/userRepository.ts`.

### Presupuestos, Categorías y Transacciones
- Modelos y repositorios dedicados para cada entidad.
- Servicios para lógica de negocio.
- Componentes de UI para visualización y edición.

### Metas de Ahorro
- Modelos, repositorios y servicios para crear y seguir metas.
- Visualización de progreso y métricas.

## Flujo de Autenticación
1. El usuario se registra y recibe un email de activación.
2. Tras activar la cuenta, puede iniciar sesión.
3. El sistema genera un JWT y lo almacena en una cookie segura.
4. El contexto de usuario mantiene el estado de autenticación en el frontend.
5. Para rutas protegidas, se verifica la sesión en el middleware y en los endpoints API.

## Recomendaciones de Desarrollo
- Usa `npm run dev` para desarrollo local.
- Realiza migraciones con `npx prisma migrate dev`.
- Explora la base de datos con `npx prisma studio`.
- Mantén las variables sensibles en `.env` y nunca las subas al repositorio.
- Sigue la estructura modular para facilitar el mantenimiento y escalabilidad.

## Despliegue
- Compila la app con `npm run build` y ejecuta con `npm run start`.
- Configura correctamente las variables de entorno en el entorno de producción.
- Asegúrate de que la base de datos esté accesible y migrada.

## Contacto y soporte
Para dudas técnicas, abre un issue en el repositorio o contacta al equipo de desarrollo.
