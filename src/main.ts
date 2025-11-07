import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ aktifkan validasi otomatis untuk semua DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // hapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // tolak input tidak valid
      transform: true, // otomatis ubah tipe (string → number)
    }),
  );

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000`);
}
bootstrap();
