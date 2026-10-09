/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: restaurant with a MANUAL theme (brand colours + fonts set below),
 * tabbed menu, and a gallery that mixes local images and https URLs.
 * All details below are dummy data.
 */
window.BUSINESS = {
  name: "Sharma Sweets & Restaurant",
  slug: "sample-restaurant",
  category: "restaurant",
  tagline: "Pure veg sweets and meals since 1998",
  about: "What started as a small mithai counter in Kamla Nagar is now a family restaurant loved across Agra. Our halwais still make every sweet by hand each morning in pure desi ghee, and our kitchen serves wholesome North Indian thalis, chaat and South Indian favourites, all 100% vegetarian.",
  established: "1998",
  owner: "Ramesh Sharma",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "hello@sharmasweets.example",
  address: "Shop 12, Main Market, Kamla Nagar, Agra, UP 282005",
  mapQuery: "Kamla Nagar Main Market Agra",
  hours: { mon: "9:00-22:00", tue: "9:00-22:00", wed: "9:00-22:00", thu: "9:00-22:00", fri: "9:00-22:00", sat: "9:00-23:00", sun: "closed" },
  rating: 4.6,
  reviewCount: 312,
  highlights: ["Pure Veg", "Home Delivery", "Family Seating", "Parking", "UPI & Cards"],
  services: [
    { title: "Sharma Special Thali", desc: "Two sabzis, dal makhani, paneer, rice, 4 rotis, raita, salad and a sweet.", price: "₹180", image: "images/hero.jpg" },
    { title: "Paneer Butter Masala", desc: "Soft paneer in our signature creamy tomato gravy.", price: "₹220", image: "images/paneer-butter-masala.jpg" },
    { title: "Samosa Chaat", desc: "Crisp samosas topped with chole, curd and three chutneys.", price: "₹70", image: "images/samosa.jpg" }
  ],
  menuCategories: [
    {
      name: "Sweets", icon: "bi-cake2",
      items: [
        { title: "Kaju Katli", desc: "Per 250 g, made fresh daily", price: "₹240", veg: true, tag: "Bestseller" },
        { title: "Motichoor Ladoo", desc: "Per 250 g, pure desi ghee", price: "₹160", veg: true },
        { title: "Rasmalai (2 pcs)", desc: "Chilled, with saffron milk", price: "₹90", veg: true },
        { title: "Agra Petha", desc: "Per 500 g, assorted flavours", price: "₹180", veg: true }
      ]
    },
    {
      name: "Thalis & Mains", icon: "bi-egg-fried",
      items: [
        { title: "Sharma Special Thali", desc: "Our complete meal, unlimited rotis at lunch", price: "₹180", veg: true, tag: "Must try" },
        { title: "Dal Makhani", desc: "Slow-cooked overnight", price: "₹190", veg: true },
        { title: "Paneer Butter Masala", desc: "Rich, creamy, mildly sweet", price: "₹220", veg: true },
        { title: "Chole Bhature", desc: "Two bhature with pindi chole", price: "₹120", veg: true }
      ]
    },
    {
      name: "Chaat & Snacks", icon: "bi-fire",
      items: [
        { title: "Samosa (2 pcs)", desc: "With mint and tamarind chutney", price: "₹40", veg: true },
        { title: "Pav Bhaji", desc: "Buttery bhaji with two pavs", price: "₹110", veg: true },
        { title: "Dahi Bhalla", desc: "Soft bhallas in sweet curd", price: "₹80", veg: true },
        { title: "Raj Kachori", desc: "The king of chaat", price: "₹90", veg: true }
      ]
    },
    {
      name: "South Indian", icon: "bi-cup-hot",
      items: [
        { title: "Masala Dosa", desc: "With sambar and coconut chutney", price: "₹120", veg: true },
        { title: "Idli Vada Combo", desc: "2 idli + 1 vada", price: "₹90", veg: true },
        { title: "Filter Coffee", desc: "Strong and frothy", price: "₹40", veg: true }
      ]
    }
  ],
  heroImage: "images/hero.jpg",
  logo: "images/logo.png",
  gallery: [
    { src: "images/paneer-butter-masala.jpg", caption: "Paneer Butter Masala" },
    "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&h=600&fit=crop&q=70",
    { src: "images/samosa.jpg", caption: "Fresh samosas" },
    { src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop&q=70", caption: "Paneer tikka sizzler" },
    { src: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop&q=70", caption: "Idli vada" }
  ],
  testimonials: [
    { name: "Priya Agarwal", text: "Best kaju katli in Agra, hands down. We order from here for every festival and the quality never changes.", rating: 5 },
    { name: "Rohit Verma", text: "The special thali is great value. Clean place, quick service and very polite staff. Perfect for family dinners.", rating: 5 },
    { name: "Neha Gupta", text: "Their chaat and pav bhaji are amazing. Home delivery came hot and on time. Highly recommended!", rating: 4 }
  ],
  faqs: [
    { q: "Is everything 100% vegetarian?", a: "Yes. Our kitchen is pure vegetarian and we do not use onion or garlic in our Jain menu, available on request." },
    { q: "Do you deliver sweets and food at home?", a: "Yes, within 5 km of Kamla Nagar. Send your order on WhatsApp and we will confirm the delivery time." },
    { q: "Can I order sweet boxes for weddings and festivals?", a: "Absolutely. We make custom gift boxes in bulk. Please order 2-3 days in advance for large quantities." },
    { q: "Do you have parking?", a: "Yes, free parking is available in the Main Market parking right next to the shop." }
  ],
  social: { instagram: "https://instagram.com/", facebook: "https://facebook.com/", youtube: "" },
  languages: ["en", "hi"],
  /* MANUAL theme: these override the "food" preset. primaryDark is
     generated automatically, button text colour is chosen for contrast. */
  theme: {
    primary: "#A3154A",
    accent: "#F2A900",
    background: "#FFF9F0",
    headingFont: "Yeseva One",
    bodyFont: "Nunito",
    buttonStyle: "rounded",
    borderRadius: "12px"
  },
  sections: [],
  developer: { name: "Your Name", phone: "+91 90000 00000", whatsapp: "919000000000", portfolio: "https://mydomain.com" }
};
