"""
API REST para o sistema de busca
"""
from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Optional, List, Dict, Any
import asyncio
from .search_engine import SearchEngine
from .rate_limiter import RateLimiter
from .config import SearchConfig

# Inicializar aplicação FastAPI
app = FastAPI(
    title="RotaLivre Search API",
    description="API de busca de lugares para motociclistas",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar serviços
search_engine = SearchEngine()
rate_limiter = RateLimiter()


def get_client_id(request: Request) -> str:
    """Extrai ID do cliente da requisição"""
    # Em produção, usar IP real ou token de autenticação
    client_ip = request.client.host
    return f"client_{client_ip}"


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "RotaLivre Search API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/search")
async def search_places(
    query: str = Query(..., description="Termo de busca"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: int = Query(5, description="Raio de busca em km"),
    category: Optional[str] = Query(None, description="Categoria específica"),
    use_cache: bool = Query(True, description="Usar cache"),
    request: Request = None
):
    """
    Busca lugares próximos
    """
    client_id = get_client_id(request)

    # Verificar rate limiting
    rate_check = rate_limiter.is_allowed(client_id, 'search')
    if not rate_check['allowed']:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "retry_after": rate_check['retry_after'],
                "limit": rate_check['limit']
            }
        )

    try:
        # Validar parâmetros
        if not -90 <= lat <= 90:
            raise HTTPException(status_code=400, detail="Latitude inválida")
        if not -180 <= lng <= 180:
            raise HTTPException(status_code=400, detail="Longitude inválida")
        if radius > SearchConfig.MAX_RADIUS:
            raise HTTPException(
                status_code=400,
                detail=f"Raio máximo permitido: {SearchConfig.MAX_RADIUS}km"
            )

        # Executar busca
        result = await search_engine.search_places(
            query=query,
            lat=lat,
            lng=lng,
            radius=radius,
            category=category,
            use_cache=use_cache
        )

        return {
            **result,
            "rate_limit": {
                "remaining": rate_check['remaining'],
                "limit": rate_check['limit']
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/search/category/{category}")
async def search_by_category(
    category: str,
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: Optional[int] = Query(None, description="Raio de busca em km"),
    request: Request = None
):
    """
    Busca lugares por categoria específica
    """
    client_id = get_client_id(request)

    # Verificar rate limiting
    rate_check = rate_limiter.is_allowed(client_id, 'search')
    if not rate_check['allowed']:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "retry_after": rate_check['retry_after'],
                "limit": rate_check['limit']
            }
        )

    try:
        result = await search_engine.search_by_category(category, lat, lng, radius)

        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])

        return {
            **result,
            "rate_limit": {
                "remaining": rate_check['remaining'],
                "limit": rate_check['limit']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/autocomplete")
async def get_autocomplete(
    query: str = Query(..., description="Termo de busca"),
    limit: int = Query(5, description="Número máximo de sugestões"),
    request: Request = None
):
    """
    Obtém sugestões de autocomplete
    """
    client_id = get_client_id(request)

    # Verificar rate limiting
    rate_check = rate_limiter.is_allowed(client_id, 'autocomplete')
    if not rate_check['allowed']:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "retry_after": rate_check['retry_after'],
                "limit": rate_check['limit']
            }
        )

    try:
        suggestions = await search_engine.get_autocomplete_suggestions(query, limit)

        return {
            "success": True,
            "suggestions": suggestions,
            "rate_limit": {
                "remaining": rate_check['remaining'],
                "limit": rate_check['limit']
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/categories")
async def get_categories():
    """
    Retorna categorias disponíveis
    """
    return {
        "success": True,
        "categories": SearchConfig.get_all_categories()
    }


@app.get("/stats")
async def get_stats(request: Request = None):
    """
    Retorna estatísticas do sistema
    """
    client_id = get_client_id(request)

    try:
        cache_stats = search_engine.get_cache_stats()
        client_stats = rate_limiter.get_client_stats(client_id)

        return {
            "success": True,
            "cache": cache_stats,
            "client": client_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.post("/cache/clear")
async def clear_cache(
    category: Optional[str] = Query(
        None, description="Categoria específica para limpar"),
    request: Request = None
):
    """
    Limpa cache do sistema
    """
    client_id = get_client_id(request)

    try:
        if category:
            cleared = search_engine.clear_cache(category)
            message = f"Cache da categoria '{category}' limpo. {cleared} entradas removidas."
        else:
            cleared = search_engine.clear_cache()
            message = f"Cache limpo. {cleared} entradas removidas."

        return {
            "success": True,
            "message": message,
            "cleared_entries": cleared
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/health")
async def health_check():
    """
    Verificação de saúde da API
    """
    return {
        "status": "healthy",
        "timestamp": asyncio.get_event_loop().time(),
        "services": {
            "search_engine": "active",
            "rate_limiter": "active",
            "cache": "active"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
