import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { nombre, correo, telefono, motivo } = await request.json();

    // Validación básica
    if (!nombre || !correo || !telefono || !motivo) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si las credenciales de email están configuradas
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass || emailUser === 'tu-email@gmail.com' || emailPass === 'tu-app-password') {
      console.log('📧 Simulando envío de email - Credenciales no configuradas');
      console.log('Datos del contacto:', { nombre, correo, telefono, motivo });
      
      return NextResponse.json(
        { message: 'Mensaje recibido correctamente (modo desarrollo)' },
        { status: 200 }
      );
    }

    // Configurar el transportador de email (usando Gmail como ejemplo)
    // En producción, usa variables de entorno para las credenciales
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: 'marionrutkat@gmail.com', // Email de Marion Rutkat
      subject: `Nuevo contacto desde la web - ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px;">
            📧 Nuevo contacto desde la web
          </h2>
          
          <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0f766e; margin-top: 0;">Datos del contacto:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">👤 Nombre:</td>
                <td style="padding: 10px 0; color: #6b7280;">${nombre}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">📧 Email:</td>
                <td style="padding: 10px 0; color: #6b7280;">${correo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">📱 Teléfono:</td>
                <td style="padding: 10px 0; color: #6b7280;">${telefono}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #0f766e; margin-top: 0;">💬 Motivo del contacto:</h3>
            <p style="color: #374151; line-height: 1.6; white-space: pre-line;">${motivo}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              <strong>🕒 Fecha y hora:</strong> ${new Date().toLocaleString('es-ES', {
                timeZone: 'Europe/Madrid',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Este email fue enviado automáticamente desde el formulario de contacto de <strong>Agencia MKN</strong></p>
          </div>
        </div>
      `
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email enviado correctamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error detallado al enviar email:', error);
    console.error('Tipo de error:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Error desconocido');
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
