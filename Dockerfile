FROM node:18-alpine

WORKDIR /app

COPY nextjs_space/package.json nextjs_space/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY nextjs_space/ .

RUN yarn prisma generate

EXPOSE 3000

CMD ["sh", "-c", "yarn prisma db push --skip-generate && yarn dev"]
