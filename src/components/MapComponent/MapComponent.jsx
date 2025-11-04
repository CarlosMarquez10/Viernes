// src/components/MapComponent/MapComponent.jsx
import React, { useRef, useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
// Usar assets de Leaflet desde CDN para evitar dependencia local
const markerIcon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const markerIcon2x = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const markerShadow = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
import './MapComponent.css';

const MapComponent = ({ clientData, relatedClientsData = {} }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Convierte GPS a Float
  const toCoords = (item) => [parseFloat(item.GPS_LATITUD), parseFloat(item.GPS_LONGITUD)];

  // Carga dinámica de Leaflet JS y CSS
  useEffect(() => {
    if (!mapContainer.current) return;
    if (window.L) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(link);
      setMapLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Inicializa el mapa con el cliente principal
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || mapInstance.current) return;
    const L = window.L;
    const center =
      clientData?.GPS_LATITUD && clientData?.GPS_LONGITUD
        ? toCoords(clientData)
        : [7.893122, -72.503491];
    mapInstance.current = L.map(mapContainer.current).setView(center, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);
  }, [mapLoaded, clientData]);

  // Dibuja marcadores cuando cambian datos
  useEffect(() => {
    if (!mapInstance.current) return;
    const L = window.L;

    // Elimina capa anterior
    if (mapInstance.current._markerGroup) {
      mapInstance.current.removeLayer(mapInstance.current._markerGroup);
    }
    const markers = L.layerGroup();

    // Create custom icons
    const originalClientIcon = new L.Icon({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'original-client-marker',
    });
    const relatedClientIcon = new L.Icon({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [20, 33],
      iconAnchor: [10, 33],
      popupAnchor: [1, -28],
      shadowSize: [33, 33],
      className: 'related-client-marker',
    });

    // Construye lista: cliente + relacionados
    const allClients = [];
    if (clientData) {
      allClients.push({ ...clientData, isOriginal: true });
    }
    if (Array.isArray(relatedClientsData.clientes)) {
      allClients.push(
        ...relatedClientsData.clientes.map((c) => ({ ...c, isOriginal: false }))
      );
    } else {
      if (relatedClientsData.menores)
        allClients.push(
          ...relatedClientsData.menores.map((c) => ({ ...c, isOriginal: false }))
        );
      if (relatedClientsData.mayores)
        allClients.push(
          ...relatedClientsData.mayores.map((c) => ({ ...c, isOriginal: false }))
        );
    }

    // Añade marcadores
    allClients.forEach((c) => {
      const [lat, lng] = toCoords(c);
      if (isNaN(lat) || isNaN(lng)) return;
      const icon = c.isOriginal ? originalClientIcon : relatedClientIcon;
      L.marker([lat, lng], { icon })
        .bindPopup(`<strong>${c.NOMBRE}</strong><br/>ID: ${c.CLIENTE_ID}`)
        .addTo(markers);
    });

    markers.addTo(mapInstance.current);
    mapInstance.current._markerGroup = markers;

    // Ajusta bounds para cubrir todos los puntos
    const latLngs = allClients
      .map((c) => toCoords(c))
      .filter(([la, lo]) => !isNaN(la) && !isNaN(lo));
    if (latLngs.length > 1) {
      mapInstance.current.fitBounds(latLngs, { padding: [50, 50] });
    }
  }, [clientData, relatedClientsData]);

  // Render con spinner hasta cargar
  return (
    <div className="map-card">
      <h3 className="map-title">Ubicación</h3>
      <div className="map-container" style={{ position: 'relative' }}>
        <div
          ref={mapContainer}
          className="map"
          style={{ visibility: mapLoaded ? 'visible' : 'hidden' }}
        />
        {!mapLoaded && (
          <div className="map-loading-inner" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)'}}>
            <LoadingSpinner size="medium" text="Cargando mapa..." />
          </div>
        )}
      </div>
      <div className="map-footer">
        <div className="coords-text">
          <strong>Coordenadas:</strong>{' '}
          {clientData?.GPS_LATITUD && clientData?.GPS_LONGITUD
            ? `${parseFloat(clientData.GPS_LATITUD)}, ${parseFloat(clientData.GPS_LONGITUD)}`
            : 'N/A'}
        </div>
        <button
          onClick={() => {
            const [lat, lng] = toCoords(clientData);
            const desc = encodeURIComponent(`${clientData.NOMBRE} - ${clientData.DIRECCION}`);
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${desc}`,
              '_blank'
            );
          }}
          className="route-button"
        >
          <span className="route-icon">📍</span>
          Cómo llegar
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
