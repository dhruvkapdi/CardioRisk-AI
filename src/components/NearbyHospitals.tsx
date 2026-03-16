import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, Search, Loader2, AlertCircle, Hospital, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HospitalResult {
  name: string;
  distance: number;
  address: string;
  rating: number | null;
  lat: number;
  lon: number;
}

async function fetchHospitalsFromOverpass(lat: number, lon: number): Promise<HospitalResult[]> {
  const radius = 10000; // 10km
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"]["healthcare"="centre"](around:${radius},${lat},${lon});
    );
    out center body 20;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error("Failed to fetch hospitals");

  const data = await res.json();

  return data.elements
    .map((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;

      const dist = haversine(lat, lon, elLat, elLon);
      const name = el.tags?.name || el.tags?.["name:en"] || "Hospital / Clinic";
      const street = el.tags?.["addr:street"] || "";
      const city = el.tags?.["addr:city"] || "";
      const address = [street, city].filter(Boolean).join(", ") || "Address not available";

      return { name, distance: dist, address, rating: null, lat: elLat, lon: elLon };
    })
    .filter(Boolean)
    .sort((a: HospitalResult, b: HospitalResult) => a.distance - b.distance)
    .slice(0, 8);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
    { headers: { "User-Agent": "CardioRiskAI/1.0" } }
  );
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

export function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [searched, setSearched] = useState(false);

  const searchByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchHospitalsFromOverpass(lat, lon);
      setHospitals(results);
      setSearched(true);
      if (results.length === 0) setError("No hospitals found nearby. Try a different location.");
    } catch {
      setError("Could not fetch nearby hospitals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFindNearby = useCallback(() => {
    if (!navigator.geolocation) {
      setShowManual(true);
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => searchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLoading(false);
        setShowManual(true);
        setError("Location access denied. You can search by city instead.");
      },
      { timeout: 10000 }
    );
  }, [searchByCoords]);

  const handleManualSearch = useCallback(async () => {
    if (!manualCity.trim()) return;
    setLoading(true);
    setError(null);
    const coords = await geocodeCity(manualCity);
    if (!coords) {
      setError("Could not find that location. Please try a different city name.");
      setLoading(false);
      return;
    }
    await searchByCoords(coords.lat, coords.lon);
  }, [manualCity, searchByCoords]);

  const openDirections = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, "_blank");
  };

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-destructive/10">
          <AlertCircle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Emergency Care Advisory</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your result indicates elevated cardiovascular risk. Please consider consulting a doctor.
          </p>
        </div>
      </div>

      {!searched && !loading && (
        <Button onClick={handleFindNearby} className="gap-2 w-full sm:w-auto">
          <MapPin className="w-4 h-4" />
          Find Nearby Hospitals
        </Button>
      )}

      <AnimatePresence>
        {showManual && !searched && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <Input
              placeholder="Enter city or area name..."
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              className="flex-1"
            />
            <Button onClick={handleManualSearch} disabled={loading} size="sm" className="gap-1">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching for nearby hospitals...
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {hospitals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Hospital className="w-4 h-4 text-primary" />
            {hospitals.length} Hospital{hospitals.length !== 1 ? "s" : ""} Found Nearby
          </h4>
          <div className="grid gap-3">
            {hospitals.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.address}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {h.distance} km
                    </span>
                    {h.rating && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {h.rating}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDirections(h.lat, h.lon)}
                  className="gap-1 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  Get Directions
                </Button>
              </motion.div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFindNearby}
            className="text-muted-foreground"
          >
            <Search className="w-3 h-3 mr-1" />
            Search Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
