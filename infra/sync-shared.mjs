import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
// pnpm injects local packages as physical copies because Windows sandboxes may deny symlinks.
// Copy only source/metadata of our two packages; never touch arbitrary dependencies.
for (const app of ['web', 'mobile']) {
  if (!existsSync(resolve(root, 'apps', app, 'node_modules'))) continue;
  for (const name of ['contracts', 'design-tokens']) {
    const source = resolve(root, 'packages', name);
    const target = resolve(root, 'apps', app, 'node_modules', '@viva', name);
    mkdirSync(target, { recursive: true });
    for (const file of ['src', 'package.json']) cpSync(resolve(source, file), resolve(target, file), { recursive: true });
  }
}
