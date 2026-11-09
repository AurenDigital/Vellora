# Vellora

Marketplace mobile-first de beleza e bem-estar, com busca de profissionais, páginas de lojas, favoritos, cadastro de clientes e solicitação/gestão básica de agendamentos. O painel profissional inclui uma prévia da página pública, cadastro de serviços com imagens, edição e ocultação/reativação sem apagar o histórico de agendamentos.

## Executar localmente

1. Instale Node.js 20 ou superior.
2. Execute `npm install`.
3. Execute `npm run dev` e abra o endereço indicado pelo Vite.

Sem configuração do Supabase, a interface funciona em modo de demonstração e mantém os dados de exemplo e as alterações no armazenamento local deste navegador. O modo local não é multiusuário e não deve ser usado para dados de clientes em produção.

## Conectar ao Supabase

1. Crie um projeto Supabase e copie `.env.example` para `.env`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores do projeto.
3. Execute `supabase/schema.sql` e, em seguida, `supabase/appointment-availability.sql` no SQL Editor do projeto. O segundo script instala as validações da agenda, bloqueios, notificações e fluxo de propostas de novo horário.
4. Execute `supabase/service-engagement.sql` para instalar curtidas por cliente, avaliações vinculadas a serviços concluídos e o bucket protegido de fotos das avaliações. No schema atual esse script também pode ser executado com segurança, pois é incremental e idempotente.
5. Execute `supabase/store-profile-and-review-stats.sql` para habilitar contatos, endereço e coordenadas públicas das lojas, além do resumo atualizado de avaliações na página inicial.
6. Para permitir agendamento sem conta, habilite autenticação anônima no Supabase Auth. Curtidas e avaliações exigem uma conta cadastrada de cliente; profissionais e sessões anônimas não podem publicar essas ações. A avaliação fica disponível após a profissional marcar o agendamento como concluído.
7. Inicie novamente o Vite após configurar as variáveis.

O schema cria perfis, lojas, serviços, agenda, favoritos, avaliações, notificações, produtos e assinaturas, com políticas RLS. A restrição de exclusão no PostgreSQL evita reservas sobrepostas para uma mesma profissional. Não exponha a chave `service_role` no navegador.

Se você executou uma versão anterior do schema antes desta configuração, execute também `supabase/finalize-existing-project.sql` uma vez no SQL Editor para corrigir a política de perfil e carregar as categorias iniciais. Para projetos já existentes, execute somente as migrações incrementais necessárias; não execute novamente o schema completo.

Para atualizar um projeto já conectado à Vellora, execute `supabase/appointment-availability.sql` no SQL Editor. Até a aplicação dessa migração, login e navegação continuam disponíveis, mas a agenda com horários, bloqueios e propostas fica desativada e o painel informa que a migração está pendente.

Para atualizar um projeto já existente com curtidas, avaliações por serviço e fotos de avaliações, execute `supabase/service-engagement.sql` uma vez no SQL Editor. A migração substitui a política de avaliações para exigir um agendamento concluído do próprio cliente e cria as políticas RLS necessárias para curtidas e imagens.

Para habilitar os contatos e endereço públicos editáveis, exibir a média real das avaliações na página inicial e permitir que novas lojas salvem e-mail, telefone, WhatsApp e coordenadas durante o cadastro, execute `supabase/store-profile-and-review-stats.sql` uma vez no SQL Editor. A profissional pode capturar a localização da loja pelo navegador; esse ponto fica público para ordenar resultados por proximidade. A localização do cliente só é solicitada após ação explícita e suas coordenadas ficam armazenadas apenas no navegador.

Para adicionar fotos de serviços em um projeto Supabase configurado antes do campo `services.image_url`, execute uma vez `supabase/add-service-images.sql` no SQL Editor.

Para conceder acesso administrativo inicial, altere manualmente o perfil autorizado usando o SQL Editor do Supabase. A chave pública do cliente nunca pode promover uma conta a administradora.

## Produção

Execute `npm run build` para gerar a versão estática em `dist/` e publique-a em um host compatível com aplicações Vite. Configure as mesmas variáveis de ambiente de build e HTTPS para instalação PWA e service worker.
