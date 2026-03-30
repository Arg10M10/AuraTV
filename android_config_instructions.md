# Configuración Nativa de Android (Aura TV)

Sigue estos pasos en Android Studio para habilitar el 4K y saltar bloqueos:

## 1. Habilitar Tráfico HTTP (Cleartext)
Abre `android/app/src/main/AndroidManifest.xml` y añade:

```xml
<application
    ...
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

## 2. Archivo de Seguridad de Red
Crea `android/app/src/main/res/xml/network_security_config.xml` con este contenido:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

## 3. Comandos de Compilación
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android