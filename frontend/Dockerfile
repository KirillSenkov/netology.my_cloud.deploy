FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
