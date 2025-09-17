"""
Modelos de dados para o sistema de busca
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Coordinates(BaseModel):
    """Coordenadas geográficas"""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")


class Place(BaseModel):
    """Modelo de um lugar"""
    id: str = Field(..., description="ID único do lugar")
    name: str = Field(..., description="Nome do lugar")
    address: str = Field("", description="Endereço completo")
    coordinates: Coordinates = Field(...,
                                     description="Coordenadas geográficas")
    distance: float = Field(..., ge=0, description="Distância em km")
    phone: Optional[str] = Field(None, description="Telefone")
    website: Optional[str] = Field(None, description="Website")
    rating: Optional[float] = Field(
        None, ge=0, le=5, description="Avaliação (0-5)")
    reviews: Optional[int] = Field(
        None, ge=0, description="Número de avaliações")
    price: Optional[str] = Field(None, description="Faixa de preço")
    open_state: Optional[str] = Field(
        None, description="Estado de funcionamento")
    source: str = Field(..., description="Fonte dos dados")
    category: Optional[str] = Field(None, description="Categoria do lugar")


class SearchRequest(BaseModel):
    """Requisição de busca"""
    query: str = Field(..., min_length=1, description="Termo de busca")
    coordinates: Coordinates = Field(..., description="Coordenadas do usuário")
    radius: int = Field(5, ge=1, le=50, description="Raio de busca em km")
    category: Optional[str] = Field(None, description="Categoria específica")
    use_cache: bool = Field(True, description="Usar cache")


class SearchResponse(BaseModel):
    """Resposta de busca"""
    success: bool = Field(..., description="Status da operação")
    data: List[Place] = Field(..., description="Lista de lugares encontrados")
    cached: bool = Field(False, description="Dados vieram do cache")
    source: str = Field(..., description="Fonte dos dados")
    total_results: int = Field(..., description="Total de resultados")
    query: str = Field(..., description="Query original")
    coordinates: Coordinates = Field(..., description="Coordenadas da busca")
    radius: int = Field(..., description="Raio usado na busca")


class AutocompleteRequest(BaseModel):
    """Requisição de autocomplete"""
    query: str = Field(..., min_length=1, description="Termo de busca")
    limit: int = Field(
        5, ge=1, le=20, description="Número máximo de sugestões")


class AutocompleteSuggestion(BaseModel):
    """Sugestão de autocomplete"""
    display_name: str = Field(..., description="Nome para exibição")
    coordinates: Coordinates = Field(..., description="Coordenadas")
    type: str = Field(..., description="Tipo do lugar")
    importance: float = Field(..., description="Importância (0-1)")


class AutocompleteResponse(BaseModel):
    """Resposta de autocomplete"""
    success: bool = Field(..., description="Status da operação")
    suggestions: List[AutocompleteSuggestion] = Field(
        ..., description="Lista de sugestões")
    query: str = Field(..., description="Query original")


class CategoryInfo(BaseModel):
    """Informações de uma categoria"""
    keywords: List[str] = Field(..., description="Palavras-chave da categoria")
    radius: int = Field(..., description="Raio padrão em km")
    priority: int = Field(..., description="Prioridade da categoria")


class CategoriesResponse(BaseModel):
    """Resposta com categorias disponíveis"""
    success: bool = Field(..., description="Status da operação")
    categories: Dict[str,
                     CategoryInfo] = Field(..., description="Categorias disponíveis")


class RateLimitInfo(BaseModel):
    """Informações de rate limiting"""
    remaining: int = Field(..., ge=0, description="Requisições restantes")
    limit: int = Field(..., ge=1, description="Limite total")
    reset_time: Optional[datetime] = Field(None, description="Tempo de reset")


class ErrorResponse(BaseModel):
    """Resposta de erro"""
    success: bool = Field(False, description="Status da operação")
    error: str = Field(..., description="Mensagem de erro")
    code: Optional[str] = Field(None, description="Código do erro")
    details: Optional[Dict[str, Any]] = Field(
        None, description="Detalhes adicionais")


class CacheStats(BaseModel):
    """Estatísticas do cache"""
    total_entries: int = Field(..., description="Total de entradas")
    active_entries: int = Field(..., description="Entradas ativas")
    expired_entries: int = Field(..., description="Entradas expiradas")
    category_stats: Dict[str,
                         int] = Field(..., description="Estatísticas por categoria")


class ClientStats(BaseModel):
    """Estatísticas do cliente"""
    client_id: str = Field(..., description="ID do cliente")
    hourly_requests: int = Field(..., description="Requisições na última hora")
    minute_requests: int = Field(...,
                                 description="Requisições no último minuto")
    hourly_remaining: int = Field(...,
                                  description="Requisições restantes na hora")
    minute_remaining: int = Field(...,
                                  description="Requisições restantes no minuto")
    endpoint_stats: Dict[str,
                         int] = Field(..., description="Estatísticas por endpoint")


class StatsResponse(BaseModel):
    """Resposta com estatísticas"""
    success: bool = Field(..., description="Status da operação")
    cache: CacheStats = Field(..., description="Estatísticas do cache")
    client: ClientStats = Field(..., description="Estatísticas do cliente")


class HealthCheck(BaseModel):
    """Verificação de saúde"""
    status: str = Field(..., description="Status do serviço")
    timestamp: float = Field(..., description="Timestamp da verificação")
    services: Dict[str, str] = Field(..., description="Status dos serviços")
