# PrevsImob v1.0.0 — imagem para servir o site estático (index.html, prever.html, etc.)
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="PrevsImob" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.source="https://github.com/kauaguerreiro/prevsimob"

# Remove o conteúdo padrão e copia apenas os arquivos do site (ver .dockerignore)
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost/ || exit 1
