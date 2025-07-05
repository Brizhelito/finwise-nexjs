# FinWise

FinWise es una aplicación web de finanzas personales desarrollada con Next.js, TypeScript y Prisma. Permite a los usuarios gestionar presupuestos, transacciones, metas de ahorro y categorías, proporcionando una experiencia moderna y segura.

## Características principales
- Registro, inicio de sesión y recuperación de contraseña
- Activación de cuenta por email
- Gestión de presupuestos y categorías
- Registro y visualización de transacciones
- Creación y seguimiento de metas de ahorro
- Panel de usuario privado y perfil
- Visualización de métricas y gráficos

## Estructura del proyecto
```
prisma/           # Esquema y migraciones de base de datos
public/           # Recursos estáticos (imágenes, íconos)
src/
  app/            # Páginas y layouts de Next.js
    (private)/    # Rutas protegidas (dashboard, perfil)
    (public)/     # Rutas públicas (landing, login, registro)
    api/          # Endpoints API
  components/     # Componentes reutilizables y UI
  context/        # Contextos globales (ej. usuario)
  controllers/    # Lógica de control (ej. authController)
  hooks/          # Custom hooks
  lib/            # Librerías auxiliares (ej. prisma, session)
  models/         # Modelos de datos
  providers/      # Proveedores de contexto
  repositories/   # Acceso a datos (repositorios)
  services/       # Lógica de negocio
  styles/         # Estilos personalizados
  types/          # Tipos y definiciones TypeScript
  utils/          # Utilidades generales
```

## Instalación y configuración
1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd finwise-nexjs
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env` (ver ejemplo `.env.example` si existe).
4. Realiza las migraciones de la base de datos:
   ```bash
   npx prisma migrate deploy
   ```
5. (Opcional) Pobla la base de datos con datos de ejemplo:
   ```bash
   node prisma/seed.js
   ```
6. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts útiles
- `npm run dev` — Inicia el servidor Next.js en modo desarrollo
- `npm run build` — Compila la aplicación para producción
- `npm run start` — Inicia la app en modo producción
- `npx prisma studio` — Abre Prisma Studio para explorar la base de datos

## Tecnologías principales
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [React](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/) (o la base de datos configurada)

## Contribución
¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request para sugerencias o mejoras.

## Licencia
Este proyecto está bajo la licencia MIT.

---

### Notas de desarrollo
- Asegúrate de tener Node.js y PostgreSQL instalados.
- Personaliza las rutas y componentes según las necesidades de tu equipo o producto.
- Consulta la documentación de Next.js y Prisma para extender funcionalidades.
