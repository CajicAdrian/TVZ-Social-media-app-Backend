import { parentPort, workerData } from 'worker_threads';
import { exec } from 'child_process';

// ✅ Extract data sent from main thread (command)
const { command, isWindows } = workerData;

// ✅ Execute the registry command
const fullCommand = isWindows ? command : `wine ${command}`;

exec(fullCommand, (error, stdout, stderr) => {
  if (error) {
    parentPort?.postMessage({ error: error.message });
    return;
  }
  if (stderr) {
    parentPort?.postMessage({ error: stderr.trim() });
    return;
  }

  // ✅ Send processed result back to main thread
  parentPort?.postMessage({ output: stdout.trim() });
});
