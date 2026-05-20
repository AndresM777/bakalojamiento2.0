# 🚀 Guía Maestra de Despliegue: AlojamientoMR en la Nube

Para una arquitectura de microservicios con **.NET 8** y **React**, la mejor combinación de servicios Cloud gratuitos/económicos y de alto rendimiento es:

1. **Bases de Datos (PostgreSQL):** Supabase
2. **Mensajería (RabbitMQ):** CloudAMQP
3. **Backend (.NET + Gateway):** Render (mediante contenedores Docker)
4. **Frontend (React + Vite):** Vercel

---

## 🏛️ 1. Bases de Datos — Supabase

Supabase te da bases de datos PostgreSQL reales en la nube. Tienes dos opciones:
* **Opción A (Ideal pero requiere 4 cuentas):** Crear 4 proyectos gratuitos separados en Supabase (uno por microservicio).
* **Opción B (Recomendada para ahorrar costos):** Crear **1 solo proyecto** en Supabase, y dentro de esa misma base de datos, correr los 4 scripts SQL. Supabase creará todas las tablas en el esquema `public`. Al ser tablas con nombres distintos (`Usuarios`, `Alojamientos`, etc.), no habrá conflictos y simplificará la cadena de conexión a 1 sola.

**Pasos:**
1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto.
2. Ve a la sección **SQL Editor** y ejecuta en orden tus scripts:
   - `1_Usuarios.sql`
   - `2_Alojamientos.sql`
   - `3_Reservas.sql`
   - `4_Facturacion.sql`
3. Ve a **Project Settings -> Database** y copia el **Connection string (URI)**.
   * *Asegúrate de cambiar `[YOUR-PASSWORD]` por la contraseña que creaste.*

---

## 🐇 2. Broker de Mensajería — CloudAMQP

Tus microservicios de **Reservas** y **Facturación** se comunican asíncronamente vía RabbitMQ.

**Pasos:**
1. Ve a [CloudAMQP](https://www.cloudamqp.com/) y regístrate.
2. Crea una nueva instancia seleccionando el plan gratuito **"Little Lemur"**.
3. Selecciona la región más cercana a donde desplegarás tu backend (ej. US East).
4. Al crearse, haz clic en la instancia y copia la **AMQP URL** (se verá como `amqps://usuario:password@servidor.rmq.cloudamqp.com/vhost`).

---

## ⚙️ 3. Backend y API Gateway — Render

Render es excelente para desplegar contenedores Docker de .NET. Necesitas desplegar **5 servicios web** separados en Render (4 Microservicios + 1 API Gateway).

> **Aviso de costos:** Render solo permite un servicio web gratuito encendido a la vez. Para 5 servicios, necesitarás un plan de pago o usar cuentas de desarrollador. Alternativa gratuita: Desplegar la solución monolítica del "Reto 1" si no quieres pagar por los 5 contenedores separados.

### Pasos para cada Microservicio (Usuarios, Alojamientos, Reservas, Facturación):
1. Sube tu código a un repositorio en **GitHub**.
2. Ve a [Render](https://render.com) y crea un **New -> Web Service**.
3. Selecciona tu repositorio de GitHub.
4. En **Language**, selecciona **Docker**.
5. En la sección **Docker Command / Dockerfile Path**, especifica la ruta del Dockerfile correspondiente, por ejemplo:
   - `AlojamientoPrototipo/Dockerfile.Usuarios`
   - `AlojamientoPrototipo/Dockerfile.Alojamientos`
6. En **Environment Variables**, configura las variables seguras (evita quemarlas en el `appsettings.json`):
   - `ConnectionStrings__ConexionUsuarios` = *[URI de Supabase]*
   - `RabbitMQ__Host` = *[Tu servidor de CloudAMQP]*
   - `RabbitMQ__Username` = *[Tu usuario de CloudAMQP]*
   - `RabbitMQ__Password` = *[Tu contraseña de CloudAMQP]*
   - `JwtSettings__SecretKey` = *[Una clave secreta larga de 32+ caracteres]*
   - **(Solo para Reservas)** `GrpcEndpoints__Alojamientos` = *[URL que te dio Render para el MS Alojamientos]*

### Pasos para el API Gateway:
1. Crea un nuevo **Web Service** en Render usando el Dockerfile del Gateway: `AlojamientoPrototipo/Dockerfile.ApiGateway`.
2. Una vez que los 4 microservicios estén desplegados y tengan sus URLs en Render (ej. `https://alojamientos-ms.onrender.com`), debes configurar las rutas en el Gateway.
3. Agrega las variables de entorno para decirle a YARP a dónde enrutar el tráfico:
   - `YarpConfig__Clusters__usuarios-cluster__Destinations__destination1__Address` = `https://usuarios-ms.onrender.com`
   - `YarpConfig__Clusters__alojamientos-cluster__Destinations__destination1__Address` = `https://alojamientos-ms.onrender.com`
   - *(Y así para el resto)*

### 🔒 IMPORTANTE: Arreglar el CORS en el Backend
Antes de subir el código, debes ir al `Program.cs` del API Gateway y asegurarte de que el CORS permita a Vercel conectarse:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("https://tu-frontend.vercel.app") // URL de Vercel
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

---

## 💻 4. Frontend — Vercel

Vercel es el estándar de la industria para aplicaciones React/Vite.

**Pasos:**
1. En tu código local, abre `booking-frontend/.env` (si no existe, créalo basado en `.env.example`).
2. Ve a [Vercel](https://vercel.com) y selecciona **Add New -> Project**.
3. Importa tu repositorio de GitHub.
4. Como tienes el frontend en una subcarpeta, abre **Framework Preset** y selecciona **Vite**.
5. En **Root Directory**, selecciona la carpeta `booking-frontend`.
6. En la sección **Environment Variables**, agrega:
   - Nombre: `VITE_API_BASE_URL`
   - Valor: `https://[URL-DE-TU-API-GATEWAY-EN-RENDER].onrender.com/api/v1`
7. Haz clic en **Deploy**.

Vercel compilará tu aplicación y te dará una URL en producción (ej. `https://alojamientomr.vercel.app`).

---

## 🎯 Flujo de Puesta en Marcha (El Orden Correcto)

Para que nada falle por dependencias en la nube, debes desplegar en este orden estricto:

1. **Supabase & CloudAMQP:** (Infraestructura base).
2. **Microservicios Base:** Despliega **Usuarios** y **Alojamientos** (no dependen de nadie más).
3. **Microservicios Dependientes:** Despliega **Reservas** (depende del gRPC de Alojamientos y RabbitMQ) y **Facturación** (depende de RabbitMQ).
4. **API Gateway:** Configúralo apuntando a las URLs de los 4 microservicios que ya desplegaste.
5. **Frontend (Vercel):** Por último, despliega React apuntando a la URL pública del API Gateway.

## 🛠️ Resumen de Reparto

| Componente | Plataforma | Tecnología | Costo |
|---|---|---|---|
| Frontend | **Vercel** | React + Vite | Gratis (Hobby Tier) |
| API Gateway | **Render** | .NET 8 YARP (Docker) | ~$7/mes o Gratis* |
| Microservicios | **Render** | .NET 8 Web API (Docker) | ~$7/mes c/u o Gratis* |
| Bases de Datos | **Supabase** | PostgreSQL + PostGIS | Gratis (2 proyectos max) |
| Bus de Eventos | **CloudAMQP**| RabbitMQ | Gratis (Little Lemur) |

> *\* Los planes gratuitos de Render se duermen tras 15 minutos de inactividad, lo que causa demoras de 50 segundos en la primera petición.*
