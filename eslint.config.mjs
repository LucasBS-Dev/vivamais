import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/.next/**', '**/.expo/**', '**/dist/**', '**/generated.ts', '**/next-env.d.ts', '**/expo-env.d.ts', 'referencias_codex/**', '.local/**', 'backend/**'] },
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] } },
  // Metro exige referências estáticas para incluir imagens locais no pacote nativo.
  { files: ['app/**/*.tsx', 'components/**/*.tsx'], rules: {'@typescript-eslint/no-require-imports':['error',{allow:['\\.png$']}] } },
);
