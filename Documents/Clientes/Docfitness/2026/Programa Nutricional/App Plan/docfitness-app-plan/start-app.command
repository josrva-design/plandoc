#!/bin/bash

PROJECT_DIR="/Users/rivera/Documents/Clientes/Docfitness/2026/Programa Nutricional/App Plan/docfitness-app-plan"

# Verifica si el proyecto existe
if [ ! -d "$PROJECT_DIR" ]; then
  echo "ERROR: No se encontró el proyecto en $PROJECT_DIR"
  read -p "Presiona Enter para salir..."
  exit 1
fi

# Cambia al directorio del proyecto
cd "$PROJECT_DIR" || exit 1

# Abre una nueva ventana de Terminal y ejecuta el servidor
osascript <<'INNER'
tell application "Terminal"
  activate
  do script "cd \"/Users/rivera/Documents/Clientes/Docfitness/2026/Programa Nutricional/App Plan/docfitness-app-plan\" && npm run dev"
end tell
INNER

# Espera hasta que el servidor esté listo
while ! curl -s http://localhost:5173 > /dev/null 2>&1; do
  sleep 1
done

# Abre la app en el navegador predeterminado
open http://localhost:5173
