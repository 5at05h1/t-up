FROM node:16.20.1

WORKDIR /home

RUN apt-get update && apt-get install -y bash

RUN yarn global add expo-cli