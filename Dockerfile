FROM node:alpine

# Create app directory
RUN mkdir /server

# VOLUME ./app:/server
WORKDIR /server

COPY app /server

CMD npm start