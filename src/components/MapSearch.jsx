import { useCallback, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px" };

export default function MapSearch({
  defaultCenter = { lat: 35.9132, lng: -79.0558 }, // Chapel Hill-ish
  defaultZoom = 12,
  onPlaceSelected, // (place, latLng) => void
}) {
  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(defaultCenter);
  const acRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const onLoadAuto = useCallback((ac) => { acRef.current = ac; }, []);
  const onPlace = useCallback(() => {
    const place = acRef.current?.getPlace();
    if (!place) return;
    const loc = place.geometry?.location;
    if (!loc) return;
    const latLng = { lat: loc.lat(), lng: loc.lng() };
    setCenter(latLng);
    setMarker(latLng);
    onPlaceSelected?.(place, latLng);
  }, [onPlaceSelected]);

  const mapOpts = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
  }), []);

  if (!isLoaded) return <div className="text-sm text-gray-600">Loading map…</div>;

  return (
    <div className="space-y-3">
      <Autocomplete onLoad={onLoadAuto} onPlaceChanged={onPlace}>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Search places…"
          type="text"
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={defaultZoom}
        options={mapOpts}
        onClick={(e) => {
          const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setMarker(latLng);
          setCenter(latLng);
          onPlaceSelected?.(null, latLng);
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}
