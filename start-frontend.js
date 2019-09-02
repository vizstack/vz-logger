// Cross-platform way of calling 'npm run start' from 'frontend' directory.
const args = [ 'start' ];
const opts = { stdio: 'inherit', cwd: 'frontend', shell: true };
require('child_process').spawn('npm', args, opts);