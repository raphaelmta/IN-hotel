# 🏨 Sistema de Gerenciamento do Infinity Hotel

<div align="center">

![Hotel](https://img.shields.io/badge/Hotel-Infinity%20Hotel-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-red)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

Sistema completo de gerenciamento para o **Infinity Hotel**, localizado na Av. do Contorno, 6480 - Savassi, Belo Horizonte.

[🚀 Demo](#demo) • [📦 Instalação](#instalação) • [📖 Documentação](#documentação) • [🤝 Contribuição](#contribuição)

</div>

## 🌟 Visão Geral

Sistema moderno de gerenciamento hoteleiro com interface web intuitiva, desenvolvido com **Python FastAPI** no backend e **Next.js** no frontend.

### ✨ Funcionalidades

- 🏨 **Dashboard** com estatísticas em tempo real
- 🛏️ **Gerenciamento de Quartos** (CRUD completo)
- 👥 **Gerenciamento de Clientes** (CRUD completo)
- 📅 **Sistema de Reservas** com validação de disponibilidade
- ⚙️ **Configurações do Hotel**
- 📊 **Relatórios e Estatísticas**
- 🔍 **Validações robustas** de dados
- 📱 **Interface responsiva**

## 🚀 Tecnologias

### Backend
- **Python 3.8+**
- **FastAPI** - Framework web moderno e rápido
- **JSON** - Armazenamento de dados
- **Uvicorn** - Servidor ASGI

### Frontend
- **Next.js 14+** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Lucide React** - Ícones

## 📦 Instalação

### Pré-requisitos

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)

### 1. Clone o Repositório

\`\`\`bash
git clone https://github.com/seu-usuario/IN-hotel       
cd IN-hotel
\`\`\`

### 2. Configuração do Backend

\`\`\`bash
# Navegar para o backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python run.py
\`\`\`

O backend estará rodando em: **http://localhost:8000**

### 3. Configuração do Frontend

\`\`\`bash
# Em um novo terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install --legacy-peer-deps

# Executar em modo desenvolvimento
npm run dev
\`\`\`

O frontend estará rodando em: **http://localhost:3000**

## 📖 Documentação

### API Endpoints

A documentação completa da API está disponível em: **http://localhost:8000/docs**

#### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Criar cliente |
| GET | `/api/quartos` | Listar quartos |
| POST | `/api/quartos` | Criar quarto |
| GET | `/api/reservas` | Listar reservas |
| POST | `/api/reservas` | Criar reserva |
| GET | `/api/dashboard/stats` | Estatísticas do dashboard |

### Estrutura do Projeto

\`\`\`
infinity-hotel-management/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── run.py               # Script de execução
│   ├── requirements.txt     # Dependências Python
│   └── hotel_data.json      # Dados (criado automaticamente)
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Dashboard principal
│   │   └── layout.tsx       # Layout da aplicação
│   ├── lib/
│   │   └── api.ts           # Cliente da API
│   └── package.json         # Dependências JavaScript
├── .gitignore               # Arquivos ignorados pelo Git
└── README.md                # Este arquivo
\`\`\`

## 🔧 Configuração

### Variáveis de Ambiente

O sistema não requer variáveis de ambiente para funcionar localmente, mas você pode configurar:

\`\`\`bash
# backend/.env (opcional)
API_HOST=0.0.0.0
API_PORT=8000
DATA_FILE=hotel_data.json
\`\`\`

### Dados Padrão

O sistema inicializa automaticamente com as informações do **Infinity Hotel**:

- **Nome**: Infinity Hotel
- **Endereço**: Av. do Contorno, 6480 - Savassi, Belo Horizonte
- **Telefone**: (31) 3333-4444

## 🧪 Testes

### Testar Backend

\`\`\`bash
cd backend
python -m pytest  # (quando implementado)
\`\`\`

### Testar Frontend

\`\`\`bash
cd frontend
npm test  # (quando implementado)
\`\`\`

## 🚀 Deploy

### Backend (Heroku/Railway)

\`\`\`bash
# Adicionar Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
\`\`\`

### Frontend (Vercel/Netlify)

\`\`\`bash
cd frontend
npm run build
\`\`\`

## 🤝 Contribuição

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. **Commit** suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. **Push** para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use mensagens de commit descritivas

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial* - [SeuGitHub](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Infinity Hotel pela oportunidade
- Comunidade FastAPI
- Comunidade Next.js
- Todos os contribuidores

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](#documentação)
2. Procure em [Issues existentes](https://github.com/seu-usuario/IN-hotel/issues)
3. Crie uma [Nova Issue](https://github.com/seu-usuario/IN-hotel/issues/new)

---

<div align="center">

**[⬆ Voltar ao topo](#-sistema-de-gerenciamento-do-infinity-hotel)**

Feito com ❤️ para o Infinity Hotel

</div>
\`\`\`

```text file="LICENSE"
MIT License

Copyright (c) 2024 Infinity Hotel Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
