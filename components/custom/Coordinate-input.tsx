"use client";

import React from "react";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "leaflet/dist/leaflet.css";

type Coordinate = { lat: number; lng: number };

type MapCoordinatePickerProps = {
  value?: Coordinate;
  onChange?: (value: Coordinate) => void;
  className?: string;
};

type LeafletMap = typeof import("leaflet");
type LeafletInstance = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;

const DEFAULT_COORDINATE: Coordinate = { lat: 1.134118, lng: 104.027631 };

export default function MapCoordinatePicker({
  value = DEFAULT_COORDINATE,
  onChange,
  className,
}: MapCoordinatePickerProps) {
  const [coordinates, setCoordinates] = React.useState<Coordinate>(value);
  const [tempCoordinates, setTempCoordinates] =
    React.useState<Coordinate>(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"roadmap" | "satellite">(
    "roadmap",
  );
  const [isLocating, setIsLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<LeafletInstance | null>(null);
  const markerRef = React.useRef<LeafletMarker | null>(null);
  const leafletRef = React.useRef<LeafletMap | null>(null);
  const inlineMapRef = React.useRef<HTMLDivElement | null>(null);
  const inlineMapInstanceRef = React.useRef<LeafletInstance | null>(null);
  const inlineMarkerRef = React.useRef<LeafletMarker | null>(null);

  React.useEffect(() => {
    return () => {
      mapRef.current?.remove();
      inlineMapInstanceRef.current?.remove();
    };
  }, []);

  const ensureLeaflet = React.useCallback(async () => {
    if (leafletRef.current) return leafletRef.current;
    const leaflet = await import("leaflet");

    leaflet.Icon.Default.mergeOptions({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    leafletRef.current = leaflet;
    return leaflet;
  }, []);

  const syncMarkerPosition = React.useCallback(
    (lat: number, lng: number) => {
      setTempCoordinates({ lat, lng });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      }
    },
    [],
  );

  React.useEffect(() => {
    if (
      value.lat !== coordinates.lat ||
      value.lng !== coordinates.lng
    ) {
      setCoordinates(value);
      setTempCoordinates(value);
      syncMarkerPosition(value.lat, value.lng);
    }
  }, [coordinates.lat, coordinates.lng, syncMarkerPosition, value]);

  const initMap = React.useCallback(async () => {
    if (!isOpen || !mapContainerRef.current) return;

    const leaflet = await ensureLeaflet();
    if (!leaflet) return;

    const center: [number, number] = [
      tempCoordinates.lat,
      tempCoordinates.lng,
    ];

    if (!mapRef.current) {
      const map = leaflet.map(mapContainerRef.current).setView(center, 15);

      const roadmap = leaflet.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        },
      );

      const satellite = leaflet.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri",
          maxZoom: 19,
        },
      );

      roadmap.addTo(map);
      (map as any).roadmapLayer = roadmap;
      (map as any).satelliteLayer = satellite;

      const marker = leaflet
        .marker(center, { draggable: true })
        .addTo(map)
        .on("dragend", (e) => {
          const pos = (e.target as LeafletMarker).getLatLng();
          setTempCoordinates({ lat: pos.lat, lng: pos.lng });
        });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setTempCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView(center);
      mapRef.current.invalidateSize();
      markerRef.current?.setLatLng(center);
    }

    if (viewMode === "satellite") {
      const map = mapRef.current as any;
      if (map?.roadmapLayer && map?.satelliteLayer) {
        map.removeLayer(map.roadmapLayer);
        map.satelliteLayer.addTo(map);
      }
    }
  }, [ensureLeaflet, isOpen, tempCoordinates.lat, tempCoordinates.lng, viewMode]);

  React.useEffect(() => {
    initMap();
  }, [initMap]);

  React.useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  const initInlineMap = React.useCallback(async () => {
    const container = inlineMapRef.current;
    if (!container) return;

    const leaflet = await ensureLeaflet();
    if (!leaflet) return;

    const center: [number, number] = [coordinates.lat, coordinates.lng];

    if (!inlineMapInstanceRef.current) {
      const map = leaflet
        .map(container, {
          zoomControl: false,
          attributionControl: false,
        })
        .setView(center, 14);

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        })
        .addTo(map);

      const marker = leaflet.marker(center).addTo(map);

      inlineMapInstanceRef.current = map;
      inlineMarkerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    } else {
      inlineMapInstanceRef.current.setView(center);
      inlineMarkerRef.current?.setLatLng(center);
    }
  }, [coordinates.lat, coordinates.lng, ensureLeaflet]);

  React.useEffect(() => {
    initInlineMap();
  }, [initInlineMap]);

  React.useEffect(() => {
    if (isOpen && inlineMapInstanceRef.current) {
      inlineMapInstanceRef.current.remove();
      inlineMapInstanceRef.current = null;
      inlineMarkerRef.current = null;
    }
  }, [isOpen]);

  const requestLocationAndOpen = () => {
    if (!navigator?.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi.");
      return;
    }

    setLocationError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setTempCoordinates(next);
        setCoordinates(next);
        onChange?.(next);
        setIsLocating(false);
        setIsOpen(true);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi dibutuhkan untuk membuka peta."
            : "Gagal mengambil lokasi. Coba lagi.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleToggleView = (mode: "roadmap" | "satellite") => {
    setViewMode(mode);
    const map: any = mapRef.current;
    if (!map) return;
    if (mode === "satellite") {
      map.removeLayer(map.roadmapLayer);
      map.satelliteLayer.addTo(map);
    } else {
      map.removeLayer(map.satelliteLayer);
      map.roadmapLayer.addTo(map);
    }
  };

  const handleSave = () => {
    setCoordinates(tempCoordinates);
    onChange?.(tempCoordinates);
    setIsOpen(false);
  };

  const handleCancel = () => {
    syncMarkerPosition(coordinates.lat, coordinates.lng);
    setIsOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi.");
      return;
    }
    setLocationError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        syncMarkerPosition(next.lat, next.lng);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi dibutuhkan."
            : "Tidak bisa mengambil lokasi saat ini.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className={className}>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="koordinat">Koordinat <span className="text-red-500">*</span></Label>
        <div className="flex gap-2">
          <Input
            id="koordinat"
            value={`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`}
            placeholder="Koordinat"
            readOnly
            onClick={requestLocationAndOpen}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={requestLocationAndOpen}
            className="shrink-0"
            disabled={isLocating}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        {isLocating && (
          <p className="text-xs text-gray-500">Meminta izin lokasi...</p>
        )}
        {locationError && (
          <p className="text-xs text-red-500">{locationError}</p>
        )}
      </div>

      {!isOpen && (
        <div className="mt-4 overflow-hidden rounded-lg border">
          <div
            ref={inlineMapRef}
            className="h-52 w-full"
            aria-label="Ringkasan peta"
          />
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Pilih Lokasi</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 border-b p-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === "roadmap" ? "default" : "outline"}
                  onClick={() => handleToggleView("roadmap")}
                  className="flex-1"
                >
                  Peta
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "satellite" ? "default" : "outline"}
                  onClick={() => handleToggleView("satellite")}
                  className="flex-1"
                >
                  Satelit
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Koordinat:</strong>{" "}
                {tempCoordinates.lat.toFixed(6)}, {tempCoordinates.lng.toFixed(6)}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentLocation}
                className="w-full"
                disabled={isLocating}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {isLocating ? "Mengambil lokasi..." : "Gunakan Lokasi Saat Ini"}
              </Button>
              {locationError && (
                <p className="text-xs text-red-500">{locationError}</p>
              )}
            </div>

            <div className="relative flex-1 min-h-[320px] max-h-[480px] overflow-hidden">
              <div
                ref={mapContainerRef}
                className="absolute inset-0"
                aria-label="Map container"
              />
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="button" onClick={handleSave} className="flex-1">
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
