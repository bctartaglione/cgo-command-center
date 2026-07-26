# CGO Command Center

MVP da Central de Demandas do Centro de Gestão Operacional.

## O que já funciona

- Dashboard com indicadores operacionais
- Cadastro, edição e exclusão de demandas
- Filtros por texto, status, prioridade e filial
- Identificação automática de demandas atrasadas
- Ordenação por criticidade e atraso
- Exportação CSV
- Layout responsivo para computador e celular
- Persistência local no navegador (`localStorage`)
- Dados de demonstração restauráveis

## Executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Publicar na Vercel

1. Envie os arquivos para o repositório GitHub `bctartaglione/cgo-command-center`.
2. Na Vercel, selecione **Add New → Project**.
3. Importe o repositório.
4. Mantenha as configurações detectadas para Next.js.
5. Clique em **Deploy**.

Nesta primeira versão não existem variáveis de ambiente.

## Limitação desta versão

Os dados ficam salvos somente no navegador utilizado. Isso é intencional para validar fluxo, campos e usabilidade antes de contratar ou configurar banco de dados.

## Próxima etapa recomendada

- Supabase/PostgreSQL
- autenticação por usuário
- perfis de acesso
- histórico auditável
- anexos e evidências
- notificações e integrações
