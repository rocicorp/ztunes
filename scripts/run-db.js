import '@dotenvx/dotenvx/config';
import { execSync } from 'child_process';

const postgresPassword = process.env.POSTGRES_PASSWORD;

if (!postgresPassword) {
  console.error("Error: POSTGRES_PASSWORD is not set in the environment.");
  console.error("Please ensure it's defined in your .env file (or the file specified with -f to dotenvx).");
  process.exit(1);
}

try {
  console.log("Attempting to start existing Docker container 'ztunes'...");
  // The '-a' flag makes 'docker start' attach to the container's stdio and wait for it to stop.
  // If the container doesn't exist or fails to start, execSync will throw an error.
  execSync('docker start -a ztunes', { stdio: 'inherit' }); // 'inherit' uses the parent's stdio
  console.log("'ztunes' container started successfully.");
} catch (startError) {
  console.log("Could not start existing 'ztunes' container. This might be because it doesn't exist or an error occurred.");
  console.log("Attempting to run a new 'ztunes' container...");
  try {
    execSync(
      `docker run --name ztunes -e POSTGRES_PASSWORD=${postgresPassword} -p 5432:5432 postgres`,
      { stdio: 'inherit' }
    );
    console.log("New 'ztunes' container started successfully.");
  } catch (runError) {
    console.error("Failed to run a new 'ztunes' container.");
    console.error("Error details:", runError.message);
    process.exit(1);
  }
} 
