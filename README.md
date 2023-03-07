Sistema de Administración de Hoteles
====================================

Este sistema ha sido desarrollado en Laravel y tiene como objetivo permitir al gerente de operaciones hoteleras ingresar
y administrar información de los hoteles de la compañía. Además, permite asignar tipos de habitación y acomodaciones de
manera eficiente, respetando las reglas de validación establecidas.

Requerimientos
--------------

* Registrar información de hoteles, incluyendo sus datos tributarios básicos.
* Asignar tipos de habitación a los hoteles (Estándar, Junior y Suite).
* Validar las acomodaciones según el tipo de habitación asignada:
    * Estándar: Sencilla o Doble.
    * Junior: Triple o Cuádruple.
    * Suite: Sencilla, Doble o Triple.
* No permitir que la cantidad de habitaciones configuradas supere el máximo por hotel.
* Evitar la existencia de hoteles repetidos.
* No permitir tipos de habitaciones y acomodaciones repetidas para el mismo hotel.
* No permitir hotel con dirección repetidos en una misma ciudad.
* No permitir crear un hotel con un nombre y/o NIT que ya fue registrado.
* Cada Hotel debe tener un mínimo de 1 habitación y un máximo de 7 habitaciones.
* No requerir administradores para datos catálogos, como ciudades, tipos de habitación o acomodación.
* Asegurar la compatibilidad con portátiles de 15 y algunos casos de 13 pulgadas.
* La aplicación debe ser totalmente RESTful.

Requisitos de Despliegue
------------------------

Antes de desplegar el Frontend, asegúrese de cumplir con los siguientes requisitos:

* Tener NodeJS y NPM instalado (por defecto NodeJS instala NPM).

Pasos para Desplegar el Frontend
-------------------------------

1. Abrir la consola CMD, ubíquese en la raíz del proyecto y ejecute el siguiente comando como administrador:

`npm install`

2. Clonar el archivo `.env.example`, cambiar el nombre de la nueva copia a `.env` y actualizar el siguiente valor:

`REACT_APP_API_URL=http://localhost:8000`

* Este valor indica el dominio del Host y puerto en el que se encuentra desplegado el Backend.

3. Levante y ponga a la escucha el Frontend:

`npm run start`

* Este comando pondrá a la escucha el Frontend en el puerto 3000 por defecto.
