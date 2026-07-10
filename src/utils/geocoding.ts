

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface ReverseGeocodeResult {
  display_name: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export const geocodingService = {
  async searchAddress(address: string): Promise<NominatimResult[]> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Geocoding request failed");
    return res.json();
  },

  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Reverse geocoding request failed");
    return res.json();
  },
};
