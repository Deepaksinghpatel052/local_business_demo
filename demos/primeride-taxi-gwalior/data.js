/*
 * data.js: the ONLY file you edit for this business.
 * Created 2026-10-12 by new_demo.py.
 *
 * Required: name, category, phone, address. Anything left as "TODO" or ""
 * is ignored: that section is hidden or falls back to category defaults.
 * Images: a relative path ("images/hero.jpg") or a full https URL.
 * Hours: "9:00-22:00", "10:00-14:00, 17:00-21:00", "closed" or "24h".
 *
 * PLACEHOLDERS: phone, whatsapp and address below are dummy values. Replace
 * them (and add rating, reviewCount and real Google reviews) from the
 * owner's Google Maps listing before sending the link.
 */
window.BUSINESS = {
  name: "PrimeRide Taxi Service Gwalior",
  slug: "primeride-taxi-gwalior",
  category: "taxi",   // restaurant | cafe | bakery | salon | spa | gym | clinic | dentist | hospital | school | coaching | hotel | car-service | garage | electronics | hardware | boutique | jewellery | real-estate | bar | travel | taxi | handyman | general
  tagline: "Local rides, railway & airport drops and outstation trips from Gwalior, 24x7",
  about: "PrimeRide Taxi Service is a Gwalior cab service for everyday city rides, early-morning trains, late-night flights and outstation trips to Agra, Jhansi, Orchha, Shivpuri, Bhopal and Delhi. Clean AC cars, verified local drivers and the full fare agreed before you travel.",
  established: "TODO",        // year, e.g. "1998"
  owner: "TODO",
  phone: "+91 79999 08258",   // PLACEHOLDER: replace with the real number
  whatsapp: "917999908258",   // PLACEHOLDER: digits with country code
  email: "TODO",
  address: "Gwalior, Madhya Pradesh",   // PLACEHOLDER: replace with the full Google Maps address
  city: "Gwalior",
  mapQuery: "PrimeRide Taxi Service Gwalior",
  hours: { mon: "24h", tue: "24h", wed: "24h", thu: "24h", fri: "24h", sat: "24h", sun: "24h" },
  rating: 0,                 // Google rating, e.g. 4.6
  reviewCount: 0,            // number of Google reviews
  highlights: ["24x7 Cab Service", "Railway & Airport Pickup", "Outstation One-Way & Round Trip", "Verified Drivers", "Clean AC Cars", "Cash & UPI"],
  services: [
    { title: "Local Gwalior Rides", desc: "Point-to-point rides and 4 hr / 8 hr city packages for shopping, hospital visits and meetings.", price: "", icon: "bi-taxi-front" },
    { title: "Railway Station Pickup & Drop", desc: "Gwalior Junction pickups and drops for early-morning and late-night trains.", price: "", icon: "bi-train-front" },
    { title: "Airport Transfers", desc: "Rajmata Vijaya Raje Scindia Airport pickups and drops, timed to your flight.", price: "", icon: "bi-airplane" },
    { title: "Outstation Trips", desc: "One-way and round trips to Agra, Jhansi, Orchha, Shivpuri, Bhopal, Delhi and more.", price: "", icon: "bi-signpost-split" },
    { title: "Gwalior Sightseeing", desc: "Gwalior Fort, Jai Vilas Palace, Sun Temple and Tansen's Tomb in one day with a local driver.", price: "", icon: "bi-camera" },
    { title: "Weddings & Events", desc: "Sedans and SUVs for baraat, guests and functions, single car or a full fleet.", price: "", icon: "bi-balloon-heart" }
  ],
  vehicles: [                // vehicle types: shown in "Choose Your Vehicle" and the form's "Vehicle type" dropdown
    { name: "Hatchback", models: "Swift, WagonR or similar", seats: 4, bags: 2, rate: "", icon: "bi-car-front" },
    { name: "Sedan", models: "Dzire, Etios, Aura or similar", seats: 4, bags: 3, rate: "", icon: "bi-car-front" },
    { name: "SUV", models: "Ertiga, Kia Carens or similar", seats: 6, bags: 3, rate: "", icon: "bi-car-front-fill" },
    { name: "Innova Crysta", models: "Premium 7-seater for families", seats: 7, bags: 4, rate: "", icon: "bi-car-front-fill" },
    { name: "Tempo Traveller", models: "12 to 17 seater for groups and yatras", seats: 12, bags: 8, rate: "", icon: "bi-bus-front" }
  ],
  menuCategories: [],
  heroImage: "",             // "images/hero.jpg" or https URL (empty = category placeholder)
  logo: "",                  // "images/logo.png" (empty = text logo from initials)
  gallery: [
    { src: "placeholders/taxi/1.jpg", caption: "Experienced local drivers" },
    { src: "placeholders/taxi/2.jpg", caption: "Outstation trips" },
    { src: "placeholders/taxi/3.jpg", caption: "Airport transfers" },
    { src: "placeholders/taxi/4.jpg", caption: "SUVs for families & groups" }
  ],
  testimonials: [],          // copy 2-4 real Google reviews: { name, text, rating }
  faqs: [],                  // [{ q: "...", a: "..." }] (empty = category default FAQs)
  social: { instagram: "", facebook: "", youtube: "" },
  languages: ["en", "hi"],   // remove "hi" to hide the Hindi toggle
  theme: {},                 // {} = category preset, "auto" = colours from logo, or { primary: "#...", accent: "#..." }
  sections: [],              // optional order, e.g. ["hero","about","services","gallery","contact"]
  developer: { name: "Your Name", phone: "+91 90000 00000", whatsapp: "919000000000", portfolio: "https://mydomain.com" }
};
