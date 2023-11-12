FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY pnpm*.yaml ./

# If you are building your code for production
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile

# Bundle app source
COPY . .

RUN rm .env
RUN mv .env.production .env

RUN npm run build

EXPOSE 40000

CMD [ "node", "build" ]
