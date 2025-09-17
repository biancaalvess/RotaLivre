"""
Script para iniciar o servidor de busca com configurações otimizadas
"""
import os
import sys
import subprocess
from pathlib import Path


def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    try:
        import fastapi
        import uvicorn
        import aiohttp
        import requests
        print("✅ Dependências encontradas")
        return True
    except ImportError as e:
        print(f"❌ Dependência não encontrada: {e}")
        print("Execute: pip install -r requirements.txt")
        return False


def check_database():
    """Verifica se o banco de dados existe"""
    db_path = Path("data/moto_weather.db")
    if db_path.exists():
        print("✅ Banco de dados encontrado")
        return True
    else:
        print("⚠️  Banco de dados não encontrado, criando...")
        try:
            from setup import setup_database
            setup_database()
            print("✅ Banco de dados criado")
            return True
        except Exception as e:
            print(f"❌ Erro ao criar banco de dados: {e}")
            return False


def start_server():
    """Inicia o servidor"""
    print("🚀 Iniciando RotaLivre Search API...")
    print("=" * 50)

    # Verificar dependências
    if not check_dependencies():
        return False

    # Verificar banco de dados
    if not check_database():
        return False

    # Configurações do servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"

    print(f"📍 Host: {host}")
    print(f"🔌 Porta: {port}")
    print(f"🐛 Debug: {debug}")
    print(f"🌐 URL: http://{host}:{port}")
    print(f"📚 Docs: http://{host}:{port}/docs")
    print("=" * 50)

    try:
        # Iniciar servidor
        import uvicorn
        uvicorn.run(
            "api:app",
            host=host,
            port=port,
            reload=debug,
            log_level="info" if not debug else "debug",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        return False

    return True


def main():
    """Função principal"""
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Modo de teste
        print("🧪 Executando testes...")
        try:
            subprocess.run([sys.executable, "test_api.py"], check=True)
        except subprocess.CalledProcessError:
            print("❌ Testes falharam")
            return False
    else:
        # Modo servidor
        start_server()

    return True


if __name__ == "__main__":
    main()
