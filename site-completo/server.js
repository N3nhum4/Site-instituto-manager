const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Garante que o diretório 'data' exista
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Conecta ao banco de dados SQLite
const dbPath = path.join(dataDir, 'contacts.db');
const db = new sqlite3.Database(dbPath);

// Cria a tabela de contatos se ela não existir
db.serialize(() => {
  db.run('PRAGMA journal_mode=WAL;');
  db.run('PRAGMA foreign_keys=ON;');
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

const app = express();

// Middlewares de Segurança
app.use(helmet({ contentSecurityPolicy: false })); // CSP desabilitado para não bloquear imagens/estilos
app.use(cors()); // Permite requisições de outros domínios

// Limita o número de requisições para a API
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// Habilita o parse de JSON no corpo das requisições
app.use(express.json({ limit: '10kb' }));

// Servir os arquivos estáticos (HTML, CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, '.')));

// Rota da API para o formulário de contato
app.post('/api/contact', (req, res) => {
  const { name, email, phone = '', subject, message } = req.body || {};

  // Validações básicas
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  const stmt = db.prepare('INSERT INTO contacts (name, email, phone, subject, message, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(name, email, phone, subject, message, ip, userAgent, function(err) {
    if (err) {
      console.error('Erro ao inserir no banco de dados:', err);
      return res.status(500).json({ message: 'Erro ao salvar os dados.' });
    }
    res.status(201).json({ message: 'Contato recebido com sucesso!', id: this.lastID });
  });
});

// Rota para servir o index.html em qualquer outra requisição GET
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});