import { Budget } from "@/models/Budget";
import { Saving } from "@/models/Saving";
import { User } from "@/models/User";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer, { SendMailOptions } from "nodemailer"; // Import SendMailOptions from nodemailer

/**
 * Servicio para la gestión de usuarios, incluyendo la creación, actualización,
 * recuperación de contraseña, activación de cuenta y envío de correos electrónicos.
 */
export class UserService {
  /**
   * Crea un nuevo usuario, presupuesto y ahorro asociado, e inicia el proceso de activación de cuenta.
   *
   * @param data Objeto con los datos necesarios para crear el usuario: username, password, email, first_name, last_name.
   * @returns Promesa que resuelve en un objeto conteniendo el usuario, presupuesto y ahorro creados.
   * @throws Error Si ocurre un error durante la creación del usuario, presupuesto o ahorro, o si falla el envío del correo de activación.
   */
  static async createUser(data: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }) {
    const { username, password, email, first_name, last_name } = data;

    // Verifica si el username o email ya existen
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      },
    });
    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        throw new Error("El nombre de usuario ya está en uso");
      } else {
        throw new Error("El correo electrónico ya está en uso");
      }
    }

    try {
      return await prisma.$transaction(async () => {
        // Crea el usuario utilizando el modelo User.
        const user = await User.create({
          username: username.toLowerCase(), // Convierte el username a minúsculas para uniformidad.
          password,
          email: email.toLowerCase(), // Convierte el email a minúsculas para uniformidad.
          first_name,
          last_name,
        });

        // Crea un presupuesto asociado al usuario con saldo inicial en 0.
        const budget = await Budget.create({ user_id: user.id, balance: 0 });

        // Crea una cuenta de ahorro asociada al usuario con total ahorrado inicial en 0.
        const saving = await Saving.create({
          user_id: user.id,
          total_saved: 0,
        });

        // Envía el correo electrónico de activación de cuenta al usuario recién creado.
        await this.sendAccountActivationEmail(email);

        return { user, budget, saving }; // Retorna el usuario, presupuesto y ahorro creados.
      });
    } catch (error) {
      console.error("Error creating user, budget, and saving:", error);
      throw new Error("Unable to create user with budget and saving"); // Lanza un error genérico si falla la transacción.
    }
  }

  /**
   * Actualiza los datos del usuario y/o su contraseña, previa validación de la contraseña actual.
   *
   * @param data Objeto con los datos necesarios para actualizar:
   *  - userId: ID del usuario.
   *  - currentPassword: Contraseña actual del usuario para validación.
   *  - newPassword (opcional): Nueva contraseña a establecer.
   *  - first_name (opcional): Nuevo nombre del usuario.
   *  - last_name (opcional): Nuevo apellido del usuario.
   * @returns Promesa que resuelve en el usuario actualizado.
   * @throws Error Si el usuario no existe, la contraseña actual es incorrecta, o si falla la actualización.
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
      // Busca el usuario en la base de datos por su ID.
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Lanza un error si el usuario no existe.
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Valida la contraseña actual proporcionada contra la contraseña hasheada almacenada.
      const isValid = await User.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        throw new Error("La contraseña actual es incorrecta");
      }

      // Inicializa un objeto para almacenar los datos que se van a actualizar.
      const updateData: {
        first_name?: string;
        last_name?: string;
        password?: string;
      } = {};

      // Incluye el nuevo nombre en los datos de actualización si se proporciona.
      if (first_name !== undefined) updateData.first_name = first_name;
      // Incluye el nuevo apellido en los datos de actualización si se proporciona.
      if (last_name !== undefined) updateData.last_name = last_name;

      // Si se proporciona una nueva contraseña, la hashea y la incluye en los datos de actualización.
      if (newPassword) {
        const hashedPassword = await User.hashPassword(newPassword);
        updateData.password = hashedPassword;
      }

      // Actualiza el usuario en la base de datos con los datos preparados.
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return updatedUser; // Retorna el usuario actualizado.
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("No se pudo actualizar el usuario"); // Lanza un error genérico si falla la actualización.
    }
  }

  /**
   * Envía un correo electrónico al usuario para la recuperación de su contraseña.
   *
   * @param email Correo electrónico del usuario que solicitó la recuperación de contraseña.
   * @returns Promesa que resuelve en un mensaje de éxito indicando que el correo de recuperación ha sido enviado.
   * @throws Error Si no se encuentra un usuario con el correo electrónico proporcionado o si falla el envío del correo.
   */
  static async sendPasswordRecoveryEmail(email: string) {
    // Busca un usuario por su correo electrónico (convirtiendo el email a minúsculas para la búsqueda).
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Lanza un error si no se encuentra ningún usuario con el correo electrónico proporcionado.
    if (!user) {
      throw new Error("No se encontró un usuario con ese correo electrónico");
    }

    // Genera un token de recuperación único y seguro.
    const token = crypto.randomBytes(32).toString("hex");

    // Crea un registro en la base de datos para el token de recuperación, asociándolo al usuario y estableciendo una fecha de expiración (15 minutos).
    await prisma.passwordRecovery.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // El token expira en 15 minutos
      },
    });

    // Define el contenido del correo electrónico de recuperación de contraseña.
    const mailOptions: SendMailOptions = {
      // Use SendMailOptions type here
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperación de Contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://finwise-app.vercel.app/icons/icon.svg" alt="Logo" style="max-width: 120px;" />
            </div>

            <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Recuperar tu Contraseña</h2>

            <p style="font-size: 16px; line-height: 1.5; color: #555;">Hola ${user.first_name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Recibimos una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, por favor ignora este mensaje.</p>

            <p style="font-size: 16px; line-height: 1.5; color: #555;">Haz clic en el siguiente enlace para restablecer tu contraseña:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.BASE_URL}/reset-password?token=${token}"
                 style="padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #555;">Este enlace expira en 15 minutos.</p>

            <p style="font-size: 14px; line-height: 1.5; color: #777; text-align: center; margin-top: 40px;">
              Si tienes problemas con el enlace, copia y pega esta URL en tu navegador:
              <br />
              <a href="${process.env.BASE_URL}/reset-password?token=${token}" style="color: #1976d2;">${process.env.BASE_URL}/reset-password?token=${token}</a>
            </p>

            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 14px; color: #888;">Si no solicitaste este cambio, por favor ignora este mensaje.</p>
              <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </div>
      `,
    };

    // Envía el correo electrónico utilizando una función privada para la gestión del transporte y envío.
    await this._sendEmail(user.email, mailOptions);
    return { message: "Correo de recuperación enviado." }; // Retorna un mensaje de éxito.
  }

  /**
   * Restablece la contraseña del usuario si el token de recuperación es válido.
   *
   * @param token Token de recuperación de contraseña.
   * @param newPassword Nueva contraseña en texto plano.
   * @returns Promesa que resuelve en un mensaje de éxito indicando que la contraseña ha sido restablecida.
   * @throws Error Si el token es inválido, ha expirado, o si falla la actualización de la contraseña.
   */
  static async resetPassword(token: string, newPassword: string) {
    // Verifica la validez del token de recuperación.
    await this.verifyPasswordRecoveryToken(token);

    // Busca el registro de recuperación en la base de datos utilizando el token.
    const recoveryRecord = await prisma.passwordRecovery.findUnique({
      where: { token },
    });

    // Lanza un error si no se encuentra el registro de recuperación (token inválido).
    if (!recoveryRecord) {
      throw new Error("Token inválido");
    }

    // Busca el usuario asociado al token de recuperación.
    const user = await prisma.user.findUnique({
      where: { id: recoveryRecord.userId },
    });

    // Lanza un error si no se encuentra el usuario asociado al token.
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Hashea la nueva contraseña antes de almacenarla.
    const hashedPassword = await User.hashPassword(newPassword);

    // Actualiza la contraseña del usuario en la base de datos.
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Elimina el registro del token de recuperación para evitar su reutilización.
    await prisma.passwordRecovery.delete({
      where: { token },
    });

    return { message: "Contraseña restablecida con éxito" }; // Retorna un mensaje de éxito.
  }

  /**
   * Verifica si un token de recuperación de contraseña es válido y no ha expirado.
   *
   * @param token Token de recuperación de contraseña a verificar.
   * @returns Promesa que resuelve en true si el token es válido y no ha expirado.
   * @throws Error Si el token es inválido o ha expirado.
   */
  static async verifyPasswordRecoveryToken(token: string): Promise<boolean> {
    // Busca el registro de recuperación en la base de datos utilizando el token.
    const recoveryRecord = await prisma.passwordRecovery.findUnique({
      where: { token },
    });

    // Lanza un error si no se encuentra el registro de recuperación (token inválido).
    if (!recoveryRecord) {
      throw new Error("Token inválido");
    }

    // Lanza un error si la fecha actual es posterior a la fecha de expiración del token.
    if (new Date() > recoveryRecord.expiresAt) {
      throw new Error("Token expirado");
    }

    return true; // Retorna true si el token es válido y no ha expirado.
  }

  /**
   * Envía un correo electrónico de activación de cuenta al usuario.
   *
   * @param email Correo electrónico del usuario al que se enviará el correo de activación.
   * @returns Promesa que resuelve en un mensaje de éxito indicando que el correo de activación ha sido enviado.
   * @throws Error Si no se encuentra un usuario con el correo electrónico proporcionado, la cuenta ya está activada, o si falla el envío del correo.
   */
  static async sendAccountActivationEmail(email: string) {
    // Busca el usuario por correo electrónico o nombre de usuario (convirtiendo el email a minúsculas para la búsqueda).
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLocaleLowerCase() },
          { username: email.toLocaleLowerCase() },
        ],
      },
    });

    // Lanza un error si no se encuentra ningún usuario con el correo electrónico o nombre de usuario proporcionado.
    if (!user) {
      throw new Error("No se encontró un usuario con ese correo electrónico");
    }

    // Lanza un error si la cuenta del usuario ya está activada.
    if (user.activated) {
      throw new Error("La cuenta ya está activada");
    }

    // Genera un token de activación único y seguro.
    const token = crypto.randomBytes(32).toString("hex");

    // Crea un registro de activación en la base de datos, asociándolo al usuario y estableciendo una fecha de expiración (24 horas).
    await prisma.accountActivation.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Válido por 24 horas
      },
    });

    // Define el contenido del correo electrónico de activación de cuenta.
    const mailOptions: SendMailOptions = {
      // Use SendMailOptions type here
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Activación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://finwise-app.vercel.app/icons/icon.svg" alt="Logo" style="max-width: 120px;" />
            </div>

            <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Activa tu Cuenta</h2>

            <p style="font-size: 16px; line-height: 1.5; color: #555;">Hola ${user.first_name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.BASE_URL}/activate-account?token=${token}"
                 style="padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
                Activar Cuenta
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #555;">El enlace es válido por 24 horas.</p>

            <p style="font-size: 14px; line-height: 1.5; color: #777; text-align: center; margin-top: 40px;">
              Si tienes problemas con el enlace, copia y pega esta URL en tu navegador:
              <br />
              <a href="${process.env.BASE_URL}/activate-account?token=${token}" style="color: #1976d2;">${process.env.BASE_URL}/activate-account?token=${token}</a>
            </p>

            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 14px; color: #888;">Si no solicitaste esta activación, por favor ignora este mensaje.</p>
              <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </div>
      `,
    };

    // Envía el correo electrónico utilizando la función privada para la gestión del transporte y envío.
    await this._sendEmail(user.email, mailOptions);
    return { message: "Correo de activación enviado." }; // Retorna un mensaje de éxito.
  }

  /**
   * Activa la cuenta del usuario utilizando un token de activación.
   *
   * @param token Token de activación de cuenta.
   * @returns Promesa que resuelve en un mensaje de éxito indicando que la cuenta ha sido activada.
   * @throws Error Si el token es inválido, ha expirado, o ya ha sido utilizado, o si falla la activación de la cuenta.
   */
  static async activateAccount(token: string) {
    // Busca el registro de activación en la base de datos utilizando el token.
    const activationRecord = await prisma.accountActivation.findUnique({
      where: { token },
    });

    // Lanza un error si no se encuentra el registro de activación (token inválido).
    if (!activationRecord) {
      throw new Error("Token inválido");
    }

    // Lanza un error si el token ya ha expirado.
    if (new Date() > activationRecord.expiresAt) {
      throw new Error("Token expirado");
    }

    // Lanza un error si el token ya ha sido utilizado previamente.
    if (activationRecord.used) {
      throw new Error("El token ya ha sido utilizado");
    }

    // Busca el usuario asociado al token de activación.
    const user = await prisma.user.findUnique({
      where: { id: activationRecord.userId },
    });

    // Lanza un error si no se encuentra el usuario asociado al token.
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Actualiza el estado de activación del usuario en la base de datos a true.
    await prisma.user.update({
      where: { id: user.id },
      data: { activated: true },
    });

    // Marca el token de activación como utilizado en la base de datos.
    await prisma.accountActivation.update({
      where: { token },
      data: { used: true },
    });

    return { message: "Cuenta activada con éxito" }; // Retorna un mensaje de éxito.
  }

  /**
   * Reenvía el correo electrónico de verificación de cuenta al usuario.
   *
   * @param email Correo electrónico del usuario al que se reenviará el correo de verificación.
   * @returns Promesa que resuelve en un mensaje de éxito indicando que un nuevo enlace de activación ha sido enviado.
   * @throws Error Si no se encuentra un usuario con el correo electrónico proporcionado, la cuenta ya está activada, o si falla el reenvío del correo.
   */
  static async resendVerificationEmail(email: string) {
    // Busca el usuario por correo electrónico o nombre de usuario.
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: email }],
      },
    });

    // Lanza un error si no se encuentra ningún usuario con el correo electrónico o nombre de usuario proporcionado.
    if (!user) {
      throw new Error("No se encontró un usuario con ese correo electrónico");
    }

    // Lanza un error si la cuenta del usuario ya está activada.
    if (user.activated) {
      throw new Error("La cuenta ya está activada");
    }

    // Busca el último token de activación expirado o no utilizado para este usuario.
    const expiredToken = await prisma.accountActivation.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Lanza un error si no se encuentra un token expirado para reenviar.
    if (!expiredToken) {
      throw new Error("No se encontró un token expirado para reenviar.");
    }

    // Genera un nuevo token de activación único y seguro.
    const newToken = crypto.randomBytes(32).toString("hex");

    // Crea un nuevo registro de activación en la base de datos con el nuevo token.
    await prisma.accountActivation.create({
      data: {
        token: newToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // El token expira en 24 horas
      },
    });

    // Define el contenido del correo electrónico de activación de cuenta (reutilizando el mismo template que sendAccountActivationEmail).
    const mailOptions: SendMailOptions = {
      // Use SendMailOptions type here
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Activación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://finwise-app.vercel.app/icons/icon.svg" alt="Logo" style="max-width: 120px;" />
            </div>

            <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Activa tu Cuenta</h2>

            <p style="font-size: 16px; line-height: 1.5; color: #555;">Hola ${user.first_name},</p>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.BASE_URL}/activate-account?token=${newToken}"
                 style="padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
                Activar Cuenta
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #555;">El enlace es válido por 24 horas.</p>

            <p style="font-size: 14px; line-height: 1.5; color: #777; text-align: center; margin-top: 40px;">
              Si tienes problemas con el enlace, copia y pega esta URL en tu navegador:
              <br />
              <a href="${process.env.BASE_URL}/activate-account?token=${newToken}" style="color: #1976d2;">${process.env.BASE_URL}/activate-account?token=${newToken}</a>
            </p>

            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 14px; color: #888;">Si no solicitaste esta activación, por favor ignora este mensaje.</p>
              <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </div>
      `,
    };

    // Envía el correo electrónico con el nuevo token de activación utilizando la función privada para la gestión de correos.
    await this._sendEmail(user.email, mailOptions);

    return { message: "Nuevo enlace de activación enviado a tu correo." }; // Retorna un mensaje de éxito.
  }

  /**
   * Función privada para encapsular la lógica de envío de correos electrónicos utilizando nodemailer.
   *
   * @param toEmail Correo electrónico del destinatario.
   * @param mailOptions Objeto con las opciones de correo para nodemailer (from, to, subject, html).
   * @private
   * @throws Error Si falla la configuración del transporte de correo o el envío del correo.
   */
  private static async _sendEmail(
    toEmail: string,
    mailOptions: SendMailOptions
  ) {
    // Use SendMailOptions type here
    try {
      // Configuración del transporte de correo electrónico utilizando Gmail como servicio.
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Utiliza variables de entorno para el usuario del correo emisor.
          pass: process.env.EMAIL_PASSWORD, // Utiliza variables de entorno para la contraseña del correo emisor.
        },
      });

      // Envía el correo electrónico con las opciones proporcionadas.
      await transporter.sendMail({ ...mailOptions, to: toEmail });
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email."); // Lanza un error genérico si falla el envío del correo.
    }
  }
}
