import { exec } from '../shared/exec';

console.log('Cleaning up resources...');

try {
  exec('rm -f /tmp/zero-records.db*');
} catch (err) {
  console.info(err.message);
}

try {
  exec('docker rm -f zero-records');
} catch (err) {
  console.info(err.message);
}

console.log('Cleanup complete.');
