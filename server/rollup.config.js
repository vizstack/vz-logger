import typescript from '@wessberg/rollup-plugin-ts'

import pkg from './package.json'

export default {
  input: 'src/server.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      banner: '#!/usr/bin/env node',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [ 
    typescript(),
  ],
}