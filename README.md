# generador-informes

Para generar instaladores, abrir **Actions → Generar instaladores → Run workflow**
en GitHub. También se generan al subir un tag que empiece por `v`.

Cada ejecución publica tres artifacts independientes:

| Artifact | Plataforma | Instalador |
| --- | --- | --- |
| `Generador-Informes-macOS-x64` | macOS Intel | `.dmg` |
| `Generador-Informes-macOS-arm64` | macOS Apple Silicon (M1 y posteriores) | `.dmg` |
| `Generador-Informes-Windows-x64` | Windows de 64 bits | `.exe` |

Descargar el artifact correspondiente desde la ejecución y extraer el ZIP para
obtener el instalador. Las compilaciones se guardan en `dist/installers` y los
instaladores de macOS se generan sin firma ni notarización de Apple.
