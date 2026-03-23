# GPX Tracker

Aplicación web PWA para seguimiento GPS con rutas GPX.

## Características

✅ **Carga archivos GPX** - Importa rutas desde archivos
✅ **Mapa interactivo** - OpenStreetMap con controles táctiles
✅ **Seguimiento GPS en tiempo real** - Posición actualizada continuamente
✅ **Detección de salida de ruta** - Alertas cuando te alejas (vibración incluida)
✅ **Almacenamiento local** - Rutas guardadas en IndexedDB
✅ **Perfil de elevación** - Gráfico con estadísticas (distancia, ascenso, descenso)
✅ **UI tipo app nativa** - Botones flotantes, diseño móvil-first
✅ **Modo offline (PWA)** - Service Worker para uso sin conexión

## Estructura (Hexagonal simplificada)

```
src/
├── app/
│   └── map.js              # Infraestructura - Leaflet
├── domain/
│   └── route.js            # Modelo de dominio
├── services/
│   ├── gpxService.js       # Carga GPX
│   ├── geoService.js       # Seguimiento GPS
│   ├── routeTracker.js     # Detección salida de ruta
│   ├── storageService.js   # IndexedDB
│   └── elevationService.js # Parseo elevación
├── components/
│   ├── FloatingControls.jsx   # Botones flotantes
│   ├── RouteList.jsx          # Lista rutas guardadas
│   └── ElevationProfile.jsx   # Gráfico elevación
├── utils/
│   └── distance.js         # Cálculo distancias (Turf.js)
├── App.jsx
└── main.jsx
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre en móvil para GPS real: `http://<tu-ip>:5174`

## Uso

1. **Permite acceso a ubicación** cuando el navegador lo solicite
2. **Carga un GPX** con el botón 📂
3. **Visualiza el perfil** con el botón 📈 (aparece tras cargar ruta)
4. **Gestiona rutas guardadas** con el botón 📋
5. **Centra el mapa** en tu posición con el botón 🎯

### Indicadores de estado

- 🟢 **En ruta** - Estás dentro del margen (< 25m)
- 🟡 **Alejándote** - Advertencia (25-50m)
- 🔴 **Fuera de ruta** - Más de 50m (vibración)

## Tecnologías

- **Preact** - Framework UI ligero
- **Leaflet** - Mapas interactivos
- **Turf.js** - Cálculos geoespaciales
- **IndexedDB** - Almacenamiento local
- **Service Worker** - Modo offline

## Próximas mejoras

- [ ] Centrado automático continuo (seguir posición)
- [ ] Cacheo automático de tiles para offline completo
- [ ] Exportar estadísticas
- [ ] Modo oscuro
- [ ] Compartir rutas
