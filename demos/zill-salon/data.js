/*
 * data.js: the ONLY file you edit for this business.
 * Created 2026-10-13 by new_demo.py.
 *
 * Required: name, category, phone, address. Anything left as "TODO" or ""
 * is ignored: that section is hidden or falls back to category defaults.
 * Images: a relative path ("images/hero.jpg") or a full https URL.
 * Hours: "9:00-22:00", "10:00-14:00, 17:00-21:00", "closed" or "24h".
 *
 * Google listing name: "Zill salon - Best hair color in Bangalore | Best Unisex Salon in Bangalore"
 * STILL TO FILL from Google Maps: full address, opening hours, 2-4 real reviews,
 * and real photos (the listing has only 1 photo, so these use category stock photos).
 */
window.BUSINESS = {
  name: "Zill Salon",
  slug: "zill-salon",
  category: "salon",
  tagline: "Best hair colour and unisex salon in Bangalore, rated 4.2★ by 300+ clients",
  about: "Zill Salon is a unisex salon in Bangalore known for its hair colour work. From global colour, highlights and balayage to precision cuts, hair spa, grooming and skin care, our stylists help men and women look their best. More than 300 clients have rated us on Google, and we would love to welcome you next.",
  established: "TODO",        // year, e.g. "1998"
  owner: "TODO",
  phone: "+91 88615 05786",
  whatsapp: "918861505786",
  email: "TODO",
  address: "Bengaluru, Karnataka",   // PLACEHOLDER: replace with the full Google Maps address
  city: "Bangalore",
  mapQuery: "Zill salon - Best hair color in Bangalore | Best Unisex Salon in Bangalore",
  hours: { mon: "TODO", tue: "TODO", wed: "TODO", thu: "TODO", fri: "TODO", sat: "TODO", sun: "TODO" },  // copy from Google Maps
  rating: 4.2,
  reviewCount: 328,
  highlights: ["4.2★ on Google", "300+ Google Reviews", "Unisex Salon", "Hair Colour Specialists", "Book on WhatsApp"],
  services: [
    { title: "Hair Colour", desc: "Global colour, root touch-up and fashion shades, matched to your skin tone.", price: "", icon: "bi-palette" },
    { title: "Highlights & Balayage", desc: "Streaks, highlights and hand-painted balayage for a natural, dimensional look.", price: "", icon: "bi-brush" },
    { title: "Haircut & Styling", desc: "Precision cuts, blow-dry and styling for men and women.", price: "", icon: "bi-scissors" },
    { title: "Hair Spa & Treatments", desc: "Hair spa, keratin and smoothening for soft, healthy hair.", price: "", icon: "bi-stars" },
    { title: "Men's Grooming", desc: "Haircuts, beard trim and shape, shave and hair colour for men.", price: "", icon: "bi-person" },
    { title: "Facials & Skin Care", desc: "Cleanups and facials for fresh, glowing skin.", price: "", icon: "bi-flower1" }
  ],
  menuCategories: [],
  heroImage: "",             // "images/hero.jpg" or https URL (empty = category placeholder)
  logo: "",                  // "images/logo.png" (empty = text logo from initials)
  gallery: [],               // ["images/1.jpg", { src: "images/2.jpg", caption: "Balayage" }] (empty = category photos)
  testimonials: [],          // copy 2-4 real Google reviews: { name: "...", text: "...", rating: 5 }
  faqs: [
    { q: "Do you do hair colour for both men and women?", a: "Yes. Zill Salon is a unisex salon, and we do global colour, highlights, balayage and grey coverage for men and women." },
    { q: "Will the colour damage my hair?", a: "Our stylists check your hair first and use professional colour with care products to keep it healthy. Ask us about ammonia-free options." },
    { q: "Do I need an appointment?", a: "Walk-ins are welcome, but colour services take time, so we recommend booking a slot on WhatsApp." },
    { q: "How can I see your prices?", a: "Message us on WhatsApp with the service you want and we will share the price, or call us on the number above." }
  ],
  social: { instagram: "", facebook: "", youtube: "" },
  languages: ["en", "hi"],   // remove "hi" to hide the Hindi toggle
  theme: {},                 // {} = category preset, "auto" = colours from logo, or { primary: "#...", accent: "#..." }
  sections: [],              // optional order, e.g. ["hero","about","services","gallery","contact"]
  developer: { name: "Devnixplus", phone: "+91 91835 59191", whatsapp: "919183559191", portfolio: "https://www.devnixplus.com" }
};
