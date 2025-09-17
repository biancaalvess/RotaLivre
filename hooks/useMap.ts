import { useRef } from "react";

export function useMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  return {
    mapRef,
  };
}
