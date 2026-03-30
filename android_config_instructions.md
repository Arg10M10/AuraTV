# Configuración Nativa de Android (Aura TV)

Para que el CDN no bloquee los videos, debes aplicar estos cambios en Android Studio:

## 1. Habilitar User-Agent Personalizado (¡CRÍTICO!)
Abre `android/app/src/main/java/com/auratv/app/MainActivity.java` y configura el WebView:

```java
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onResume() {
    super.onResume();
    // Inyecta el User-Agent que pide el CDN para toda la app
    WebView webView = (WebView) this.getBridge().getWebView();
    WebSettings settings = webView.getSettings();
    settings.setUserAgentString("IPTVSmarters/1.0.0");
  }
}
```

## 2. Habilitar Tráfico HTTP (Cleartext)
Abre `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    ...
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

## 3. Archivo de Seguridad de Red
Crea `android/app/src/main/res/xml/network_security_config.xml`:

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

## 4. Sincronizar Cambios
```bash
npx cap sync android