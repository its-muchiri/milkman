require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('./src/database/scripts/migrate.ts');