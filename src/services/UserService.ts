import { Budget } from "@/models/Budget";
import { Saving } from "@/models/Saving";
import { User } from "@/models/User";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
export class UserService {
  static async createUser(data: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }) {
    const { username, password, email, first_name, last_name } = data;

    try {
      return await prisma.$transaction(async () => {
        // Usar métodos de las clases
        const user = await User.create({
          username: username.toLowerCase(),
          password,
          email: email.toLowerCase(),
          first_name,
          last_name,
        });
        const budget = await Budget.create({ user_id: user.id, balance: 0 });
        const saving = await Saving.create({
          user_id: user.id,
          total_saved: 0,
        });
        this.sendAccountActivationEmail(email);
        return { user, budget, saving };
      });
    } catch (error) {
      console.error("Error creating user, budget, and saving:", error);
      throw new Error("Unable to create user with budget and saving");
    }
  }
  /**
   * Actualiza los datos del usuario y/o su contraseña.
   *
   * @param data Objeto con los datos necesarios para actualizar:
   *  - userId: ID del usuario (obtenido desde la cookie).
   *  - currentPassword: contraseña actual para validar la autenticidad.
   *  - newPassword (opcional): nueva contraseña (si se desea cambiar).
   *  - first_name (opcional): nuevo nombre.
   *  - last_name (opcional): nuevo apellido.
   *
   * @throws Error si el usuario no existe o la contraseña actual es incorrecta.
   */
  static async updateUser(data: {
    userId: number;
    currentPassword: string;
    newPassword?: string;
    first_name?: string;
    last_name?: string;
  }) {
    const { userId, currentPassword, newPassword, first_name, last_name } =
      data;

    try {
      // Buscar el usuario en la base de datos
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Validar que la contraseña actual proporcionada coincida
      // Se asume que User.verifyPassword utiliza, por ejemplo, bcrypt.compare
      const isValid = await User.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        throw new Error("La contraseña actual es incorrecta");
      }

      // Preparar los datos a actualizar
      const updateData: {
        first_name?: string;
        last_name?: string;
        password?: string;
      } = {};

      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;

      if (newPassword) {
        // Se asume que User.hashPassword se encarga de hashear la nueva contraseña
        const hashedPassword = await User.hashPassword(newPassword);
        updateData.password = hashedPassword;
      }

      // Actualizar el usuario en la base de datos
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("No se pudo actualizar el usuario");
    }
  }
  static async sendPasswordRecoveryEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("No se encontró un usuario con ese correo electrónico");
    }

    // Generar un token de recuperación único
    const token = crypto.randomBytes(32).toString("hex");

    // Crear una entrada en la base de datos para almacenar el token
    const recovery = await prisma.passwordRecovery.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // El token expira en 15 minutos
      },
    });

    // Configuración del transporte de correo electrónico
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Tu correo de Gmail
        pass: process.env.EMAIL_PASSWORD, // La contraseña de tu correo
      },
    });

    // Configuración del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperación de Contraseña",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 120px;" />
        </div>
        
        <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Recuperar tu Contraseña</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #555;">Hola ${user.first_name},</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">Recibimos una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, por favor ignora este mensaje.</p>

        <p style="font-size: 16px; line-height: 1.5; color: #555;">Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.BASE_URL}/reset-password?token=${recovery.token}" 
             style="padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.5; color: #555;">Este enlace expira en 15 minutos.</p>
        
        <p style="font-size: 14px; line-height: 1.5; color: #777; text-align: center; margin-top: 40px;">
          Si tienes problemas con el enlace, copia y pega esta URL en tu navegador: 
          <br />
          <a href="${process.env.BASE_URL}/reset-password?token=${recovery.token}" style="color: #1976d2;">${process.env.BASE_URL}/reset-password?token=${recovery.token}</a>
        </p>

        <div style="margin-top: 40px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Si no solicitaste este cambio, por favor ignora este mensaje.</p>
          <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
        </div>
      </div>
    </div>
  `,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    return { message: "Correo de recuperación enviado." };
  }

  /**
   * Restablece la contraseña del usuario utilizando el token de recuperación.
   * @param token Token de recuperación.
   * @param newPassword Nueva contraseña en texto plano.
   * @returns Objeto con mensaje de éxito.
   * @throws Error si el token es inválido, ha expirado o falla la actualización.
   */
  static async resetPassword(token: string, newPassword: string) {
    // Verificar el token (se reutiliza el método anterior)
    await this.verifyPasswordRecoveryToken(token);

    // Buscar el registro de recuperación
    const recoveryRecord = await prisma.passwordRecovery.findUnique({
      where: { token },
    });

    if (!recoveryRecord) {
      throw new Error("Token inválido");
    }

    // Buscar el usuario relacionado
    const user = await prisma.user.findUnique({
      where: { id: recoveryRecord.userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Hashear la nueva contraseña (se asume que User.hashPassword lo maneja)
    const hashedPassword = await User.hashPassword(newPassword);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Eliminar el registro del token de recuperación
    await prisma.passwordRecovery.delete({
      where: { token },
    });

    return { message: "Contraseña restablecida con éxito" };
  }
  /**
   * Verifica que el token de recuperación sea válido (exista y no esté expirado).
   * @param token Token de recuperación.
   * @returns true si el token es válido.
   * @throws Error en caso de token inválido o expirado.
   */
  static async verifyPasswordRecoveryToken(token: string): Promise<boolean> {
    const recoveryRecord = await prisma.passwordRecovery.findUnique({
      where: { token },
    });
    console.log(recoveryRecord);
    if (!recoveryRecord) {
      throw new Error("Token inválido");
    }
    if (new Date() > recoveryRecord.expiresAt) {
      throw new Error("Token expirado");
    }
    if (!recoveryRecord.userId) {
      throw new Error("Token inválido");
    }
    if (!recoveryRecord.token) {
      throw new Error("Token inválido");
    }
    if (!recoveryRecord.expiresAt) {
      throw new Error("Token inválido");
    }
    return true;
  }
  static async sendAccountActivationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new Error("No se encontró un usuario con ese correo electrónico");
    }
    if (user.activated) {
      throw new Error("La cuenta ya está activada");
    }
    // Generar token de activación
    const token = crypto.randomBytes(32).toString("hex");
    // Crear registro de activación en la base de datos
    const activation = await prisma.accountActivation.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Válido por 24 horas
      },
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Activación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 120px;" />
            </div>
            
            <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Activa tu Cuenta</h2>
            
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Hola ${user.first_name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.BASE_URL}/activate-account?token=${activation.token}" 
                 style="padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
                Activar Cuenta
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #555;">El enlace es válido por 24 horas.</p>
            
            <p style="font-size: 14px; line-height: 1.5; color: #777; text-align: center; margin-top: 40px;">
              Si tienes problemas con el enlace, copia y pega esta URL en tu navegador: 
              <br />
              <a href="${process.env.BASE_URL}/activate-account?token=${activation.token}" style="color: #1976d2;">${process.env.BASE_URL}/activate-account?token=${activation.token}</a>
            </p>

            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 14px; color: #888;">Si no solicitaste esta activación, por favor ignora este mensaje.</p>
              <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return { message: "Correo de activación enviado." };
  }
  static async activateAccount(token: string) {
    // Verificar el registro de activación
    const activationRecord = await prisma.accountActivation.findUnique({
      where: { token },
    });
    if (!activationRecord) {
      throw new Error("Token inválido");
    }
    if (new Date() > activationRecord.expiresAt) {
      throw new Error("Token expirado");
    }
    if (activationRecord.used) {
      throw new Error("El token ya ha sido utilizado");
    }
    // Buscar el usuario relacionado
    const user = await prisma.user.findUnique({
      where: { id: activationRecord.userId },
    });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    // Activar la cuenta del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { activated: true },
    });
    // Marcar el token como utilizado (o eliminar el registro)
    await prisma.accountActivation.update({
      where: { token },
      data: { used: true },
    });
    return { message: "Cuenta activada con éxito" };
  }
  static async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("No se encontró un usuario con ese correo electrónico");
    }

    // Verificamos si ya está activado
    if (user.activated) {
      throw new Error("La cuenta ya está activada");
    }

    // Buscamos el último token de activación que haya expirado o no se haya usado
    const expiredToken = await prisma.accountActivation.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (!expiredToken) {
      throw new Error("No se encontró un token expirado para reenviar.");
    }

    // Generar un nuevo token de activación
    const newToken = crypto.randomBytes(32).toString("hex");

    // Crear un nuevo token en la base de datos
    const newActivation = await prisma.accountActivation.create({
      data: {
        token: newToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // El token expira en 24 horas
      },
    });

    // Configuración del transporte de correo electrónico
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Configuración del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Activación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 120px;" />
            </div>
            
            <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Activa tu Cuenta</h2>
            
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Hola ${user.first_name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.BASE_URL}/activate-account?token=${newActivation.token}" 
                 style="padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
                Activar Cuenta
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #555;">El enlace es válido por 24 horas.</p>
            
            <p style="font-size: 14px; line-height: 1.5; color: #777; text-align: center; margin-top: 40px;">
              Si tienes problemas con el enlace, copia y pega esta URL en tu navegador: 
              <br />
              <a href="${process.env.BASE_URL}/activate-account?token=${newActivation.token}" style="color: #1976d2;">${process.env.BASE_URL}/activate-account?token=${newActivation.token}</a>
            </p>

            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 14px; color: #888;">Si no solicitaste esta activación, por favor ignora este mensaje.</p>
              <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </div>
      `,
    };

    // Enviar el correo con el nuevo token
    await transporter.sendMail(mailOptions);

    return { message: "Nuevo enlace de activación enviado a tu correo." };
  }
}
