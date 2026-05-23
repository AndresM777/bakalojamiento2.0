using Microsoft.EntityFrameworkCore;
using Alojamientos.DataAccess.Contexts;
using Alojamientos.API.Extensions;
using Alojamientos.API.Middleware;

// ── Forzar IPv4 — Render free tier no soporta IPv6 ───
AppContext.SetSwitch("System.Net.PreferIPv4Stack", true);
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ── 1. Base de datos ─────────────────────────────────
builder.Services.AddDbContext<AlojamientosDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ConexionAlojamientos"))
           .UseLowerCaseNamingConvention());

// ── 2. Dependencias de la Aplicación ─────────────────
builder.Services.AddApplicationServices();

// ── 3. Presentación (Controllers & gRPC) ───────────────
builder.Services.AddControllers();
builder.Services.AddGrpc();

// ── 4. Infraestructura Web (Swagger & CORS) ──────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCustomSwagger();
builder.Services.AddCustomCors();

var app = builder.Build();

// ── Pipeline ─────────────────────────────────────────

// Manejo Global de Excepciones
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger (siempre activo para el prototipo)
app.UseSwagger();
app.UseSwaggerUI();

// CORS
app.UseCors();

app.UseRouting();

// Mapeo de Controladores
app.MapControllers();

// gRPC Service
app.UseGrpcWeb(new GrpcWebOptions { DefaultEnabled = true });
app.MapGrpcService<Alojamientos.API.GrpcServices.CalendarioGrpcService>()
   .EnableGrpcWeb();

// ── Inicializar Datos Semilla ─────────────────────────
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<Alojamientos.DataAccess.Contexts.AlojamientosDbContext>();
    try
    {
        if (!context.TiposAlojamiento.Any())
        {
            context.TiposAlojamiento.AddRange(
                new Alojamientos.DataAccess.Entities.TipoAlojamientoEntity { Nombre = "Hotel", Descripcion = "Alojamiento con servicios" },
                new Alojamientos.DataAccess.Entities.TipoAlojamientoEntity { Nombre = "Hostal", Descripcion = "Alojamiento compartido" },
                new Alojamientos.DataAccess.Entities.TipoAlojamientoEntity { Nombre = "Apartamento", Descripcion = "Apartamento independiente" },
                new Alojamientos.DataAccess.Entities.TipoAlojamientoEntity { Nombre = "Cabaña", Descripcion = "Cabaña rústica" },
                new Alojamientos.DataAccess.Entities.TipoAlojamientoEntity { Nombre = "Casa", Descripcion = "Casa de vacaciones" }
            );
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error al inicializar la base de datos de Alojamientos: {ex.Message}");
    }
}

app.Run();
