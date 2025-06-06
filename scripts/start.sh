#!/bin/bash

echo "🚀 Iniciando Infinity Hotel Management System..."

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    else
        return 0
    fi
}

# Verificar portas
if ! check_port 8000; then
    echo "❌ Porta 8000 (backend) já está em uso"
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Porta 3000 (frontend) já está em uso"
    exit 1
fi

# Iniciar backend em background
echo "🐍 Iniciando backend..."
cd backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
sleep 3

# Verificar se backend está rodando
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend iniciado com sucesso"
else
    echo "❌ Falha ao iniciar backend"
    kill $BACKEND_PID
    exit 1
fi

# Iniciar frontend
echo "⚛️ Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "🎉 Sistema iniciado com sucesso!"
echo ""
echo "📊 Backend: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🖥️  Frontend: http://localhost:3000"
echo ""
echo "Para parar o sistema, pressione Ctrl+C"

# Aguardar interrupção
trap "echo '🛑 Parando sistema...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
