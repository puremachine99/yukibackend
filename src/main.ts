import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ aktifkan CORS dengan izin untuk frontend Next.js
  app.enableCors({
    origin: ['http://localhost:3000'], // bisa array atau "*"
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, // kalau kamu pakai cookie atau auth header
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
