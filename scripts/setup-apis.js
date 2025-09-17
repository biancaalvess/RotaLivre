#!/usr/bin/env node

/**
 * Script de configuração automática das APIs para RotaLivre
 * 
 * Este script ajuda a configurar as APIs necessárias para o funcionamento
 * completo do aplicativo RotaLivre.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 Configuração das APIs - RotaLivre');
console.log('=====================================\n');

async function setupAPIs() {
  try {
    // Verificar se o arquivo .env.local já existe
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);
    
    if (envExists) {
      const overwrite = await question('⚠️  O arquivo .env.local já existe. Deseja sobrescrever? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Configuração cancelada.');
        process.exit(0);
      }
    }

    console.log('\n📋 Vamos configurar as APIs necessárias:\n');

    // SerpAPI
    console.log('1️⃣  SerpAPI - Para buscar locais (postos, restaurantes, hotéis, etc.)');
    console.log('   📍 Acesse: https://serpapi.com/');
    console.log('   💰 Plano gratuito: 100 pesquisas/mês\n');
    
    const serpApiKey = await question('   Digite sua chave SerpAPI (ou pressione Enter para pular): ');
    
    // LocationIQ
    console.log('\n2️⃣  LocationIQ - Para geocodificação e detalhes de localização');
    console.log('   📍 Acesse: https://locationiq.com/');
    console.log('   💰 Plano gratuito: 5.000 requests/dia\n');
    
    const locationIqKey = await question('   Digite sua chave LocationIQ (ou pressione Enter para pular): ');
    
    // OpenWeatherMap
    console.log('\n3️⃣  OpenWeatherMap - Para dados meteorológicos');
    console.log('   📍 Acesse: https://openweathermap.org/api');
    console.log('   💰 Plano gratuito: 1.000 requests/dia\n');
    
    const openWeatherKey = await question('   Digite sua chave OpenWeatherMap (ou pressione Enter para pular): ');

    // Criar conteúdo do arquivo .env.local
    const envContent = `# ===========================================
# CONFIGURAÇÃO DAS APIs - RotaLivre
# ===========================================
# Configurado automaticamente em ${new Date().toISOString()}
#

# 1. SerpAPI - Para buscar postos de gasolina, restaurantes, hotéis, etc.
NEXT_PUBLIC_SERPAPI_KEY=${serpApiKey || 'your_serpapi_key_here'}

# 2. LocationIQ - Para geocodificação e detalhes de localização
NEXT_PUBLIC_LOCATIONIQ_API_KEY=${locationIqKey || 'your_locationiq_key_here'}

# 3. OpenWeatherMap - Para dados meteorológicos
NEXT_PUBLIC_OPENWEATHER_API_KEY=${openWeatherKey || 'your_openweather_key_here'}

# URL base da aplicação (para desenvolvimento)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# INSTRUÇÕES
# ===========================================
# 
# 1. Reinicie o servidor de desenvolvimento após configurar as APIs:
#    npm run dev
#    ou
#    pnpm dev
# 
# 2. Verifique no console do navegador se as mensagens de aviso desapareceram
# 
# 3. Se preferir não usar APIs externas, deixe as chaves como estão
#    O sistema usará dados mock para desenvolvimento
`;

    // Escrever arquivo .env.local
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Arquivo .env.local criado com sucesso!');
    
    // Resumo da configuração
    console.log('\n📊 Resumo da configuração:');
    console.log('========================');
    console.log(`SerpAPI: ${serpApiKey ? '✅ Configurado' : '⚠️  Usando dados mock'}`);
    console.log(`LocationIQ: ${locationIqKey ? '✅ Configurado' : '⚠️  Usando dados mock'}`);
    console.log(`OpenWeatherMap: ${openWeatherKey ? '✅ Configurado' : '⚠️  Usando dados mock'}`);
    
    console.log('\n🚀 Próximos passos:');
    console.log('1. Reinicie o servidor de desenvolvimento');
    console.log('2. Verifique se as APIs estão funcionando');
    console.log('3. Consulte CONFIGURACAO_APIS.md para mais detalhes');
    
    if (!serpApiKey || !locationIqKey || !openWeatherKey) {
      console.log('\n💡 Dica: Você pode editar o arquivo .env.local a qualquer momento para adicionar as chaves das APIs.');
    }

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar configuração
setupAPIs();
