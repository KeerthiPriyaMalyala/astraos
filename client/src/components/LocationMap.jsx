import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// =====================================================
// FIX DEFAULT LEAFLET MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// MAP CLICK HANDLER
// =====================================================

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      setPosition({
        latitude: lat,
        longitude: lng,
      });
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={[
        position.latitude,
        position.longitude,
      ]}
    />
  );
};

// =====================================================
// LOCATION MAP
// =====================================================

const LocationMap = ({
  value,
  onChange,
}) => {
  const [position, setPosition] =
    useState(value || null);

  // ===================================================
  // DEFAULT LOCATION
  // India center
  // ===================================================

  const defaultCenter = [
    20.5937,
    78.9629,
  ];

  // ===================================================
  // KEEP MAP VALUE IN SYNC WITH PARENT
  // ===================================================

  useEffect(() => {
    if (value) {
      setPosition(value);
    }
  }, [value]);

  // ===================================================
  // HANDLE LOCATION CHANGE
  // ===================================================

  const handlePositionChange = (
    newPosition
  ) => {
    setPosition(newPosition);

    if (onChange) {
      onChange(newPosition);
    }
  };

  return (
    <div className="w-full space-y-3">

      {/* =============================================
          MAP
      ============================================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">

        <MapContainer
          center={
            position
              ? [
                  position.latitude,
                  position.longitude,
                ]
              : defaultCenter
          }
          zoom={position ? 16 : 5}
          scrollWheelZoom={true}
          className="h-[400px] w-full"
        >

          {/* =========================================
              OPENSTREETMAP TILES
          ========================================= */}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* =========================================
              LOCATION MARKER
          ========================================= */}

          <LocationMarker
            position={position}
            setPosition={
              handlePositionChange
            }
          />

        </MapContainer>

      </div>

      {/* =============================================
          INSTRUCTIONS
      ============================================= */}

      <div className="rounded-xl bg-blue-50 p-4">

        <p className="text-sm font-medium text-blue-800">
          📍 Select Complaint Location
        </p>

        <p className="mt-1 text-xs text-blue-600">
          Click anywhere on the map to select
          the exact location of the civic issue.
        </p>

      </div>

      {/* =============================================
          SELECTED LOCATION
      ============================================= */}

      {position && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* LATITUDE */}

          <div className="rounded-xl border border-gray-200 bg-white p-3">

            <p className="text-xs font-medium text-gray-500">
              Latitude
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {position.latitude.toFixed(6)}
            </p>

          </div>

          {/* LONGITUDE */}

          <div className="rounded-xl border border-gray-200 bg-white p-3">

            <p className="text-xs font-medium text-gray-500">
              Longitude
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {position.longitude.toFixed(6)}
            </p>

          </div>

        </div>
      )}

    </div>
  );
};

export default LocationMap;