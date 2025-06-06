import uvicorn

if __name__ == "__main__":
    print("🏨 Iniciando Infinity Hotel Management API...")
    print("📊 Sistema de armazenamento: JSON")
    print("🚀 Servidor rodando em: http://localhost:8000")
    print("📖 Documentação da API: http://localhost:8000/docs")
    print("🏨 Hotel: Infinity Hotel - Av. do Contorno, 6480 - Savassi, Belo Horizonte")
    print("✅ Versão simplificada - sem dependências complexas")
    
    # Executar com string de importação para evitar warning
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)