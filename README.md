# Diario para Honey ♡

Esta versión está pensada para funcionar así:

- `/` → página pública que Honey puede visitar.
- `/admin/` → panel privado para escribir los mensajes diarios.
- GitHub Pages → hospeda la página.
- Supabase → guarda los mensajes y gestiona tu login.

## Por qué hace falta Supabase

GitHub Pages solo sirve archivos estáticos. Si el panel `/admin` guardara los
mensajes únicamente con JavaScript, los cambios quedarían en tu navegador y
Honey no los vería.

Supabase permite que al pulsar **Publicar mensaje**, el mensaje se guarde en
internet y aparezca automáticamente en la página pública.

---

# PASO 1 — Crear Supabase

1. Ve a https://supabase.com/
2. Crea una cuenta y un proyecto.
3. Abre `SQL Editor`.
4. Crea una consulta nueva.
5. Copia y ejecuta todo el contenido de `supabase-setup.sql`.

---

# PASO 2 — Crear tu usuario administrador

En Supabase:

1. Ve a `Authentication`.
2. Abre `Users`.
3. Crea tu usuario con tu email y una contraseña.
4. En la configuración de Authentication, desactiva los registros públicos
   (Signups) si no quieres que nadie más pueda crearse una cuenta.

El panel `/admin/` NO tiene botón de registro.

---

# PASO 3 — Configurar la web

En Supabase abre:

`Project Settings > API`

Necesitas:

- Project URL
- anon / public key

Abre `config.js` y cambia:

```js
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-ANON-KEY";
```

IMPORTANTE:
La `anon key` sí puede estar en una página web pública.
NUNCA pegues la `service_role` key.

---

# PASO 4 — Probar

Puedes abrir `index.html`, aunque para probar correctamente el login del admin
es mejor ejecutar la carpeta con un servidor local.

Si tienes Python:

```bash
python -m http.server 8080
```

Después visita:

- http://localhost:8080/
- http://localhost:8080/admin/

---

# PASO 5 — GitHub Pages

1. Crea un repositorio.
2. Sube TODOS estos archivos manteniendo la carpeta `admin`.
3. Ve a `Settings > Pages`.
4. `Deploy from a branch`.
5. Rama: `main`.
6. Carpeta: `/ (root)`.

Si usas un dominio personalizado como:

`https://pagina.com`

el administrador será:

`https://pagina.com/admin/`

Si usas la URL normal de un repositorio GitHub Pages:

`https://usuario.github.io/nombre-repo/`

el administrador será:

`https://usuario.github.io/nombre-repo/admin/`

---

# Uso diario

Entra a `/admin/`, inicia sesión y rellena:

- Número del día
- Título
- Mensaje

El panel también te deja:

- ver una vista previa,
- editar mensajes antiguos,
- borrar mensajes,
- sugerir automáticamente el siguiente número de día.

La página pública pone el mensaje más reciente destacado y debajo muestra
todos los días anteriores.
