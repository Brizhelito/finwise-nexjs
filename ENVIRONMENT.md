# Documentación de variables de entorno (`.env`)

Este proyecto utiliza variables de entorno para la configuración de servicios externos y la seguridad. A continuación se detallan las variables utilizadas, su propósito y ejemplos de valor.

| Variable             | Descripción                                                      | Obligatoria | Ejemplo de Valor                                     |
|----------------------|------------------------------------------------------------------|-------------|------------------------------------------------------|
| DATABASE_URL         | URL de conexión a la base de datos PostgreSQL.                   | Sí          | postgresql://usuario:contraseña@host:puerto/db       |
| EMAIL_USER           | Correo utilizado para el envío de emails desde la aplicación.     | Sí          | ejemplo@gmail.com                                    |
| EMAIL_PASSWORD       | Contraseña o clave de aplicación del correo electrónico.          | Sí          | contraseña-segura                                    |
| BASE_URL             | URL base donde está desplegada la aplicación.                    | Sí          | https://tudominio.com/                               |
| JWT_REFRESH_SECRET   | Secreto para firmar los tokens de refresh de JWT.                | Sí          | cadena-secreta                                       |
| JWT_SECRET           | Secreto para firmar los tokens JWT.                              | Sí          | cadena-secreta                                       |

## Recomendaciones
- Nunca subas el archivo `.env` con valores reales a ningún repositorio público.
- Usa `.env.example` para compartir la estructura de las variables sin exponer datos sensibles.

---

> Si agregas nuevas variables, por favor actualiza este archivo y el `.env.example`.
