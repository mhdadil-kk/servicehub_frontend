import React, { useState, useEffect, useRef } from "react";
import {
  Search as SearchIcon, MapPin, Star,
  Check, HelpCircle, ChevronDown, AlertCircle
} from "lucide-react";
import { serviceApi } from "../../api/service.service";
import toast from "react-hot-toast";
import { Pagination } from "../../components/Common/Pagination";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Provider } from "../../types/provider.types";
import { getSimulated } from "../../types/provider.types";
import ProviderProfileDetail from "./ProviderProfileDetail";
import BookingModal from "../../components/user/BookingModal";

const standardIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:#2563eb;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,99,235,0.35)">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="white" width="14" height="14">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const activeIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:#f97316;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(249,115,22,0.5)">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="white" width="18" height="18">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const userIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.2)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Map auto-pan and fit bounds
const MapController = ({
  providers,
  activeId,
  userCoords,
}: {
  providers: Provider[];
  activeId: string | null;
  userCoords: [number, number] | null;
}) => {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    if (userCoords) points.push(userCoords);
    providers.forEach(p => {
      if (p.location?.coordinates?.[1] && p.location?.coordinates?.[0])
        points.push([p.location.coordinates[1], p.location.coordinates[0]]);
    });
    if (points.length > 0)
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 13 });
  }, [providers, map, userCoords]);

  useEffect(() => {
    if (activeId && map) {
      const p = providers.find(pr => pr._id === activeId);
      if (p?.location?.coordinates?.[1] && p?.location?.coordinates?.[0])
        map.panTo([p.location.coordinates[1], p.location.coordinates[0]], { animate: true });
    }
  }, [activeId, providers, map]);

  return null;
};

const ITEMS_PER_PAGE = 5;


