#!/usr/bin/env python3
"""
Script principal para executar o sistema de busca
"""
import os
import sys
import subprocess
from pathlib import Path


def main():
    """Função principal"""
    print("🚀 RotaLivre Search Backend")
    print("=" * 40)

    # Verificar se estamos no diretório correto
    if not Path("requirements.txt").exists():
        print("❌ Execute este script no diretório backend/search/")
        sys.exit(1)

    # Verificar argumentos
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "setup":
            print("🔧 Configurando sistema...")
            subprocess.run([sys.executable, "setup.py"])

        elif command == "test":
            print("🧪 Executando testes...")
            subprocess.run([sys.executable, "test_api.py"])

        elif command == "start":
            print("🚀 Iniciando servidor...")
            subprocess.run([sys.executable, "start_server.py"])

        elif command == "docker":
            print("🐳 Iniciando com Docker...")
            subprocess.run(["docker-compose", "up", "--build"])

        else:
            print_help()
    else:
        print_help()


def print_help():
    """Exibe ajuda"""
    print("""
Uso: python run.py [comando]

Comandos disponíveis:
  setup    - Configura o sistema (banco de dados, dependências)
  test     - Executa testes da API
  start    - Inicia o servidor
  docker   - Inicia com Docker Compose

Exemplos:
  python run.py setup
  python run.py test
  python run.py start
  python run.py docker
""")


if __name__ == "__main__":
    main()
