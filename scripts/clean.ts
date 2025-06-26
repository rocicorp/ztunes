import {exec} from 'shared/exec';

console.log('Cleaning up resources...');

try {
  exec('rm -f /tmp/ztunes.db*');
} catch (err) {
  console.info(err.message);
}

try {
  exec('docker rm -f ztunes');
} catch (err) {
  console.info(err.message);
}

console.log('Cleanup complete.');
