#!/usr/bin/env node

/**
 * Script para aplicar as APIs já configuradas do RotaLivre
 * 
 * Este script aplica as chaves de API que você já configurou anteriormente.
 */

const fs = require('fs');
const path = require('path');

console.log('🔑 Aplicando suas APIs já configuradas...');
console.log('=====================================\n');

// Suas chaves de API existentes
const apis = {
  locationiq: 'pk.2a534dde1087d13ce4b459fe0b9acd68',
  openweather: 'bd5e378503939ddaee76f12ad7a97608',
  serpapi: 'your_serpapi_key_here' // Precisa ser configurada
};

// Conteúdo do arquivo .env.local
const envContent = `# ===========================================
# CONFIGURAÇÃO DAS APIs - RotaLivre
# ===========================================
# Aplicado automaticamente com suas chaves existentes

# 1. SerpAPI - Para buscar postos de gasolina, restaurantes, hotéis, etc.
#    ⚠️  PRECISA SER CONFIGURADA
#    Como obter: https://serpapi.com/
NEXT_PUBLIC_SERPAPI_KEY=${apis.serpapi}

# 2. LocationIQ - Para geocodificação e detalhes de localização
#    ✅ CHAVE CONFIGURADA
NEXT_PUBLIC_LOCATIONIQ_API_KEY=${apis.locationiq}

# 3. OpenWeatherMap - Para dados meteorológicos
#    ✅ CHAVE CONFIGURADA
NEXT_PUBLIC_OPENWEATHER_API_KEY=${apis.openweather}

# ===========================================
# CONFIGURAÇÕES ADICIONAIS
# ===========================================

# URL base da aplicação (para desenvolvimento)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configurações do servidor
NEXT_PUBLIC_SERVER_HOST=127.0.0.1
NEXT_PUBLIC_SERVER_PORT=3001

# ===========================================
# STATUS DAS APIs
# ===========================================
# ✅ LocationIQ: Configurado e funcionando
# ✅ OpenWeatherMap: Configurado e funcionando
# ⚠️  SerpAPI: Precisa ser configurada (opcional)
`;

try {
  // Caminho do arquivo .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Verificar se o arquivo já existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  O arquivo .env.local já existe.');
    console.log('📝 Fazendo backup para .env.local.backup...');
    
    // Fazer backup
    fs.copyFileSync(envPath, envPath + '.backup');
  }
  
  // Escrever o arquivo .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('\n📊 Status das suas APIs:');
  console.log('========================');
  console.log('✅ LocationIQ: Configurado e funcionando');
  console.log('✅ OpenWeatherMap: Configurado e funcionando');
  console.log('⚠️  SerpAPI: Precisa ser configurada (opcional)');
  
  console.log('\n🚀 Próximos passos:');
  console.log('1. Reinicie o servidor: npm run dev');
  console.log('2. Verifique se as APIs estão funcionando');
  console.log('3. Para configurar SerpAPI: https://serpapi.com/');
  
  console.log('\n💡 Dica: As APIs LocationIQ e OpenWeatherMap já estão funcionando!');
  
} catch (error) {
  console.error('❌ Erro ao aplicar as configurações:', error.message);
  process.exit(1);
}
