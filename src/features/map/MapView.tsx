import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// leaflet 기본 마커 아이콘 경로 수정 (vite 번들 이슈 해결)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export const sparkIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#C8FF3E;
    border:2px solid #111;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    width:28px;height:28px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "><span style="transform:rotate(45deg);font-size:13px;">⚡</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
})

export const myLocationIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#9B8FFF;
    border:3px solid white;
    border-radius:50%;
    width:16px;height:16px;
    box-shadow:0 0 0 4px rgba(155,143,255,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function FlyToCenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

export type MapPin = {
  id: string
  lat: number
  lng: number
  label?: string
  onClick?: () => void
}

type Props = {
  center?: [number, number]
  zoom?: number
  pins?: MapPin[]
  height?: string
  className?: string
  myLocation?: [number, number]
  flyTo?: [number, number]
}

export function MapView({
  center = [37.5283, 126.9342],
  zoom = 13,
  pins = [],
  height = '100%',
  className = '',
  myLocation,
  flyTo,
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className={className}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {flyTo && <FlyToCenter center={flyTo} zoom={zoom} />}
      {myLocation && (
        <Marker position={myLocation} icon={myLocationIcon}>
          <Popup>내 위치</Popup>
        </Marker>
      )}
      {pins.map(pin => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={sparkIcon}
          eventHandlers={{ click: pin.onClick }}
        >
          {pin.label && <Popup>{pin.label}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  )
}
