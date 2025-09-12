import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get('DATABASE_URL');
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }
  
  const url = new URL(databaseUrl);
  
  return {
    type: 'mysql',
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
    synchronize: true,
    logging: configService.get('NODE_ENV') === 'development',
  } as TypeOrmModuleOptions;
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  url: process.env.DATABASE_URL || 'mysql://root@localhost:3306/game_platform',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
  logging: process.env.NODE_ENV === 'development',
};

export const dataSource = new DataSource(dataSourceOptions);