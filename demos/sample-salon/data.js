/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: salon with theme: "auto". The primary and accent colours are
 * extracted from images/logo.png with ColorThief (teal + coral here).
 * Auto mode needs the site to be served over http(s); when index.html is
 * opened straight from disk the browser blocks reading image pixels, so the
 * "beauty" preset (rose & gold) is used instead.
 * Photos are full https URLs. All details below are dummy data.
 */
window.BUSINESS = {
  name: "Glow & Grace Unisex Salon",
  slug: "sample-salon",
  category: "salon",
  tagline: "Hair, skin and bridal experts in Indiranagar",
  about: "Glow & Grace is a friendly unisex salon run by a team of senior stylists trained at leading academies. From a quick haircut to complete bridal makeovers, we use premium professional products and take the time to understand exactly the look you want.",
  established: "2016",
  owner: "Ananya Rao",
  phone: "+91 99000 11223",
  whatsapp: "919900011223",
  email: "",
  address: "No. 45, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
  mapQuery: "12th Main Road Indiranagar Bengaluru",
  hours: { mon: "10:00-20:30", tue: "closed", wed: "10:00-20:30", thu: "10:00-20:30", fri: "10:00-20:30", sat: "9:00-21:00", sun: "9:00-21:00" },
  rating: 4.8,
  reviewCount: 527,
  highlights: ["Unisex Salon", "Bridal Experts", "Air Conditioned", "Hygienic Tools", "Card & UPI"],
  services: [
    { title: "Haircut & Styling", desc: "Precision cuts, blow-dry and styling for men and women.", price: "from ₹399", icon: "bi-scissors" },
    { title: "Hair Colour & Highlights", desc: "Global colour, balayage and highlights with ammonia-free options.", price: "from ₹1,499", icon: "bi-palette" },
    { title: "Keratin & Smoothening", desc: "Frizz-free, glossy hair that lasts for months.", price: "from ₹3,499", icon: "bi-stars" },
    { title: "Facials & Cleanup", desc: "Hydra, gold and anti-tan facials for glowing skin.", price: "from ₹899", icon: "bi-flower1" },
    { title: "Bridal Makeup", desc: "HD and airbrush bridal makeup with a free trial session.", price: "from ₹14,999", icon: "bi-heart" },
    { title: "Manicure & Pedicure", desc: "Relaxing spa mani-pedi with nail art on request.", price: "from ₹699", icon: "bi-brush" }
  ],
  menuCategories: [],
  heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop&q=70",
  logo: "images/logo.png",
  gallery: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=70",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&q=70",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=70",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=70",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&q=70"
  ],
  testimonials: [
    { name: "Kavya S.", text: "Got my bridal makeup done here and it was flawless. It stayed perfect for 12 hours and the photos came out beautiful.", rating: 5 },
    { name: "Arjun M.", text: "Finally found a salon in Indiranagar that understands men's haircuts. Clean, on time and fairly priced.", rating: 5 },
    { name: "Divya R.", text: "Loved my balayage! Ananya explained everything before starting and the result was exactly what I wanted.", rating: 5 }
  ],
  faqs: [],                  // empty = salon default FAQs
  social: { instagram: "https://instagram.com/", facebook: "", youtube: "" },
  languages: ["en", "hi"],
  theme: "auto",
  sections: [],
  developer: { name: "Your Name", phone: "+91 90000 00000", whatsapp: "919000000000", portfolio: "https://mydomain.com" }
};
