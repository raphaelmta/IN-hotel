from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import json
import os
import re
import uvicorn
import jwt
from typing import Optional

# Arquivo JSON para armazenar dados
DATA_FILE = "hotel_data.json"

# Configurações de autenticação
SECRET_KEY = "infinity_hotel_secret_key_2024"
ALGORITHM = "HS256"
ADMIN_PASSWORD = "admin123"  # Em produção, use hash

# Estrutura padrão dos dados
DEFAULT_DATA = {
    "clientes": [],
    "quartos": [],
    "reservas": [],
    "hotelInfo": {
        "nome": "Infinity Hotel",
        "endereco": "Av. do Contorno, 6480 - Savassi, Belo Horizonte",
        "telefone": "(31) 3333-4444"
    }
}

# Funções para manipular JSON
def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_DATA)
        return DEFAULT_DATA
    
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        save_data(DEFAULT_DATA)
        return DEFAULT_DATA

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Funções de autenticação
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != "admin":
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Validações manuais
def validate_email(email):
    if not email:
        raise HTTPException(status_code=400, detail="Email é obrigatório")
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise HTTPException(status_code=400, detail="Formato de email inválido")
    return email.lower()

def validate_nome(nome):
    if not nome or len(nome.strip()) < 2:
        raise HTTPException(status_code=400, detail="Nome deve ter pelo menos 2 caracteres")
    if re.search(r'\d', nome):
        raise HTTPException(status_code=400, detail="Nome não pode conter números")
    if not re.match(r'^[a-zA-ZÀ-ÿ\s]+$', nome):
        raise HTTPException(status_code=400, detail="Nome deve conter apenas letras e espaços")
    return nome.strip().title()

def validate_telefone(telefone):
    if not telefone:
        raise HTTPException(status_code=400, detail="Telefone é obrigatório")
    
    phone = re.sub(r'\D', '', telefone)
    if len(phone) not in [10, 11]:
        raise HTTPException(status_code=400, detail="Telefone deve ter 10 ou 11 dígitos")
    
    if len(phone) == 10:
        return f"({phone[:2]}) {phone[2:6]}-{phone[6:]}"
    else:
        return f"({phone[:2]}) {phone[2:7]}-{phone[7:]}"

def validate_numero_quarto(numero):
    if not numero or len(numero.strip()) < 1:
        raise HTTPException(status_code=400, detail="Número do quarto é obrigatório")
    return numero.strip()

def validate_tipo_quarto(tipo):
    tipos_validos = ['Solteiro', 'Casal', 'Luxo', 'Suíte', 'Família']
    if tipo not in tipos_validos:
        raise HTTPException(status_code=400, detail=f"Tipo deve ser um dos: {', '.join(tipos_validos)}")
    return tipo

def validate_preco(preco):
    if not preco:
        raise HTTPException(status_code=400, detail="Preço é obrigatório")
    
    try:
        preco_str = str(preco).replace(',', '.')
        preco_float = float(preco_str)
        if preco_float <= 0:
            raise HTTPException(status_code=400, detail="Preço deve ser maior que zero")
        return f"{preco_float:.2f}"
    except ValueError:
        raise HTTPException(status_code=400, detail="Preço deve ser um número válido")

def validate_date(date_str):
    if not date_str:
        raise HTTPException(status_code=400, detail="Data é obrigatória")
    
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return date_str
    except ValueError:
        raise HTTPException(status_code=400, detail="Data deve estar no formato YYYY-MM-DD")

