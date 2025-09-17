#!/usr/bin/env node

/**
 * Script para testar a integração completa do sistema de busca
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const request = client.request(url, options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: response.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: response.statusCode, data: data });
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
    
    request.end();
  });
}

async function testBackendHealth() {
  log('\n🔍 Testando Backend...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      log('✅ Backend está funcionando', 'green');
      return true;
    } else {
      log(`❌ Backend retornou status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao conectar com backend: ${error.message}`, 'red');
    log('💡 Certifique-se de que o backend está rodando:', 'yellow');
    log('   cd backend/search && python run.py start', 'yellow');
    return false;
  }
}

async function testBackendSearch() {
  log('\n🔍 Testando Busca no Backend...', 'blue');
  
  try {
    const searchUrl = `${BACKEND_URL}/search?query=posto&lat=-23.5505&lng=-46.6333&radius=5`;
    const response = await makeRequest(searchUrl);
    
    if (response.status === 200 && response.data.success) {
      log(`✅ Busca funcionando - ${response.data.data.length} resultados`, 'green');
      return true;
    } else {
      log(`❌ Busca falhou: ${response.data.error || 'Erro desconhecido'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro na busca: ${error.message}`, 'red');
    return false;
  }
}

async function testBackendCategories() {
  log('\n🔍 Testando Categorias no Backend...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/categories`);
    
    if (response.status === 200 && response.data.success) {
      const categories = Object.keys(response.data.categories);
      log(`✅ Categorias funcionando - ${categories.length} categorias`, 'green');
      log(`   Categorias: ${categories.join(', ')}`, 'blue');
      return true;
    } else {
      log(`❌ Categorias falharam: ${response.data.error || 'Erro desconhecido'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro nas categorias: ${error.message}`, 'red');
    return false;
  }
}

async function testFrontendAPI() {
  log('\n🔍 Testando APIs do Frontend...', 'blue');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/search/categories`);
    
    if (response.status === 200 && response.data.success) {
      log('✅ API do frontend funcionando', 'green');
      return true;
    } else {
      log(`❌ API do frontend falhou: ${response.data.error || 'Erro desconhecido'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro na API do frontend: ${error.message}`, 'red');
    log('💡 Certifique-se de que o frontend está rodando:', 'yellow');
    log('   npm run dev', 'yellow');
    return false;
  }
}

async function testSearchAPI() {
  log('\n🔍 Testando API de Busca do Frontend...', 'blue');
  
  try {
    const searchUrl = `${FRONTEND_URL}/api/search?query=posto&lat=-23.5505&lng=-46.6333&radius=5`;
    const response = await makeRequest(searchUrl);
    
    if (response.status === 200 && response.data.success) {
      log(`✅ API de busca funcionando - ${response.data.data.length} resultados`, 'green');
      return true;
    } else {
      log(`❌ API de busca falhou: ${response.data.error || 'Erro desconhecido'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro na API de busca: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Teste de Integração - Sistema de Busca RotaLivre', 'bold');
  log('=' .repeat(60), 'blue');
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Backend Search', fn: testBackendSearch },
    { name: 'Backend Categories', fn: testBackendCategories },
    { name: 'Frontend API', fn: testFrontendAPI },
    { name: 'Frontend Search', fn: testSearchAPI }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;
    } catch (error) {
      log(`❌ Erro inesperado em ${test.name}: ${error.message}`, 'red');
    }
  }
  
  log('\n' + '=' .repeat(60), 'blue');
  log(`📊 Resultado: ${passed}/${total} testes passaram`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 Integração completa funcionando!', 'green');
    log('✅ Backend e frontend estão integrados corretamente', 'green');
    log('✅ Sistema de busca está operacional', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam', 'yellow');
    log('💡 Verifique os logs acima para mais detalhes', 'yellow');
  }
  
  log('\n📋 Próximos passos:', 'blue');
  log('1. Abra o frontend em http://localhost:3000', 'blue');
  log('2. Teste a barra de pesquisa', 'blue');
  log('3. Experimente os filtros', 'blue');
  log('4. Teste as categorias', 'blue');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
