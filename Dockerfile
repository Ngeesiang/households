FROM node:12.13-alpine

# Create app directory
ARG buildno
WORKDIR /usr/src/app
RUN echo "Build number: $buildno"

# Install my app dependencies
COPY package*.json ./
RUN npm i -g npm
RUN npm install
RUN npm install -g @nestjs/cli
RUN npm install pm2@latest -g

COPY . .
EXPOSE 3000
CMD [ "nest", "start", "-w" ]