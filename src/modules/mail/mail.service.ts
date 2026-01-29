import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendEmailDto } from './dto';
import { SmtpConfigsService } from '../smtp-configs/smtp-configs.service';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class MailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smtpConfigs: SmtpConfigsService,
    private readonly uploads: UploadsService,
  ) {}

  async send(dto: SendEmailDto) {
    // 1. Buscamos la config (Brevo suele ser la última actualizada o por ID)
    const smtp = dto.smtpId 
      ? await this.prisma.smtpConfig.findUnique({ where: { id: dto.smtpId } })
      : await this.prisma.smtpConfig.findFirst({ orderBy: { updatedAt: 'desc' } });

    if (!smtp) throw new NotFoundException('No hay configuración de Brevo disponible');

    // 2. Obtenemos la API KEY (que guardaste en el campo de password)
    const apiKey = await this.smtpConfigs.getDecryptedPassword(smtp.id);
    if (!apiKey) throw new BadRequestException('Falta la API Key de Brevo');

    // 3. Procesamos destinatarios
    const toList = dto.to
      .split(/[,;\n]+/)
      .map((email) => ({ email: email.trim() }))
      .filter((e) => e.email);

    // 4. Procesamos adjuntos para el formato de Brevo
    const attachments = [];
    for (const a of dto.attachments || []) {
      let contentB64: string | undefined;
      
      if (a.storagePath) {
        const buffer = await this.uploads.readByPath(a.storagePath);
        contentB64 = buffer?.toString('base64');
      } else if (a.data || a.contentBase64) {
        const raw = (a.data ?? a.contentBase64) as string;
        contentB64 = raw.includes(',') ? raw.split(',')[1] : raw;
      }

      if (contentB64) {
        attachments.push({
          content: contentB64,
          name: a.name
        });
      }
    }

    // 5. Llamada a la API de Brevo
    let status: 'SENT' | 'FAILED' = 'SENT';
    let errMsg: string | null = null;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: smtp.name, email: smtp.username }, // username suele ser el email remitente
          to: toList,
          subject: dto.subject,
          htmlContent: dto.body,
          attachment: attachments.length ? attachments : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la API de Brevo');
      }
    } catch (err: any) {
      status = 'FAILED';
      errMsg = err?.message || 'Unknown error';
    }

    // 6. Registro en base de datos
    const record = await this.prisma.emailMessage.create({
  data: {
    to: toList.map(t => t.email).join(', '),
    // Campos que faltaban según el error de TS:
    cc: dto.cc ?? [], // Debe ser un array de strings según el DTO
    subject: dto.subject,
    body: dto.body,
    // Prisma espera que attachments sea compatible con el tipo Json definido
    attachments: dto.attachments ? JSON.parse(JSON.stringify(dto.attachments)) : [], 
    category: dto.category ?? 'GENERAL', // Asegúrate de pasar un valor por defecto o del DTO
    status,
    smtpProfileId: smtp.id,
    smtpProfileName: smtp.name,
  },
});

    return { success: status === 'SENT', id: record.id, error: errMsg };
  }
}