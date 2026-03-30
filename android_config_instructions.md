# Configuración Nativa de Android (Aura TV)

Para que el CDN no bloquee los videos en tu app final, debes aplicar estos 3 cambios en Android Studio:

## 1. Habilitar User-Agent Personalizado (¡LO MÁS IMPORTANTE!)
El servidor `limitedcdn.com` solo deja pasar a apps que se identifiquen como reproductores. 
Abre `android/app/src/main/java/com/auratv/app/MainActivity.java` y añade este código:

```java
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onResume() {
    super.onResume();
    // Esto hace que toda tu app parezca un reproductor legal ante los CDNs
    WebView webView = (WebView) this.getBridge().getWebView();
    WebSettings settings = webView.getSettings();
    settings.setUserAgentString("IPTVSmarters/1.0.0");
  }
}
```

## 2. Habilitar Tráfico HTTP (Cleartext)
IPTV usa muchos links `http`. Android los bloquea por defecto.
Abre `android/app/src/main/AndroidManifest.xml` y añade:

```xml
<application
    ...
    android:usesCleartextTraffic="true">
```

## 3. Sincronizar con Capacitor
Cada vez que cambies el código web, corre esto para que Android se entere:
```bash
npx cap sync android