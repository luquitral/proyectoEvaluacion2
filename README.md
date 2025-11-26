# 404store - Aplicación Web de E-commerce

Esta es una aplicación web de una tienda en línea llamada **404store**, creada con React y Vite. La aplicación utiliza un backend implementado en Xano para gestionar productos, pedidos y autenticación de usuarios.

## Repositorio en GitHub

El código fuente de esta aplicación se encuentra disponible en el siguiente repositorio de GitHub:
[luquitral/proyectoEvaluacion2](https://github.com/luquitral/proyectoEvaluacion2)

## Descripción General

404store es una plataforma de e-commerce que permite a los usuarios navegar por un catálogo de productos, agregarlos a un carrito de compras, y realizar pedidos. También cuenta con un panel de administración para gestionar el inventario y los pedidos.

## Pasos de Instalación y Ejecución

Para instalar y ejecutar el proyecto en un entorno de desarrollo local, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/luquitral/proyectoEvaluacion2.git
    cd proyectoEvaluacion2
    ```

2.  **Instala las dependencias:**
    El proyecto utiliza `npm` para la gestión de paquetes. Ejecuta el siguiente comando para instalar las dependencias necesarias:
    ```bash
    npm install
    ```
    Si `axios` no se instala correctamente, puedes instalarlo manualmente:
    ```bash
    npm install axios
    ```

3.  **Ejecuta la aplicación:**
    Una vez instaladas las dependencias, puedes iniciar el servidor de desarrollo con:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

4.  **Despliegue:**
    Este proyecto está configurado para ser desplegado en Firebase.

## Backend Utilizado y Endpoints

El backend de la aplicación está construido con **Xano**. A continuación se detallan los principales endpoints utilizados:

### API de la Tienda
-   **Productos:** `/product`, `/product/{product_id}`
-   **Imágenes:** `/upload/image`
-   **Pedidos:** `/order`, `/order/{order_id}`, `/order_product`
-   **Envío:** `/shipping`
-   **Carrito:** `/cart`, `/cart_product`, `/cart/{cart_id}`

### API de Autenticación
-   **Registro:** `/auth/signup`
-   **Login:** `/auth/login`
-   **Obtener usuario actual:** `/auth/me`

### API de Cuentas y Miembros
-   **Usuarios:** `/user`, `/user/{user_id}`
-   **Roles de usuario (Admin):** `/admin/user_role`
-   **Cuentas:** `/account`, `/account/details`, `/account/my_team_members`

## Usuarios de Prueba y Credenciales

Para facilitar la prueba de la aplicación, se han creado los siguientes usuarios con credenciales:

-   **Administrador:**
    -   **Email:** `admin@duocuc.cl`
    -   **Contraseña:** `1234`

-   **Usuario:**
    -   **Email:** `usuario@gmail.com`
    -   **Contraseña:** `1234`
