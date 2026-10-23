/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: pet shop, second design ("Studio"): a premium grooming studio that sells by story
 * and trust. Full-photo hero (heroStyle), forest green & mustard, Fraunces + DM Sans, square
 * buttons, about first, no highlights or CTA band. Compare with sample-pet-shop.
 * Photos are full https URLs. All details below are dummy data.
 */
window.BUSINESS = {
  name: "Paws & Co. Grooming Studio",
  slug: "sample-pet-shop-studio",
  category: "pet-shop",
  tagline: "Calm, careful grooming and hand-picked pet essentials in C-Scheme",
  about: "Paws & Co. is a small, appointment-only grooming studio and pet boutique started by certified groomer Meera Joshi. One pet at a time, no cages and no rush: every groom starts with a cuddle and ends with a photo for you. Our shelf has only what we use and trust ourselves, from grain-free food to natural shampoos and handmade collars.",
  established: "2019",
  owner: "Meera Joshi",
  phone: "+91 91835 59191",
  whatsapp: "919183559191",
  email: "",
  address: "12 Prithviraj Road, C-Scheme, Jaipur, Rajasthan 302001",
  mapQuery: "Prithviraj Road C-Scheme Jaipur",
  hours: { mon: "closed", tue: "10:00-19:00", wed: "10:00-19:00", thu: "10:00-19:00", fri: "10:00-19:00", sat: "9:00-20:00", sun: "9:00-20:00" },
  rating: 4.9,
  reviewCount: 284,
  highlights: [],
  services: [
    { title: "Signature Spa Groom", desc: "Warm bath with natural shampoo, blow-dry, breed haircut, nail trim, ear cleaning and a bandana.", price: "from ₹1,499", icon: "bi-stars" },
    { title: "Bath & Tidy", desc: "Bath, blow-dry, paw and face tidy-up between full grooms.", price: "from ₹799", icon: "bi-droplet" },
    { title: "Puppy's First Groom", desc: "A short, gentle session to get puppies used to grooming.", price: "₹599", icon: "bi-heart" },
    { title: "Cat Grooming", desc: "Calm, quiet slots for cats: brushing, bath and nail trim.", price: "from ₹999", icon: "bi-moon-stars" },
    { title: "Tick & Flea Care", desc: "Medicated bath and treatment with a home-care plan.", price: "from ₹899", icon: "bi-shield-check" },
    { title: "Boutique Essentials", desc: "Grain-free food, natural shampoos, handmade collars and beds.", price: "", icon: "bi-bag-heart" }
  ],
  menuCategories: [],
  heroImage: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=1600&h=900&fit=crop&q=70",
  logo: "",
  gallery: [
    { src: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=800&h=600&fit=crop&q=70", caption: "Cuddles first, always" },
    { src: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800&h=600&fit=crop&q=70", caption: "Fresh from a schnauzer cut" },
    { src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=600&fit=crop&q=70", caption: "Cats and dogs welcome" },
    { src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop&q=70", caption: "Happy after a spa groom" }
  ],
  testimonials: [
    { name: "Ishita R.", text: "Simba is scared of strangers, but Meera took her time and he actually enjoyed it. No cages, and they sent photos during the groom.", rating: 5 },
    { name: "Karan P.", text: "Best breed cut our shih tzu has ever had in Jaipur. Booking on WhatsApp is easy and they are always on time.", rating: 5 },
    { name: "Neha G.", text: "Finally a place that grooms cats gently. Quiet room, no rush, and my Persian came home calm.", rating: 5 }
  ],
  faqs: [
    { q: "How long does a groom take?", a: "About 1.5 to 3 hours depending on breed and coat. We groom one pet at a time and message you when it is time for pickup." },
    { q: "Do you use cages or sedation?", a: "Never. Pets wait in a quiet play area, and we take breaks if your pet gets anxious." },
    { q: "Can I stay during the groom?", a: "Yes, you are welcome to stay for the first visit so your pet feels at home." },
    { q: "Do you offer pickup and drop?", a: "Yes, within 5 km for a small fee. Ask when you book on WhatsApp." }
  ],
  whyChooseUs: [
    { icon: "bi-person-heart", title: "One pet at a time", text: "No queue, no cages: your pet gets our full attention." },
    { icon: "bi-award", title: "Certified groomer", text: "Trained in breed cuts and handling anxious pets." },
    { icon: "bi-flower1", title: "Natural products", text: "Gentle, paraben-free shampoos safe for sensitive skin." },
    { icon: "bi-camera", title: "Photo updates", text: "We send you photos on WhatsApp during every groom." }
  ],
  social: { instagram: "https://instagram.com/", facebook: "", youtube: "" },
  languages: ["en", "hi"],
  heroStyle: "full",
  theme: {
    primary: "#1F4D3A",
    accent: "#E3B448",
    background: "#F6F3EC",
    surface: "#FFFFFF",
    text: "#1B241F",
    headingFont: "Fraunces",
    bodyFont: "DM Sans",
    buttonStyle: "square",
    borderRadius: "4px"
  },
  sections: ["hero", "about", "services", "gallery", "testimonials", "why", "hours", "faq", "contact"],
  developer: { name: "Devnixplus", phone: "+91 91835 59191", whatsapp: "919183559191", portfolio: "https://www.devnixplus.com" }
};