# FastAPI app
app = FastAPI(
    title="Infinity Hotel Management API",
    description="Sistema de gerenciamento do Infinity Hotel com acesso para clientes e administradores",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas de teste
@app.get("/")
def read_root():
    return {
        "message": "Infinity Hotel Management API está funcionando!",
        "status": "OK",
        "hotel": "Infinity Hotel",
        "version": "2.0.0",
        "features": ["Cliente Self-Service", "Admin Dashboard", "Gerenciamento Completo de Reservas"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Infinity Hotel Management API",
        "timestamp": datetime.now().isoformat()
    }

# ==================== AUTENTICAÇÃO ====================

@app.post("/api/admin/login")
def admin_login(credentials: dict):
    username = credentials.get("username", "")
    password = credentials.get("password", "")
    
    if username != "admin" or password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/admin/verify")
def verify_admin_token(current_user: str = Depends(verify_token)):
    return {"valid": True, "user": current_user}

# ==================== ROTAS PÚBLICAS (CLIENTE) ====================

@app.get("/api/public/hotel-info")
def get_public_hotel_info():
    data = load_data()
    return data.get("hotelInfo", DEFAULT_DATA["hotelInfo"])

@app.get("/api/public/quartos-disponiveis")
def get_quartos_disponiveis_public():
    data = load_data()
    quartos_em_servico = [q for q in data["quartos"] if q["status"]]
    return quartos_em_servico

@app.get("/api/public/quartos-disponiveis-periodo")
def get_quartos_disponiveis_periodo(check_in: str, check_out: str):
    data = load_data()
    
    # Validar datas
    validate_date(check_in)
    validate_date(check_out)
    
    # Verificar se check_out é depois de check_in
    if check_in >= check_out:
        raise HTTPException(status_code=400, detail="Data de check-out deve ser posterior ao check-in")
    
    # Quartos em serviço
    quartos_em_servico = [q for q in data["quartos"] if q["status"]]
    
    # Verificar conflitos
    quartos_disponiveis = []
    for quarto in quartos_em_servico:
        conflito = False
        for reserva in data["reservas"]:
            if (reserva["quarto_numero"] == quarto["numero"] and
                reserva["status"] != "Cancelada" and
                reserva["data_check_in"] < check_out and
                reserva["data_check_out"] > check_in):
                conflito = True
                break
        
        if not conflito:
            quartos_disponiveis.append(quarto)
    
    return quartos_disponiveis

@app.post("/api/public/cliente/cadastrar")
def cadastrar_cliente_public(cliente: dict):
    data = load_data()
    
    # Validações manuais
    nome = validate_nome(cliente.get("nome", ""))
    email = validate_email(cliente.get("email", ""))
    telefone = validate_telefone(cliente.get("telefone", ""))
    
    # Verificar se email já existe
    for c in data["clientes"]:
        if c["email"].lower() == email.lower():
            raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar novo cliente
    novo_cliente = {
        "id": str(len(data["clientes"]) + 1),
        "nome": nome,
        "email": email,
        "telefone": telefone,
        "created_at": datetime.now().isoformat(),
        "tipo": "cliente"
    }
    
    data["clientes"].append(novo_cliente)
    save_data(data)
    
    return {"message": "Cliente cadastrado com sucesso!", "cliente": novo_cliente}

@app.post("/api/public/reserva/criar")
def criar_reserva_public(reserva: dict):
    data = load_data()
    
    # Validações manuais
    cliente_email = validate_email(reserva.get("cliente_email", ""))
    quarto_numero = reserva.get("quarto_numero", "")
    data_check_in = validate_date(reserva.get("data_check_in", ""))
    data_check_out = validate_date(reserva.get("data_check_out", ""))
    
    if not quarto_numero:
        raise HTTPException(status_code=400, detail="Quarto é obrigatório")
    
    # Verificar se check_out é depois de check_in
    if data_check_in >= data_check_out:
        raise HTTPException(status_code=400, detail="Data de check-out deve ser posterior ao check-in")
    
    # Verificar se cliente existe
    cliente = next((c for c in data["clientes"] if c["email"].lower() == cliente_email.lower()), None)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado. Cadastre-se primeiro.")
    
    # Verificar se quarto existe e está em serviço
    quarto = next((q for q in data["quartos"] if q["numero"] == quarto_numero), None)
    if not quarto:
        raise HTTPException(status_code=404, detail="Quarto não encontrado")
    if not quarto["status"]:
        raise HTTPException(status_code=400, detail="Quarto fora de serviço")
    
    # Verificar disponibilidade do quarto
    for r in data["reservas"]:
        if (r["quarto_numero"] == quarto_numero and 
            r["status"] != "Cancelada" and
            r["data_check_in"] < data_check_out and
            r["data_check_out"] > data_check_in):
            raise HTTPException(status_code=400, detail="Quarto não disponível para as datas selecionadas")
    
    # Criar nova reserva
    nova_reserva = {
        "id": str(len(data["reservas"]) + 1),
        "cliente_id": cliente["id"],
        "quarto_numero": quarto_numero,
        "data_check_in": data_check_in,
        "data_check_out": data_check_out,
        "status": "Confirmada",
        "pago": False,
        "created_at": datetime.now().isoformat(),
        "cliente_nome": cliente["nome"],
        "quarto_tipo": quarto["tipo"],
        "origem": "cliente"
    }
    
    data["reservas"].append(nova_reserva)
    save_data(data)
    
    return {"message": "Reserva criada com sucesso!", "reserva": nova_reserva}

@app.get("/api/public/cliente/reservas/{email}")
def get_reservas_cliente(email: str):
    data = load_data()
    
    # Validar email
    email = validate_email(email)
    
    # Encontrar cliente
    cliente = next((c for c in data["clientes"] if c["email"].lower() == email.lower()), None)
    if not cliente:
        return []
    
    # Buscar reservas do cliente
    reservas_cliente = []
    for reserva in data["reservas"]:
        if reserva["cliente_id"] == cliente["id"]:
            # Encontrar quarto
            quarto = next((q for q in data["quartos"] if q["numero"] == reserva["quarto_numero"]), None)
            
            reserva_enriched = {
                **reserva,
                "cliente_nome": cliente["nome"],
                "quarto_tipo": quarto["tipo"] if quarto else "Quarto não encontrado",
                "quarto_preco": quarto["preco"] if quarto else "0.00"
            }
            reservas_cliente.append(reserva_enriched)
    
    return reservas_cliente

# ==================== ROTAS ADMINISTRATIVAS ====================

@app.get("/api/admin/dashboard/stats")
def get_admin_dashboard_stats(current_user: str = Depends(verify_token)):
    data = load_data()
    
    total_quartos = len(data["quartos"])
    quartos_disponiveis = len([q for q in data["quartos"] if q["status"]])
    total_clientes = len(data["clientes"])
    reservas_ativas = len([r for r in data["reservas"] if r["status"] != "Cancelada"])
    total_reservas = len(data["reservas"])
    reservas_pagas = len([r for r in data["reservas"] if r["pago"]])
    reservas_pendentes = len([r for r in data["reservas"] if not r["pago"] and r["status"] != "Cancelada"])
    
    ocupacao = 0
    if total_quartos > 0:
        ocupacao = round((reservas_ativas / total_quartos) * 100)
    
    return {
        "total_quartos": total_quartos,
        "quartos_disponiveis": quartos_disponiveis,
        "total_clientes": total_clientes,
        "reservas_ativas": reservas_ativas,
        "total_reservas": total_reservas,
        "reservas_pagas": reservas_pagas,
        "reservas_pendentes": reservas_pendentes,
        "ocupacao": ocupacao
    }

@app.get("/api/admin/clientes")
def get_admin_clientes(current_user: str = Depends(verify_token)):
    data = load_data()
    return data.get("clientes", [])

@app.post("/api/admin/clientes")
def create_admin_cliente(cliente: dict, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Validações manuais
    nome = validate_nome(cliente.get("nome", ""))
    email = validate_email(cliente.get("email", ""))
    telefone = validate_telefone(cliente.get("telefone", ""))
    
    # Verificar se email já existe
    for c in data["clientes"]:
        if c["email"].lower() == email.lower():
            raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar novo cliente
    novo_cliente = {
        "id": str(len(data["clientes"]) + 1),
        "nome": nome,
        "email": email,
        "telefone": telefone,
        "created_at": datetime.now().isoformat(),
        "tipo": "admin_created"
    }
    
    data["clientes"].append(novo_cliente)
    save_data(data)
    
    return novo_cliente

@app.put("/api/admin/clientes/{cliente_id}")
def update_admin_cliente(cliente_id: str, cliente: dict, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Validações manuais
    nome = validate_nome(cliente.get("nome", ""))
    email = validate_email(cliente.get("email", ""))
    telefone = validate_telefone(cliente.get("telefone", ""))
    
    # Encontrar cliente
    cliente_index = None
    for i, c in enumerate(data["clientes"]):
        if c["id"] == cliente_id:
            cliente_index = i
            break
    
    if cliente_index is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verificar se email já existe (exceto para o próprio cliente)
    for c in data["clientes"]:
        if c["email"].lower() == email.lower() and c["id"] != cliente_id:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Atualizar cliente
    data["clientes"][cliente_index].update({
        "nome": nome,
        "email": email,
        "telefone": telefone
    })
    
    save_data(data)
    return data["clientes"][cliente_index]

@app.delete("/api/admin/clientes/{cliente_id}")
def delete_admin_cliente(cliente_id: str, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Verificar se há reservas ativas
    reservas_ativas = [r for r in data["reservas"] if r["cliente_id"] == cliente_id and r["status"] != "Cancelada"]
    if reservas_ativas:
        raise HTTPException(status_code=400, detail="Não é possível excluir cliente com reservas ativas")
    
    # Remover cliente
    data["clientes"] = [c for c in data["clientes"] if c["id"] != cliente_id]
    save_data(data)
    
    return {"message": "Cliente excluído com sucesso"}

@app.get("/api/admin/quartos")
def get_admin_quartos(current_user: str = Depends(verify_token)):
    data = load_data()
    return data.get("quartos", [])

@app.post("/api/admin/quartos")
def create_admin_quarto(quarto: dict, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Validações manuais
    numero = validate_numero_quarto(quarto.get("numero", ""))
    tipo = validate_tipo_quarto(quarto.get("tipo", ""))
    preco = validate_preco(quarto.get("preco", ""))
    status = quarto.get("status", True)
    
    # Verificar se número já existe
    for q in data["quartos"]:
        if q["numero"] == numero:
            raise HTTPException(status_code=400, detail="Número do quarto já existe")
    
    # Criar novo quarto
    novo_quarto = {
        "numero": numero,
        "tipo": tipo,
        "preco": preco,
        "status": status,
        "created_at": datetime.now().isoformat()
    }
    
    data["quartos"].append(novo_quarto)
    save_data(data)
    
    return novo_quarto

@app.put("/api/admin/quartos/{numero}")
def update_admin_quarto(numero: str, quarto: dict, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Validações manuais
    novo_numero = validate_numero_quarto(quarto.get("numero", ""))
    tipo = validate_tipo_quarto(quarto.get("tipo", ""))
    preco = validate_preco(quarto.get("preco", ""))
    status = quarto.get("status", True)
    
    # Encontrar quarto
    quarto_index = None
    for i, q in enumerate(data["quartos"]):
        if q["numero"] == numero:
            quarto_index = i
            break
    
    if quarto_index is None:
        raise HTTPException(status_code=404, detail="Quarto não encontrado")
    
    # Atualizar quarto
    data["quartos"][quarto_index].update({
        "numero": novo_numero,
        "tipo": tipo,
        "preco": preco,
        "status": status
    })
    
    save_data(data)
    return data["quartos"][quarto_index]

@app.delete("/api/admin/quartos/{numero}")
def delete_admin_quarto(numero: str, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Verificar se há reservas ativas
    reservas_ativas = [r for r in data["reservas"] if r["quarto_numero"] == numero and r["status"] != "Cancelada"]
    if reservas_ativas:
        raise HTTPException(status_code=400, detail="Não é possível excluir quarto com reservas ativas")
    
    # Remover quarto
    data["quartos"] = [q for q in data["quartos"] if q["numero"] != numero]
    save_data(data)
    
    return {"message": "Quarto excluído com sucesso"}

@app.get("/api/admin/reservas")
def get_admin_reservas(current_user: str = Depends(verify_token)):
    data = load_data()
    reservas_enriched = []
    
    for reserva in data["reservas"]:
        # Encontrar cliente
        cliente = next((c for c in data["clientes"] if c["id"] == reserva["cliente_id"]), None)
        cliente_nome = cliente["nome"] if cliente else "Cliente não encontrado"
        
        # Encontrar quarto
        quarto = next((q for q in data["quartos"] if q["numero"] == reserva["quarto_numero"]), None)
        quarto_tipo = quarto["tipo"] if quarto else "Quarto não encontrado"
        quarto_preco = quarto["preco"] if quarto else "0.00"
        
        reserva_enriched = {
            **reserva,
            "cliente_nome": cliente_nome,
            "quarto_tipo": quarto_tipo,
            "quarto_preco": quarto_preco
        }
        reservas_enriched.append(reserva_enriched)
    
    return reservas_enriched

@app.post("/api/admin/reservas")
def create_admin_reserva(reserva: dict, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Validações manuais
    cliente_id = reserva.get("cliente_id", "")
    quarto_numero = reserva.get("quarto_numero", "")
    data_check_in = validate_date(reserva.get("data_check_in", ""))
    data_check_out = validate_date(reserva.get("data_check_out", ""))
    
    if not cliente_id:
        raise HTTPException(status_code=400, detail="Cliente é obrigatório")
    if not quarto_numero:
        raise HTTPException(status_code=400, detail="Quarto é obrigatório")
    
    # Verificar se check_out é depois de check_in
    if data_check_in >= data_check_out:
        raise HTTPException(status_code=400, detail="Data de check-out deve ser posterior ao check-in")
    
    # Verificar se cliente existe
    cliente = next((c for c in data["clientes"] if c["id"] == cliente_id), None)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verificar se quarto existe e está em serviço
    quarto = next((q for q in data["quartos"] if q["numero"] == quarto_numero), None)
    if not quarto:
        raise HTTPException(status_code=404, detail="Quarto não encontrado")
    if not quarto["status"]:
        raise HTTPException(status_code=400, detail="Quarto fora de serviço")
    
    # Verificar disponibilidade do quarto
    for r in data["reservas"]:
        if (r["quarto_numero"] == quarto_numero and 
            r["status"] != "Cancelada" and
            r["data_check_in"] < data_check_out and
            r["data_check_out"] > data_check_in):
            raise HTTPException(status_code=400, detail="Quarto não disponível para as datas selecionadas")
    
    # Criar nova reserva
    nova_reserva = {
        "id": str(len(data["reservas"]) + 1),
        "cliente_id": cliente_id,
        "quarto_numero": quarto_numero,
        "data_check_in": data_check_in,
        "data_check_out": data_check_out,
        "status": "Confirmada",
        "pago": reserva.get("pago", False),
        "created_at": datetime.now().isoformat(),
        "cliente_nome": cliente["nome"],
        "quarto_tipo": quarto["tipo"],
        "origem": "admin"
    }
    
    data["reservas"].append(nova_reserva)
    save_data(data)
    
    return {"message": "Reserva criada com sucesso!", "reserva": nova_reserva}

@app.put("/api/admin/reservas/{reserva_id}/cancelar")
def cancel_admin_reserva(reserva_id: str, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Encontrar reserva
    reserva_index = None
    for i, r in enumerate(data["reservas"]):
        if r["id"] == reserva_id:
            reserva_index = i
            break
    
    if reserva_index is None:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    # Verificar se já está cancelada
    if data["reservas"][reserva_index]["status"] == "Cancelada":
        raise HTTPException(status_code=400, detail="Reserva já está cancelada")
    
    # Cancelar reserva
    data["reservas"][reserva_index]["status"] = "Cancelada"
    data["reservas"][reserva_index]["cancelled_at"] = datetime.now().isoformat()
    save_data(data)
    
    return {"message": "Reserva cancelada com sucesso"}

@app.put("/api/admin/reservas/{reserva_id}/pagamento")
def toggle_admin_payment(reserva_id: str, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Encontrar reserva
    reserva_index = None
    for i, r in enumerate(data["reservas"]):
        if r["id"] == reserva_id:
            reserva_index = i
            break
    
    if reserva_index is None:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    reserva = data["reservas"][reserva_index]
    
    # Verificar se pode alterar pagamento
    if reserva["status"] == "Cancelada" and not reserva["pago"]:
        raise HTTPException(status_code=400, detail="Não é possível marcar reserva cancelada como paga")
    
    # Alternar status de pagamento
    novo_status_pago = not reserva["pago"]
    data["reservas"][reserva_index]["pago"] = novo_status_pago
    
    if novo_status_pago:
        data["reservas"][reserva_index]["paid_at"] = datetime.now().isoformat()
    else:
        data["reservas"][reserva_index].pop("paid_at", None)
    
    save_data(data)
    
    return {"message": f"Reserva marcada como {'paga' if novo_status_pago else 'não paga'}"}

@app.delete("/api/admin/reservas/{reserva_id}")
def delete_admin_reserva(reserva_id: str, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Encontrar reserva
    reserva = next((r for r in data["reservas"] if r["id"] == reserva_id), None)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    # Verificar se pode excluir (apenas reservas canceladas ou muito antigas)
    if reserva["status"] != "Cancelada":
        # Verificar se é uma reserva futura
        check_in_date = datetime.strptime(reserva["data_check_in"], '%Y-%m-%d')
        if check_in_date > datetime.now():
            raise HTTPException(
                status_code=400, 
                detail="Não é possível excluir reserva ativa. Cancele primeiro."
            )
    
    # Remover reserva
    data["reservas"] = [r for r in data["reservas"] if r["id"] != reserva_id]
    save_data(data)
    
    return {"message": "Reserva excluída permanentemente do sistema"}

@app.put("/api/admin/reservas/{reserva_id}/reativar")
def reactivate_admin_reserva(reserva_id: str, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Encontrar reserva
    reserva_index = None
    for i, r in enumerate(data["reservas"]):
        if r["id"] == reserva_id:
            reserva_index = i
            break
    
    if reserva_index is None:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    reserva = data["reservas"][reserva_index]
    
    # Verificar se está cancelada
    if reserva["status"] != "Cancelada":
        raise HTTPException(status_code=400, detail="Apenas reservas canceladas podem ser reativadas")
    
    # Verificar se as datas ainda são válidas
    check_in_date = datetime.strptime(reserva["data_check_in"], '%Y-%m-%d')
    if check_in_date <= datetime.now():
        raise HTTPException(status_code=400, detail="Não é possível reativar reserva com data de check-in no passado")
    
    # Verificar disponibilidade do quarto novamente
    quarto_numero = reserva["quarto_numero"]
    data_check_in = reserva["data_check_in"]
    data_check_out = reserva["data_check_out"]
    
    for r in data["reservas"]:
        if (r["id"] != reserva_id and 
            r["quarto_numero"] == quarto_numero and 
            r["status"] != "Cancelada" and
            r["data_check_in"] < data_check_out and
            r["data_check_out"] > data_check_in):
            raise HTTPException(status_code=400, detail="Quarto não está mais disponível para as datas da reserva")
    
    # Reativar reserva
    data["reservas"][reserva_index]["status"] = "Confirmada"
    data["reservas"][reserva_index]["reactivated_at"] = datetime.now().isoformat()
    data["reservas"][reserva_index].pop("cancelled_at", None)
    save_data(data)
    
    return {"message": "Reserva reativada com sucesso"}

@app.get("/api/admin/hotel-info")
def get_admin_hotel_info(current_user: str = Depends(verify_token)):
    data = load_data()
    return data.get("hotelInfo", DEFAULT_DATA["hotelInfo"])

@app.put("/api/admin/hotel-info")
def update_admin_hotel_info(info: dict, current_user: str = Depends(verify_token)):
    data = load_data()
    
    # Validações manuais
    nome = validate_nome(info.get("nome", ""))
    endereco = info.get("endereco", "").strip()
    telefone = validate_telefone(info.get("telefone", ""))
    
    if not endereco:
        raise HTTPException(status_code=400, detail="Endereço é obrigatório")
    
    data["hotelInfo"] = {
        "nome": nome,
        "endereco": endereco,
        "telefone": telefone
    }
    save_data(data)
    return data["hotelInfo"]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
