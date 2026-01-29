import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { SendEmailDto } from './dto';
import { MailService } from './mail.service';

@ApiTags('mail')
@Controller('mail')
@UseGuards(AuthGuardOptional)
export class MailController {
  constructor(private readonly mail: MailService) {}

  @ApiBearerAuth()
  @Post('send')
  send(@Body() dto: SendEmailDto) {
    return this.mail.send(dto);
  }
}
