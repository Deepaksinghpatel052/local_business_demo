/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: cafe: own look (coffee brown, Lora), split hero, cafe photos.
 * All details below are dummy data.
 */
window.BUSINESS = {
  name: "Brew Theory Café",
  slug: "sample-cafe",
  category: "cafe",
  tagline: "Specialty coffee, all-day breakfast and work-friendly corners in Bandra",
  about: "Brew Theory is a small specialty café on Hill Road. We roast single-origin Indian beans every week, bake our own croissants and banana bread, and keep a few quiet tables with plug points for people who work on the go.",
  established: "2020",
  owner: "",
  phone: "+91 90000 10010",
  whatsapp: "919000010010",
  email: "",
  address: "Shop 3, Silver Arch, Hill Road, Bandra West, Mumbai, Maharashtra 400050",
  city: "",
  mapQuery: "Hill Road Bandra West Mumbai",
  hours: {"mon": "8:00-22:00", "tue": "8:00-22:00", "wed": "8:00-22:00", "thu": "8:00-22:00", "fri": "8:00-22:00", "sat": "8:00-23:00", "sun": "8:00-23:00"},
  rating: 4.6,
  reviewCount: 1320,
  highlights: ["Specialty Coffee", "Free Wi-Fi", "All-Day Breakfast", "Pet Friendly", "Card & UPI"],
  services: [],
  menuCategories: [
    {
      name: "Coffee", icon: "bi-cup-hot",
      items: [
        {"title": "Cappuccino", "desc": "Double shot, silky milk", "price": "₹220", "veg": true, "tag": "Bestseller"},
        {"title": "Pour Over", "desc": "Single-origin Chikmagalur beans", "price": "₹260", "veg": true},
        {"title": "Cold Brew Tonic", "desc": "18-hour cold brew with tonic and orange", "price": "₹280", "veg": true},
        {"title": "Filter Kaapi", "desc": "South Indian classic, with chicory", "price": "₹160", "veg": true}
      ]
    },
    {
      name: "Breakfast", icon: "bi-egg-fried",
      items: [
        {"title": "Avocado Toast", "desc": "Sourdough, chilli flakes, feta", "price": "₹340", "veg": true},
        {"title": "Masala Omelette", "desc": "With buttered toast", "price": "₹240", "veg": false},
        {"title": "Granola Bowl", "desc": "Greek yoghurt, honey, fruit", "price": "₹290", "veg": true}
      ]
    },
    {
      name: "Bakes", icon: "bi-basket",
      items: [
        {"title": "Butter Croissant", "desc": "Baked every morning", "price": "₹160", "veg": false},
        {"title": "Banana Bread", "desc": "With walnuts", "price": "₹140", "veg": false},
        {"title": "Chocolate Brownie", "desc": "Fudgy, served warm", "price": "₹170", "veg": false}
      ]
    }
  ],
  heroImage: "",
  logo: "",
  gallery: [],
  testimonials: [
    {"name": "Rhea D.", "text": "The best pour over in Bandra, and the staff actually explain the beans. My go-to work spot.", "rating": 5},
    {"name": "Sameer K.", "text": "Great avocado toast and super fast Wi-Fi. Gets busy on weekends, so come early.", "rating": 5}
  ],
  faqs: [],
  social: {"instagram": "", "facebook": "", "youtube": ""},
  languages: ["en", "hi"],
  theme: {},
  sections: [],
  developer: {"name": "Your Name", "phone": "+91 90000 00000", "whatsapp": "919000000000", "portfolio": "https://mydomain.com"}
};
