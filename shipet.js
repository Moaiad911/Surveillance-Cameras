const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const ROOT = path.join(os.homedir(), 'Downloads/graduation');

const services = [
  {
    name: '🤖 AI Service',
    cmd: 'uvicorn',
    args: ['working_api:app', '--host', '0.0.0.0', '--port', '8000'],
    cwd: path.join(ROOT, 'Real_world_Anomaly_Detection_in_Surveillance_Videos'),
    color: '\x1b[33m'
  },
  {
    name: '🔧 Backend',
    cmd: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(ROOT, 'Surveillance-Cameras/backend'),
    color: '\x1b[34m'
  },
  {
    name: '🌐 Frontend',
    cmd: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(ROOT, 'Surveillance-Cameras/frontend'),
    color: '\x1b[32m'
  }
];

const processes = [];

services.forEach(({ name, cmd, args, cwd, color }) => {
  console.log(`${color}Starting ${name}...\x1b[0m`);
  
  const proc = spawn(cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(`${color}[${name}]\x1b[0m ${data}`);
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(`${color}[${name}]\x1b[0m ${data}`);
  });

  proc.on('close', (code) => {
    console.log(`\x1b[31m${name} stopped (code: ${code})\x1b[0m`);
  });

  processes.push(proc);
});

console.log('\n\x1b[32m✅ All services starting!\x1b[0m');
console.log('   🤖 AI:       http://localhost:8000');
console.log('   🔧 Backend:  http://localhost:5000');
console.log('   🌐 Frontend: http://localhost:3000\n');
console.log('Press Ctrl+C to stop all\n');

process.on('SIGINT', () => {
  console.log('\nStopping all services...');
  processes.forEach(p => p.kill());
  process.exit();
});