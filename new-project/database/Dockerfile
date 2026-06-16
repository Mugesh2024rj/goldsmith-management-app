FROM mysql:8.0
ENV MYSQL_ROOT_PASSWORD=2006
ENV MYSQL_DATABASE=goldsmith_db
COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY seed.sql /docker-entrypoint-initdb.d/02-seed.sql
EXPOSE 3306


