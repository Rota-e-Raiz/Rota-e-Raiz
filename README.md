# Rota & Raiz

## API MVC de usuários (dados em memória)

Para executar a API de demonstração sem conectar ao banco de dados:

1. Copie `.env.example` para `.env` (a configuração local `PORT=3000` é suficiente para esta API).
2. Execute `npm install` e depois `npm run dev` (ou `npm start`).
3. Envie um `POST` para `http://localhost:3000/api/usuarios` com um corpo JSON, por exemplo `{"nome":"Ana","email":"ana@email.com"}`.
4. Consulte `http://localhost:3000/api/usuarios` com `GET` para listar os usuários cadastrados.

O controller mantém os dados somente na memória: eles são perdidos quando o servidor é reiniciado. A aplicação completa integrada ao MySQL continua disponível em `npm run dev:database` ou `npm run start:database`.

## Executar com MySQL local

1. Instale o Node.js e inicie o serviço MySQL do computador.
2. No CMD, na pasta do projeto, copie `.env.example` para `.env` se ainda não existir.
3. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` no `.env`. Defina também `SESSION_SECRET` com uma chave aleatória de pelo menos 32 caracteres. Não compartilhe nem envie o `.env`.
4. Execute `npm install`, `npm run migrate` e depois `npm run start:database`.
5. Acesse `http://localhost:3000`. Para conferir o histórico, execute `npm run migrate:status`.

O esquema é mantido em arquivos SQL versionados dentro de `migrations/`. O runner cria `rr_migrations`, registra o checksum e horário de cada arquivo aplicado, serializa execuções concorrentes e rejeita alterações em migrações já aplicadas. O servidor também aplica migrações pendentes antes de começar a atender. A migração inicial usa `CREATE TABLE IF NOT EXISTS` e insere os restaurantes de demonstração sem substituir registros editados; tabelas antigas não são apagadas.

Endpoints principais: `/api/health`, `/api/auth/register`, `/api/auth/register-restaurante`, `/api/auth/login`, `/api/restaurantes`, `/api/destaques`, comentários e curtidas. A sessão usa cookie HttpOnly assinado; senhas são armazenadas com hash.

As solicitações de destaque e seus pagamentos ficam `pendentes`. Ainda não há integração com um provedor, portanto nenhuma cobrança é realizada e nenhum dado de cartão é coletado. Destaques só aparecem no carrossel após confirmação e ativação no banco.
