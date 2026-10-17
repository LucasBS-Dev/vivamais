# Kit de correção do projeto Viva+

Este kit **não contém o projeto Viva+ já alterado**. Ele contém as referências e as instruções para que o Codex **corrija o código EXISTENTE**, preservando o trabalho já desenvolvido.

## Colocação no projeto

1. Faça um backup ou commit seguro da pasta do Viva+ atual.
2. Extraia o conteúdo DESTE ZIP dentro da **raiz do repositório Viva+**, sem apagar as pastas existentes. Isso adicionará `referencias_codex/` e `PROMPT_CODEX_PADRONIZACAO_E_FIDELIDADE_VIVA_MAIS.md`.
3. Abra a conversa do Codex que estava desenvolvendo o Viva+, mantendo **essa mesma pasta** como workspace.
4. Envie o comando abaixo.

```text
Leia integralmente PROMPT_CODEX_PADRONIZACAO_E_FIDELIDADE_VIVA_MAIS.md e siga as instruções.
As referências estão em referencias_codex/: o ZIP AgendAqui-main.zip é meu padrão de organização de código e os 36 recortes em telas/ e três montagens em prototipos/ são o padrão visual obrigatório.
Continue a partir do projeto Viva+ que já existe; não recomece nem apague funcionalidades prontas.
Comece agora pela auditoria do ZIP e do repositório, organize o projeto no padrão da referência, padronize identificadores em português e corrija visualmente as telas, comparando screenshots reais com os protótipos.
Preserve React Native/Expo, Next.js, Java/Spring Boot, PostgreSQL, segurança, integrações e hospedagem econômica. Rode os testes e continue implementando até concluir os fluxos.
```

## Avisos

- Screenshots são referências ilustrativas; suas imagens não são componentes editáveis separados.
- Estrutura e nome dos métodos do ZIP devem orientar a organização, não os critérios de segurança.
- Não adicione `referencias_codex/` ao aplicativo publicado nem exponha os arquivos de referência em URLs públicas por padrão.
- Nenhum destes arquivos altera automaticamente o código: é necessário que o Codex execute a refatoração.
