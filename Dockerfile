# PrevsImob — imagem para servir o site estático (index.html, prever.html, etc.)
FROM nginx:1.27-alpine

# Remove config padrão e copia o site para a raiz do nginx
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost/ || exit 1
