import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';

// Script ejecutor del seeder mediante Nest standalone context
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.runSeed();
    console.log('✨ Seed completado con éxito.');
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
  } finally {
    await app.close();
  }
}

run();
