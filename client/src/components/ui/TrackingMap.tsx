import { useEffect, useRef } from 'react';

// Leaflet CSS is loaded globally - import it here dynamically
let leafletLoaded = false;

interface Props {
  bookingId: string;
  customerLocation: { lat: number; lng: number };
  technicianLocation: { lat: number; lng: number } | null;
  isStopped?: boolean;
}

export default function TrackingMap({
  bookingId,
  customerLocation,
  technicianLocation,
  isStopped,
}: Props) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const techMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  // Dynamically load leaflet & its CSS once
  useEffect(() => {
    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')).default;

      if (!mapInstanceRef.current && mapRef.current) {
        // Fix default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current, {
          center: [customerLocation.lat, customerLocation.lng],
          zoom: 14,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Customer home marker (blue)
        const homeIcon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:44px;height:44px;background:#2563eb;border-radius:50%;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <div style="background:#2563eb;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;margin-top:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">Your Home</div>
            </div>`,
          iconAnchor: [22, 44],
          popupAnchor: [0, -44],
        });

        L.marker([customerLocation.lat, customerLocation.lng], { icon: homeIcon }).addTo(map);

        mapInstanceRef.current = map;
      }

      // Add / update technician marker
      if (technicianLocation && !isStopped && mapInstanceRef.current) {
        const L2 = (await import('leaflet')).default;

        const techIcon = L2.divIcon({
          className: '',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;animation:bounce 1s infinite;">
              <div style="width:50px;height:50px;background:#16a34a;border-radius:50%;border:4px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.5);display:flex;align-items:center;justify-content:center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div style="background:#16a34a;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;margin-top:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">🔧 Technician</div>
            </div>`,
          iconAnchor: [25, 54],
          popupAnchor: [0, -54],
        });

        if (techMarkerRef.current) {
          techMarkerRef.current.setLatLng([technicianLocation.lat, technicianLocation.lng]);
        } else {
          techMarkerRef.current = L2.marker([technicianLocation.lat, technicianLocation.lng], { icon: techIcon })
            .addTo(mapInstanceRef.current);
        }

        // Draw / update a dashed line between technician and customer
        const latlngs: [number, number][] = [
          [technicianLocation.lat, technicianLocation.lng],
          [customerLocation.lat, customerLocation.lng],
        ];

        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs(latlngs);
        } else {
          routeLineRef.current = L2.polyline(latlngs, {
            color: '#16a34a',
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 8',
          }).addTo(mapInstanceRef.current);
        }

        // Pan map to midpoint
        const midLat = (technicianLocation.lat + customerLocation.lat) / 2;
        const midLng = (technicianLocation.lng + customerLocation.lng) / 2;
        mapInstanceRef.current.panTo([midLat, midLng]);
      }

      // When technician stops/arrives, remove marker + line and add "arrived" marker
      if (isStopped && mapInstanceRef.current) {
        const L3 = (await import('leaflet')).default;
        if (techMarkerRef.current) {
          mapInstanceRef.current.removeLayer(techMarkerRef.current);
          techMarkerRef.current = null;
        }
        if (routeLineRef.current) {
          mapInstanceRef.current.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
        // Add arrived marker
        const arrivedIcon = L3.divIcon({
          className: '',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:50px;height:50px;background:#16a34a;border-radius:50%;border:4px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.5);display:flex;align-items:center;justify-content:center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div style="background:#16a34a;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;margin-top:4px;white-space:nowrap;">✅ Arrived!</div>
            </div>`,
          iconAnchor: [25, 54],
        });
        L3.marker([customerLocation.lat, customerLocation.lng], { icon: arrivedIcon })
          .addTo(mapInstanceRef.current);
      }
    };

    loadLeaflet();
  }, [technicianLocation, isStopped]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        techMarkerRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .leaflet-container { font-family: inherit; }
      `}</style>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', borderRadius: '16px', zIndex: 0 }}
      />
    </>
  );
}
