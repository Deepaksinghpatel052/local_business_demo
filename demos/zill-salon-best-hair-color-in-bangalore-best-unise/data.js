/*
 * data.js: the ONLY file you edit for this business.
 * Created 2026-10-09 by new_demo.py.
 *
 * Required: name, category, phone, address. Anything left as "TODO" or ""
 * is ignored: that section is hidden or falls back to category defaults.
 * Images: a relative path ("images/hero.jpg") or a full https URL.
 * Hours: "9:00-22:00", "10:00-14:00, 17:00-21:00", "closed" or "24h".
 */
window.BUSINESS = {
  name: "Zill salon - Best hair color in Bangalore | Best Unisex Salon in Bangalore",
  slug: "zill-salon-best-hair-color-in-bangalore-best-unise",
  category: "salon",   // restaurant | cafe | bakery | salon | spa | gym | clinic | dentist | hospital | school | coaching | hotel | car-service | garage | electronics | hardware | boutique | jewellery | real-estate | bar | travel | handyman | general
  tagline: "TODO",
  about: "TODO",
  established: "TODO",        // year, e.g. "1998"
  owner: "TODO",
  phone: "TODO",              // REQUIRED, e.g. "+91 98765 43210"
  whatsapp: "TODO",           // digits with country code, e.g. "919876543210" (defaults to phone)
  email: "TODO",
  address: "TODO",            // REQUIRED, full address as on Google Maps
  city: "",                  // optional, guessed from the address
  mapQuery: "TODO",           // what you would type into Google Maps to find them
  hours: { mon: "TODO", tue: "TODO", wed: "TODO", thu: "TODO", fri: "TODO", sat: "TODO", sun: "TODO" },
  rating: 0,                 // Google rating, e.g. 4.6
  reviewCount: 0,            // number of Google reviews
  highlights: ["TODO", "TODO", "TODO"],
  services: [
    { title: "TODO", desc: "TODO", price: "TODO", image: "", icon: "" },
    { title: "TODO", desc: "TODO", price: "", image: "", icon: "" },
    { title: "TODO", desc: "TODO", price: "", image: "", icon: "" }
  ],
  menuCategories: [],
  heroImage: "",             // "images/hero.jpg" or https URL (empty = category placeholder)
  logo: "",                  // "images/logo.png" (empty = text logo from initials)
  gallery: [],               // ["images/1.jpg", "https://...", { src: "images/2.jpg", caption: "Our kitchen" }]
  testimonials: [            // copy 2-4 real Google reviews
    { name: "TODO", text: "TODO", rating: 5 }
  ],
  faqs: [],                  // [{ q: "...", a: "..." }] (empty = category default FAQs)
  social: { instagram: "", facebook: "", youtube: "" },
  languages: ["en", "hi"],   // remove "hi" to hide the Hindi toggle
  theme: {},                 // {} = category preset, "auto" = colours from logo, or { primary: "#...", accent: "#..." }
  sections: [],              // optional order, e.g. ["hero","about","services","gallery","contact"]
  developer: { name: "Your Name", phone: "+91 90000 00000", whatsapp: "919000000000", portfolio: "https://mydomain.com" }
};
