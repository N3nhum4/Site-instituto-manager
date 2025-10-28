# Etapa 1: Usar uma imagem base do Node.js para instalar as dependências
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e instala os pacotes
COPY package*.json ./
RUN npm install --omit=dev

# Copia todos os arquivos do projeto
COPY . .

# Etapa 2: Criar a imagem final, mais leve
FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos necessários da etapa anterior
COPY --from=builder /app .

# Expõe a porta que o servidor usa
EXPOSE 3000

# Comando para iniciar o servidor
CMD [ "node", "server.js" ]