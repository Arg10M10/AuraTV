# Configuración Nativa de Android para Aura TV

Para que el 4K y el tráfico HTTP funcionen en el .apk, debes aplicar estos cambios en la carpeta `android/` generada por Capacitor:

## 1. AndroidManifest.xml
Ruta: `android/app/src/main/AndroidManifest.xml`

Añade los permisos y el atributo `networkSecurityConfig`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config">
        
        <activity ... />
    </application>
</manifest>
```

## 2. network_security_config.xml
Ruta: `android/app/src/main/res/xml/network_security_config.xml` (Créalo si no existe)

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">kytv.xyz</domain>
        <domain includeSubdomains="true">cdn-ky.com</domain>
    </domain-config>
</network-security-config>
```

## 3. Comandos para generar el APK:
1. `npm run build`
2. `npx cap sync`
3. `npx cap open android` (Usa Android Studio para generar el Signed APK)