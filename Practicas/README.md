# Practicas

## Descripción del proyecto

Este proyecto es una API backend desarrollada con Spring Boot para gestionar la autenticación de usuarios en una aplicación de veterinaria. Su objetivo principal es proporcionar un sistema seguro de registro e inicio de sesión para clientes o personal administrativo, usando JWT (JSON Web Tokens) para proteger las rutas y controlar el acceso a la aplicación.

La aplicación está enfocada en facilitar la creación de cuentas, el acceso seguro con credenciales, y la validación de usuarios mediante autenticación basada en roles y en tokens. Esto permite que la plataforma pueda escalar fácilmente hacia funcionalidades más avanzadas de gestión clínica, citas, historial médico y atención veterinaria.

## ¿De qué trata?

El proyecto simula un servicio de autenticación para un sistema veterinario, donde los usuarios pueden:

- registrarse con su correo y contraseña
- iniciar sesión de forma segura
- recibir un token JWT al autenticarse
- acceder a endpoints protegidos solo si están autorizados
- manejar usuarios con distintos roles dentro del sistema

Es una base sólida para construir una app completa de gestión veterinaria, donde la seguridad y la administración de usuarios sean una parte fundamental.

## Tecnologías utilizadas

- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (jjwt)
- Maven
- Docker / Docker Compose

## Funcionalidades principales

- Registro de usuarios
- Login con autenticación segura
- Generación y validación de tokens JWT
- Configuración de seguridad con CORS y rutas públicas/protegidas
- Persistencia de usuarios con base de datos PostgreSQL
- Base lista para integración con un frontend o servicios adicionales

## Ejecución

El stack completo (base de datos + API + frontend) se levanta desde la raíz del
repositorio:

```bash
docker compose up --build
```

Para ejecutar solo esta API con Maven, hay que invocarlo con `bash` porque
`mvnw` no tiene permiso de ejecución en el repo:

```bash
bash mvnw spring-boot:run
```

Ver el README de la raíz para el detalle de puertos, proxy y variables de
entorno.

## Objetivo general

Este proyecto busca demostrar cómo construir un backend seguro y modular para una aplicación de veterinaria, con una estructura limpia, autenticación moderna y capacidad de expansión para futuras funcionalidades del sistema.
