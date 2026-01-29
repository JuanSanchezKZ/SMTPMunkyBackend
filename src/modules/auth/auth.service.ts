import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.bootstrapAdmin();
  }

  isAuthEnabled(): boolean {
    const mode = this.config.get<string>('AUTH_MODE', 'jwt');
    return mode !== 'none';
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken: token };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role };
  }

  private async bootstrapAdmin() {
    const email = this.config.get<string>('BOOTSTRAP_ADMIN_EMAIL');
    const password = this.config.get<string>('BOOTSTRAP_ADMIN_PASSWORD');
    if (!email || !password) return;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return;

    const hash = await bcrypt.hash(password, 12);
    await this.prisma.user.create({
      data: { email, passwordHash: hash, role: 'ADMIN' },
    });
  }
}
