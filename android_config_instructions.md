# Guía de Configuración Android (Aura TV - Nativo)

Sigue estos pasos en Android Studio para que el reproductor nativo funcione:

## 1. Habilitar Tráfico HTTP (Cleartext)
Abre `android/app/src/main/AndroidManifest.xml` y busca la etiqueta `<application>`. Añade el atributo `android:usesCleartextTraffic="true"`.

```xml
<application
    ...
    android:usesCleartextTraffic="true">
```

## 2. Permisos de Internet
Asegúrate de que estas líneas estén antes de `<application>` en el mismo archivo:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 3. Registrar el Plugin
En Capacitor 5+, esto suele ser automático, pero si falla, abre `MainActivity.java` y asegúrate de que el bridge esté correcto.

## 4. Sincronización
Corre este comando cada vez que cambies el código:
```bash
npx cap sync android