import 'shared/env';
import {exec} from 'shared/exec';

console.log('Cleaning up resources...');

try {
  const replicaFile = process.env.ZERO_REPLICA_FILE ?? 'zero.db';
  exec(`rm -f ${JSON.stringify(replicaFile)}*`);
} catch (err) {
  console.info(err.message);
}

try {
  exec('docker rm -f ztunes');
} catch (err) {
  console.info(err.message);
}

console.log('Cleanup complete.');
