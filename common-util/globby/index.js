const globby = require('globby')
const path = require('path')

async function main() {
  const files = await globby(['**'], {
    cwd: path.join(process.cwd(), '../..'),
    onlyFiles: true,
    gitignore: true,
    ignore: [
      '**/node_modules/**',
      '**/.git/**',
      '**/build/**',
      '**/dist/**',
      '**/*lock*',
      '**/*.ico',
      '**/*.log*',
    ],
    dot: true
  })
  console.log(files)
}

main()
