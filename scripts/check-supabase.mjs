import { readFile } from "node:fs/promises";

const envText = await readFile(new URL("../.env", import.meta.url), "utf8").catch(() => "");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map(([, name, value]) => [name, value.replace(/^["']|["']$/g, "")]),
);

const projectUrl = env.VITE_SUPABASE_URL;
const publicKey = env.VITE_SUPABASE_ANON_KEY;

if (!projectUrl || !publicKey || !projectUrl.startsWith("https://")) {
  console.error("Configuração incompleta: confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.");
  process.exitCode = 1;
} else {
  try {
    const health = await fetch(`${projectUrl.replace(/\/+$/, "")}/auth/v1/health`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
      signal: AbortSignal.timeout(15000),
    });
    console.log(`Supabase Auth: HTTP ${health.status}`);

    const stores = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/stores?select=id&limit=1`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
      signal: AbortSignal.timeout(15000),
    });
    console.log(`API de lojas: HTTP ${stores.status}`);
    if (!stores.ok) {
      console.error("A URL responde, mas a tabela pode não existir ou o acesso/API key precisa ser conferido.");
      process.exitCode = 1;
    } else {
      const rows = await stores.json();
      console.log(rows.length ? "Conexão e tabela stores estão prontas." : "Conexão e tabela stores estão prontas; ainda não há lojas cadastradas.");
    }

    const storeContacts = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/stores?select=id,email,address,latitude,longitude&limit=1`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
      signal: AbortSignal.timeout(15000),
    });
    console.log(`Campo de e-mail público das lojas: HTTP ${storeContacts.status}`);
    if (!storeContacts.ok) {
      console.error("Execute supabase/store-profile-and-review-stats.sql para habilitar contatos, endereços e localização pública das lojas.");
      process.exitCode = 1;
    }

    const reviewStats = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/store_review_stats?select=store_id,rating,review_count&limit=1`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
      signal: AbortSignal.timeout(15000),
    });
    console.log(`Resumo de avaliações das lojas: HTTP ${reviewStats.status}`);
    if (!reviewStats.ok) {
      console.error("Execute supabase/store-profile-and-review-stats.sql para atualizar as notas da vitrine.");
      process.exitCode = 1;
    }

    const categories = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/categories?select=slug&limit=20`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
      signal: AbortSignal.timeout(15000),
    });
    console.log(`API de categorias: HTTP ${categories.status}`);
    if (categories.ok) {
      const rows = await categories.json();
      console.log(rows.length ? "Categorias iniciais estão disponíveis." : "A tabela de categorias está vazia; execute finalize-existing-project.sql no SQL Editor.");
    }

    const serviceImages = await fetch(`${projectUrl.replace(/\/+$/, "")}/rest/v1/services?select=image_url&limit=0`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
      signal: AbortSignal.timeout(15000),
    });
    console.log(`Campo de fotos nos serviços: HTTP ${serviceImages.status}`);
    if (!serviceImages.ok) {
      console.log("Execute supabase/add-service-images.sql no SQL Editor para habilitar fotos de serviços.");
      process.exitCode = 1;
    }
  } catch {
    console.error("Não foi possível conectar ao Supabase. Confira a URL e a conexão de rede.");
    process.exitCode = 1;
  }
}
