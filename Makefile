#
# Dckerized Node project using docker for mongo and redis
#

all: install test server generate

server: ;@echo "Starting Docker..."; \
	docker-compose rm -f; \
	docker-compose up -d;

test: ;@echo "Running Tests..."; \
	docker-compose run -e NODE_ENV=test web npm run test;

generate: ;@echo "Generating data..."; \
	CONTAINER_ID=$(shell docker-compose ps -q web); \
	docker exec -it $$CONTAINER_ID node generateData.js;

install: ;@echo "Installing Depenencies....."; \
	cd app/; \
	npm install