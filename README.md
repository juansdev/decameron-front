Antes de desplegar el Frontend:

* Tener NodeJS y NPM instalado (Por defecto NodeJS instala NPM).

Para desplegar el Frontend se debe hacer lo siguiente:

1. Abrir la consola CMD, ubicarse en la raíz del proyecto y ejecutar el siguiente comando como administrador:

- npm install

2. Clonar el .env.example, cambiar el nombre de la nueva copia a .env y actualizar el siguiente valor:

- REACT_APP_API_URL=http://localhost:8000 -> Dominio del Host y puerto en el que se encuentra desplegado el Backend

3. Levantar y poner a la escucha el Frontend:

- npm run start
