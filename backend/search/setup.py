"""
Script de configuração do sistema de busca
"""
import os
import sys
import sqlite3
from pathlib import Path


def setup_database():
    """Configura banco de dados para o sistema de busca"""
    print("🗄️  Configurando banco de dados...")

    # Criar diretório de dados se não existir
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)

    db_path = data_dir / "moto_weather.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Tabela de cache de busca
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cache_key TEXT UNIQUE NOT NULL,
            data TEXT NOT NULL,
            category TEXT,
            location TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        )
    ''')

    # Tabela de rate limiting
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Índices para performance
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_cache_key ON search_cache (cache_key)')
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_cache_expires ON search_cache (expires_at)')
    cursor.execute(
        'CREATE INDEX IF NOT EXISTS idx_rate_client ON rate_limits (client_id, endpoint, request_time)')

    conn.commit()
    conn.close()

    print("✅ Banco de dados configurado com sucesso!")


def setup_environment():
    """Configura variáveis de ambiente"""
    print("🔧 Configurando variáveis de ambiente...")

    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write("""# Configurações do RotaLivre Search API
HOST=0.0.0.0
PORT=8000
DEBUG=true

# APIs (opcional)
SERPAPI_KEY=your_serpapi_key_here
GOOGLE_MAPS_KEY=your_google_maps_key_here

# Banco de dados
DATABASE_URL=sqlite:///data/moto_weather.db
""")
        print("📄 Arquivo .env criado!")
    else:
        print("📄 Arquivo .env já existe!")


def install_dependencies():
    """Instala dependências Python"""
    print("📦 Instalando dependências...")

    import subprocess

    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)
        print("✅ Dependências instaladas com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False

    return True


def main():
    """Função principal de configuração"""
    print("🚀 Configurando RotaLivre Search Backend...")
    print("=" * 50)

    # Verificar se estamos no diretório correto
    if not Path("requirements.txt").exists():
        print("❌ Execute este script no diretório backend/search/")
        return

    # Configurar banco de dados
    setup_database()

    # Configurar ambiente
    setup_environment()

    # Instalar dependências
    if install_dependencies():
        print("\n" + "=" * 50)
        print("✅ Configuração concluída com sucesso!")
        print("\n🚀 Para iniciar o servidor:")
        print("   python main.py")
        print("\n📚 Para ver a documentação:")
        print("   http://localhost:8000/docs")
    else:
        print("\n❌ Erro na configuração. Verifique as dependências.")


if __name__ == "__main__":
    main()
