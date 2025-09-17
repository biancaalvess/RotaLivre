# Configuração de Chaves de API

## SerpAPI (Obrigatório)
Para usar o aplicativo RotaLivre com dados reais, você precisa de uma chave da SerpAPI.

### Como obter:
1. Acesse [https://serpapi.com/](https://serpapi.com/)
2. Crie uma conta gratuita
3. Obtenha sua chave de API

### Configuração:
Crie um arquivo `.env.local` na raiz do projeto com:

```bash
NEXT_PUBLIC_SERPAPI_KEY=sua_chave_aqui
```

## Google Maps API (Opcional)
Para funcionalidades futuras de navegação em tempo real.

### Como obter:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto
3. Ative a Maps JavaScript API
4. Crie credenciais de API

### Configuração:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

## OpenWeatherMap API (Opcional)
Para dados meteorológicos em tempo real.

### Como obter:
1. Acesse [OpenWeatherMap](https://openweathermap.org/api)
2. Crie uma conta gratuita
3. Obtenha sua chave de API

### Configuração:
```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=sua_chave_aqui
```

## Limites da Conta Gratuita SerpAPI:
- **100 consultas por mês** na conta gratuita
- **Consultas ilimitadas** com planos pagos
- **Suporte a múltiplos motores de busca**
- **Dados em tempo real** do Google Maps

## Funcionalidades Disponíveis com SerpAPI:
✅ Postos de gasolina próximos  
✅ Hospedagens (hotéis, pousadas, campings)  
✅ Oficinas mecânicas  
✅ Restaurantes e lanchonetes  
✅ Farmácias  
✅ Avaliações e comentários  
✅ Informações de contato  
✅ Coordenadas GPS precisas  
✅ Status de funcionamento  
✅ Preços (quando disponíveis)  
✅ Imagens e thumbnails  
