"""
Arquivo principal para executar o servidor de busca
"""
from api import app
import uvicorn
import os
import sys
from pathlib import Path

# Adicionar o diretório atual ao path para imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))


if __name__ == "__main__":
    # Configurações do servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"

    print(f"🚀 Iniciando RotaLivre Search API...")
    print(f"📍 Host: {host}")
    print(f"🔌 Porta: {port}")
    print(f"🐛 Debug: {debug}")
    print(f"🌐 URL: http://{host}:{port}")
    print(f"📚 Docs: http://{host}:{port}/docs")

    uvicorn.run(
        "api:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug"
    )
