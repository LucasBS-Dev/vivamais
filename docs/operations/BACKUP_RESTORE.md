# Backup e restauração

Supabase Free não inclui backup automático gerenciado. Antes de uma demo persistente, executar pg_dump criptografado para local privado fora do repositório; manter chave separada e retenção institucional definida. Somente dados sintéticos nesta etapa. Não copiar dump para outputs públicos ou Git.

Exemplo com cliente PostgreSQL 17, PGPASSFILE privado e variáveis de conexão no shell (sem senha na linha de comando):

```powershell
pg_dump --format=custom --no-owner --no-acl --file=<diretorio-privado>/viva.dump
# Criar banco isolado vazio previamente, com autorização local.
pg_restore --exit-on-error --no-owner --no-acl --dbname=viva_restore <diretorio-privado>/viva.dump
```

Para Compose local: `docker compose exec -T postgres pg_dump -U vivamais -d vivamais -Fc` pode ser transmitido como bytes por um script próprio, sem redirecionamento textual no Windows PowerShell 5 que pode corromper o arquivo binário. Preferir pg_dump no host ou `docker compose exec postgres pg_dump -U vivamais -d vivamais -Fc -f /tmp/viva.dump` seguido de `docker compose cp postgres:/tmp/viva.dump <diretorio-privado>/viva.dump`.

Verificação obrigatória antes de declarar restauração validada: Flyway history íntegro, contagem de organizações/pacientes/vínculos, login com nova sessão, permissões cruzadas negadas, auditoria presente. Invalidar sessões restauradas, pois backup inclui hashes de tokens antigos. Reiniciar API contra banco restaurado isolado; nunca apontar ensaio para produção. Registrar duração, tamanho, hash do dump e resultado, sem dados identificáveis. Teste real de backup/restore desta máquina só é declarado em STATUS quando executado.
