// ─── Shared Provider Type ─────────────────────────────────────────────────────
export interface Provider {
  _id: string;
  userId: { _id: string; name: string; email: string; phone?: string };
  bio?: string;
  profilePhoto?: string;
  serviceId?: { _id: string; name: string; description?: string };
  hourlyRate?: number;
  serviceRadius?: number;
  address?: string;
  location?: { type: string; coordinates: number[] }; 
}

export const REVIEW_SNIPPETS = [
  { reviewer: "Sarah Jenkins",  ago: "2 weeks ago",  stars: 5, text: "Absolutely wonderful experience. Arrived on time, worked efficiently and left the place spotless. Highly recommend!" },
  { reviewer: "Michael K.",     ago: "1 month ago",  stars: 4, text: "Great service for a fair price. Explained the issue clearly and the fix was robust. Will definitely use again." },
  { reviewer: "Priya Sharma",   ago: "3 weeks ago",  stars: 5, text: "Very professional and courteous. Went above and beyond what was asked. Exceptional service!" },
  { reviewer: "James R.",       ago: "2 months ago", stars: 4, text: "Solid work done on time. Minor delay but was communicated well. Would book again." },
  { reviewer: "Anita Verma",    ago: "5 days ago",   stars: 5, text: "Outstanding! One of the best service providers I have encountered. Truly professional in every way." },
];

export function getSimulated(p: Provider, userCoords: [number, number] | null) {
  const numId = p._id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = (4.5 + (numId % 6) * 0.1).toFixed(1);
  const reviewCount = 15 + (numId % 140);

  const cat = (p.serviceId?.name || "").toLowerCase();
  let tags = ["Verified", "Professional", "Background Checked"];
  if (cat.includes("clean"))                          tags = ["Residential", "Deep Clean", "Eco-Friendly", "Insured"];
  else if (cat.includes("plumb"))                     tags = ["Emergency", "Pipe Repair", "24/7 Service", "Licensed"];
  else if (cat.includes("electric") || cat.includes("wiring")) tags = ["Installations", "Wiring", "Safety Certified", "Licensed"];
  else if (cat.includes("garden") || cat.includes("landscap")) tags = ["Gardening", "Lawn Care", "Design", "Insured"];
  else if (cat.includes("ac") || cat.includes("appliance"))   tags = ["Repairs", "Maintenance", "Fast Response", "Certified"];

  let distance = `${(0.5 + (numId % 45) * 0.1).toFixed(1)} miles away`;
  if (userCoords && p.location?.coordinates?.[1] && p.location?.coordinates?.[0]) {
    const [lat1, lon1] = userCoords;
    const lat2 = p.location.coordinates[1];
    const lon2 = p.location.coordinates[0];
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    distance = `${(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)} miles away`;
  }

  const r1 = REVIEW_SNIPPETS[numId % REVIEW_SNIPPETS.length];
  const r2 = REVIEW_SNIPPETS[(numId + 2) % REVIEW_SNIPPETS.length];

  return { rating, reviewCount, tags, distance, reviews: [r1, r2] };
}
