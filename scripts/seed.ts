import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import * as fs from 'fs';
import {db} from 'db/index';
import {sql} from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  const sqlFilePath = join(__dirname, '../db/seed.sql.data');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

  try {
    if (
      (await (
        await db.execute(sql.raw('select 1 from artist limit 1'))
      ).rowCount) === 1
    ) {
      console.log('Database already seeded.');
    } else {
      console.log('Seeding database...');
      await db.execute(sql.raw(sqlContent));
      console.log('✅ Seeding complete.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

await seed();