// ─────────────────────────────────────────────────────────────────────────────
const BrowseServices: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [_totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [nearbyActive, setNearbyActive] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState(25);
  const [isLocating, setIsLocating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"nearby" | "category" | "rating" | "sort" | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Geocoding Search
  const [locationSearch, setLocationSearch] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  // UI State
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [profileProvider, setProfileProvider] = useState<Provider | null>(null); // Full page profile
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, provRes] = await Promise.all([
        serviceApi.getActiveServices(),
        serviceApi.browseProviders({
          search: search || undefined,
          serviceId: selectedCategory || undefined,
          ...(nearbyActive && userCoords
            ? { latitude: userCoords[0], longitude: userCoords[1], radius }
            : {}),
          sortBy,
          sortOrder,
          limit: ITEMS_PER_PAGE,
          page: currentPage,
        }),
      ]);
      setCategories(catRes.data || []);
      setProviders(provRes.data.providers || []);
      setTotalPages(provRes.data.totalPages || 1);
      setTotalCount(provRes.data.total || 0);
      setCurrentPage(provRes.data.page || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load providers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, selectedCategory, nearbyActive, userCoords, radius, currentPage, sortBy, sortOrder]);

  const toggleNearby = () => {
    if (nearbyActive) { 
      setNearbyActive(false); 
      setUserCoords(null); 
      setLocationName("");
      setLocationSearch("");
      setActiveDropdown(null); 
      return; 
    }
    if (activeDropdown === "nearby") {
      setActiveDropdown(null);
    } else {
      setActiveDropdown("nearby");
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { 
        setUserCoords([pos.coords.latitude, pos.coords.longitude]); 
        setLocationName("My Location");
        setNearbyActive(true); 
        setIsLocating(false); 
        toast.success("Location detected!"); 
      },
      () => { 
        setIsLocating(false); 
        toast.error("Could not get location. Try searching a city manually."); 
      }
    );
  };

  const handleGeocodeSearch = async () => {
    if (!locationSearch || locationSearch.trim().length < 3) {
      toast.error("Please type a location to search");
      return;
    }
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserCoords([lat, lon]);
        const shortName = data[0].display_name.split(",")[0];
        setLocationName(shortName);
        setNearbyActive(true);
        toast.success(`Location set to: ${shortName}`);
      } else {
        toast.error("Location not recognized.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Geocoding failed. Try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const clearFilters = () => {
    setSearch(""); setSelectedCategory(""); setSelectedRating("");
    setNearbyActive(false); setUserCoords(null); setLocationName(""); setLocationSearch("");
    setSortBy("createdAt"); setSortOrder("desc");
    setActiveDropdown(null); setCurrentPage(1);
  };

  const filteredProviders = providers.filter(p => {
    if (!selectedRating) return true;
    return parseFloat(getSimulated(p, userCoords).rating) >= parseFloat(selectedRating);
  });

  const paginated = filteredProviders;

  // ── PROFILE DETAIL PAGE ──
  if (profileProvider) {
    return (
      <>
        <ProviderProfileDetail
          provider={profileProvider}
          userCoords={userCoords}
          onBack={() => setProfileProvider(null)}
          onBook={() => setIsBookingModalOpen(true)}
        />
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          provider={profileProvider}
        />
      </>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-120px)] flex -m-8 overflow-hidden">

      {/* ═══════════════ LEFT PANE: LIST ═══════════════ */}
      <section className="w-full lg:w-[56%] h-full flex flex-col border-r border-slate-100 bg-white">

        {/* Search & Filters */}
        <div className="p-7 border-b border-slate-50 shrink-0 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Find a Professional</h3>
            </div>
            {(search || selectedCategory || selectedRating || nearbyActive) && (
              <button onClick={clearFilters} className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all border border-blue-100">
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={17} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, service, or keyword..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>

            {/* Nearby */}
            <div className="relative">
              <button
                onClick={toggleNearby}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black transition-all border ${nearbyActive ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"}`}
              >
                <MapPin size={13} />
                {nearbyActive && locationName ? `Near ${locationName}` : "Nearby"}
                {isLocating && <div className="w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin ml-1" />}
                {!nearbyActive && <ChevronDown size={11} />}
              </button>
              {activeDropdown === "nearby" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl p-5 shadow-xl border border-slate-100 z-50 space-y-4">
                  {/* Search input for address */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Search Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, Delhi"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleGeocodeSearch();
                        }}
                      />
                      <button
                        onClick={handleGeocodeSearch}
                        disabled={isGeocoding}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        {isGeocoding ? "..." : "Set"}
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Use Current GPS Location */}
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <MapPin size={14} className="text-blue-500" />
                    <span>Use GPS Current Location</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Radius slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Radius</span>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{radius} km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={radius}
                      onChange={e => setRadius(+e.target.value)}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>5 km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black transition-all border ${selectedCategory ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"}`}
              >
                {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name : "Category"}
                <ChevronDown size={11} />
              </button>
              {activeDropdown === "category" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-3xl p-3 shadow-xl border border-slate-100 z-50 max-h-52 overflow-y-auto custom-scrollbar">
                  <button onClick={() => { setSelectedCategory(""); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50">All Categories</button>
                  {categories.map(cat => (
                    <button key={cat._id} onClick={() => { setSelectedCategory(cat._id); setActiveDropdown(null); }} className={`w-full text-left px-3 py-2.5 text-xs font-black rounded-xl hover:bg-slate-50 flex justify-between items-center ${selectedCategory === cat._id ? "text-blue-600" : "text-slate-700"}`}>
                      {cat.name}
                      {selectedCategory === cat._id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "rating" ? null : "rating")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black transition-all border ${selectedRating ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"}`}
              >
                <Star size={12} className={selectedRating ? "fill-blue-600 text-blue-600" : ""} />
                {selectedRating ? `${selectedRating}+ Stars` : "Rating"}
                <ChevronDown size={11} />
              </button>
              {activeDropdown === "rating" && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-3xl p-3 shadow-xl border border-slate-100 z-50">
                  <button onClick={() => { setSelectedRating(""); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50">All Ratings</button>
                  {["4.8", "4.5", "4.0"].map(r => (
                    <button key={r} onClick={() => { setSelectedRating(r); setActiveDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl hover:bg-slate-50 flex items-center gap-2 ${selectedRating === r ? "text-blue-600 bg-blue-50/50" : "text-slate-700"}`}>
                      <Star size={11} className="fill-current" /> {r}+ Stars
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black transition-all border ${sortBy !== "createdAt" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"}`}
              >
                Sort: {sortBy === "hourlyRate" ? (sortOrder === "asc" ? "Price: Low to High" : "Price: High to Low") : "Newest First"}
                <ChevronDown size={11} />
              </button>
              {activeDropdown === "sort" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-3xl p-3 shadow-xl border border-slate-100 z-50">
                  <button
                    onClick={() => {
                      setSortBy("createdAt");
                      setSortOrder("desc");
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-50 ${
                      sortBy === "createdAt" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("hourlyRate");
                      setSortOrder("asc");
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-50 ${
                      sortBy === "hourlyRate" && sortOrder === "asc" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("hourlyRate");
                      setSortOrder("desc");
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-50 ${
                      sortBy === "hourlyRate" && sortOrder === "desc" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    Price: High to Low
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Provider Cards */}
        <div className="flex-1 overflow-y-auto p-7 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-400">Loading providers...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-3xl border border-red-100 p-8 text-center space-y-3">
              <AlertCircle size={28} className="text-red-400 mx-auto" />
              <p className="font-black text-slate-800">Failed to load providers</p>
              <p className="text-xs text-slate-500">{error}</p>
              <button onClick={fetchData} className="bg-red-500 text-white font-black text-xs px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors">
                Retry
              </button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-12 text-center space-y-3">
              <HelpCircle size={28} className="text-slate-300 mx-auto" />
              <p className="font-black text-slate-700">No Providers Found</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Try adjusting your filters or expanding the search radius.</p>
              <button onClick={clearFilters} className="bg-blue-600 text-white font-black text-xs px-5 py-2.5 rounded-xl">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map(p => {
                const sim = getSimulated(p, userCoords);
                const isHovered = hoveredId === p._id;
                return (
                  <div
                    key={p._id}
                    onMouseEnter={() => setHoveredId(p._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`bg-white rounded-[28px] border p-5 flex gap-5 relative transition-all duration-300 ${isHovered ? "border-blue-500 shadow-lg shadow-blue-50 -translate-y-0.5" : "border-slate-100 shadow-sm hover:shadow-md"}`}
                  >
                    {/* Rating badge */}
                    <div className="absolute top-5 right-5 flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[11px] font-black text-amber-700">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      {sim.rating}
                      <span className="text-slate-400 font-bold text-[10px]">({sim.reviewCount})</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                      <img
                        src={p.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${p.userId.name}`}
                        alt={p.userId.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3 pr-20">
                      <div>
                        <h4 className={`font-black text-slate-900 text-sm transition-colors ${isHovered ? "text-blue-600" : ""}`}>{p.userId.name}</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{p.serviceId?.name || "Professional"}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span className="text-slate-800 font-black">₹{p.hourlyRate || 350}/hr</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" />{sim.distance}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {sim.tags.slice(0, 3).map((t, i) => (
                          <span key={i} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-50">
                        <button
                          onClick={() => setProfileProvider(p)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md shadow-blue-100 hover:scale-[1.01] transition-all"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-gray-200">
          <Pagination total={totalCount} limit={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </section>

      {/* ═══════════════ RIGHT PANE: MAP ═══════════════ */}
      <section className="hidden lg:flex flex-1 h-full relative">
        <div className="w-full h-full z-0">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController providers={filteredProviders} activeId={hoveredId} userCoords={userCoords} />
            {nearbyActive && userCoords && (
              <>
                <Marker position={userCoords} icon={userIcon} />
                <Circle center={userCoords} radius={radius * 1000} pathOptions={{ fillColor: "#2563eb", color: "#2563eb", weight: 1.5, fillOpacity: 0.07, dashArray: "6 4" }} />
              </>
            )}
            {filteredProviders.map(p => {
              if (!p.location?.coordinates?.[1] || !p.location?.coordinates?.[0]) return null;
              return (
                <Marker
                  key={p._id}
                  position={[p.location.coordinates[1], p.location.coordinates[0]]}
                  icon={hoveredId === p._id ? activeIcon : standardIcon}
                  eventHandlers={{
                    mouseover: () => setHoveredId(p._id),
                    mouseout: () => setHoveredId(null),
                    click: () => setProfileProvider(p),
                  }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* Map legend */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-100 z-[400] space-y-2 pointer-events-none">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Map View</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Available Professionals
          </div>
          {nearbyActive && userCoords && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              Your position
            </div>
          )}
        </div>

        {/* Hover Provider Info Card on map */}
        {hoveredId && (() => {
          const hp = filteredProviders.find(p => p._id === hoveredId);
          if (!hp) return null;
          const s = getSimulated(hp, userCoords);
          return (
            <div className="absolute top-6 right-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 z-[400] w-56 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img src={hp.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${hp.userId.name}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{hp.userId.name}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{hp.serviceId?.name || "Professional"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-50 pt-2">
                <span className="text-slate-800 font-black">₹{hp.hourlyRate || 350}/hr</span>
                <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{s.rating}</span>
              </div>
              <button onClick={() => setProfileProvider(hp)} className="w-full bg-blue-600 text-white text-[11px] font-black py-2 rounded-xl hover:bg-blue-700 transition-colors">
                View Profile
              </button>
            </div>
          );
        })()}
      </section>

    </div>
  );
};

export default BrowseServices;
