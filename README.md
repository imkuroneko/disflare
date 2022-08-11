## Disflare

Pequeño bot utilitario para Discord para interactuar con la API de Cloudflare.


### 📚 Librerías Utilizadas
```
· @discordjs/rest
· axios
· cpu-stat
· discord.js
```

<br>

### 🧰 Que contiene
- Comandos (`/slash`) de uso "libres" (debes tener un rol para poder utilizarlos)
- Comandos administrativos: con el prefix que se defina

<br>

### 📋 Comandos slash
- actualizar_zonas (recuperar los dominios con sus IDs respectivos para guardar en un archivo JSON)
- cuenta (ver información de nuestra cuenta)
- listar_dns (ver los registros DNS del dominio indicado)
- purgar_cache (borrar toda la caché del dominio indicado)
- server (ver info del bot + host del bot)
- ver_estadisticas (ver el total de solicitudes hechas al dominio junto al total de recursos cacheados/no cacheados y ataques en los últimos 30 días)
- zonas (listar todos los dominios con sus IDs e información adicional)

<br>

### 📋 Comandos con prefix
- restartbot (si hace falta reiniciar el bot, lo hacemos con este comando)
- slashregister (registrar/actualizar los comandos slash de forma global para el bot)
- slashdeleter (eliminar los comandos slash registrados para el bot)

<br>

### 📚 Documentación
Próximamente 🦄

<br>

> _Bot hecho en menos de 6 horas durante un stream because YOLO_

-----

<p align="center">
  <img src="https://img.shields.io/github/repo-size/imkuroneko/disflare?style=flat"/> &nbsp;
  <img src="https://img.shields.io/github/languages/top/imkuroneko/disflare?style=flat"/> &nbsp;
  <img src="https://img.shields.io/github/last-commit/imkuroneko/disflare?color=pink&style=flat"/>
</p>

<p align="center">
  <a href="https://kuroneko.im" target="_blank">
    <img src="https://kuroneko.im/web_assets/favicon.png" width="120">
  </a>
</p>
