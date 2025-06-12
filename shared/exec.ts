import { execSync, ExecSyncOptions } from 'child_process';

export function exec(command: string, options?: ExecSyncOptions) {
  console.log(`> ${command}`);
  return execSync(command, { stdio: 'inherit', ...options });
} 