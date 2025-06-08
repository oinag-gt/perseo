const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const { join } = require('path');

// Load environment variables
config({ path: '.env' });

const dataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'perseo',
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

module.exports = dataSource;