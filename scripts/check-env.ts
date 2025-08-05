import * as fs from 'fs';
import {parse} from 'dotenv';

function checkEnvSync() {
  // Only check if .env.sample exists
  if (!fs.existsSync('.env.sample') || !fs.existsSync('.env')) {
    return;
  }

  try {
    const sampleContent = fs.readFileSync('.env.sample', 'utf8');
    const actualContent = fs.readFileSync('.env', 'utf8');

    const sampleKeys = new Set(Object.keys(parse(sampleContent)));
    const actualKeys = new Set(Object.keys(parse(actualContent)));

    const missing = sampleKeys.difference(actualKeys);
    const extra = actualKeys.difference(sampleKeys);

    if (missing.size > 0 || extra.size > 0) {
      console.error('❌ Environment files are out of sync:');
      if (missing.size > 0) {
        console.error('  Missing from .env:', [...missing].join(', '));
      }
      if (extra.size > 0) {
        console.error(
          '  Extra in .env (not in .env.sample):',
          [...extra].join(', '),
        );
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Could not check env file sync:', error);
    process.exit(1);
  }
}

checkEnvSync();
