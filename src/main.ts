import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import pinoHttp from 'pino-http';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const server = app.getHttpAdapter().getInstance();

  server.use(require('body-parser').json({ limit: '50mb' }));
  server.use(require('body-parser').urlencoded({ limit: '50mb', extended: true }));

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  
  app.useGlobalPipes(new ValidationPipe({
  transform: true, 
  whitelist: true,
}));

  app.use(
    pinoHttp({
      genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),
    }),
  );

  app.use(helmet());
 app.enableCors({
  origin: true, // Esto refleja el origen de la petición, permitiendo cualquier cosa
  credentials: true,
});

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get('APP_NAME', 'SMTP Backend'))
    .setDescription('API for SMTP frontend (SMTP configs, contacts, templates, census, mail, history, reports, audit).')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}/${apiPrefix}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger on http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
