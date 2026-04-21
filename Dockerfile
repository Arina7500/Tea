FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаём папку для публичных файлов
RUN mkdir -p app/public/css app/public/js

EXPOSE 3000

CMD ["npm", "run", "dev"]