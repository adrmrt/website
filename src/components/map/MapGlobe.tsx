import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN;

// [longitude, latitude]
const SWITZERLAND_CENTER: [number, number] = [8.2275, 46.8182];

const INITIAL_ZOOM = 3;

export default function MapGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "globe",
      center: SWITZERLAND_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.current.on("style.load", () => {
      if (!map.current) return;

      map.current.setProjection("globe");

      map.current.setFog({
        color: "rgb(10, 10, 20)",
        "high-color": "rgb(30, 40, 80)",
        "horizon-blend": 0.08,
        "space-color": "rgb(5, 5, 15)",
        "star-intensity": 1,
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
