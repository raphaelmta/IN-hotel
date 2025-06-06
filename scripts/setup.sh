#!/bin/bash

echo "🏨 Configurando Infinity Hotel Management System..."

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Por favor, instale Python 3.8+"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+"
    exit 1
fi

echo "✅ Dependências do sistema verificadas"

# Configurar backend
echo "🐍 Configurando backend..."
cd backend

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Ambiente virtual criado"
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
echo "✅ Dependências do backend instaladas"

cd ..

# Configurar frontend
echo "⚛️ Configurando frontend..."
cd frontend

# Instalar dependências
npm install --legacy-peer-deps
echo "✅ Dependências do frontend instaladas"

cd ..

echo "🎉 Configuração concluída!"
echo ""
echo "Para executar o sistema:"
echo "1. Backend: cd backend && source venv/bin/activate && python run.py"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Acesse: http://localhost:3000"
