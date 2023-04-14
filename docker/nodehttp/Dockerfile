FROM node:latest

RUN apt-get update && apt-get install -y --no-install-recommends \
    nano \
    screen \
    htop \
    bash \
    dumb-init

# Entrypoint
COPY . /docker-files/
RUN chmod +x /docker-files/docker-entrypoint.sh
ENTRYPOINT ["/usr/bin/dumb-init", "--", "/docker-files/docker-entrypoint.sh"]

CMD ["bash", "-c", "node build/main/app.mjs"]
