import L from "leaflet";

/** Leaflet's default marker icon breaks under Vite bundling without this patch. */
type IconDefaultPrototype = typeof L.Icon.Default.prototype & {
  _getIconUrl?: unknown;
};

export function patchLeafletDefaultIcon(): void {
  const proto = L.Icon.Default.prototype as IconDefaultPrototype;
  delete proto._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}
