/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: bar: new nightlife preset (dark), tabbed drinks menu.
 * All details below are dummy data.
 */
window.BUSINESS = {
  name: "The Copper Tap",
  slug: "sample-bar",
  category: "bar",
  tagline: "Craft beer, cocktails and live music in Indiranagar",
  about: "The Copper Tap is a neighbourhood bar on 100 Feet Road with six beers on tap, a cocktail list that changes with the seasons and live acoustic sets every weekend. Come for a quiet after-work pint or stay for the late-night crowd.",
  established: "2019",
  owner: "",
  phone: "+91 90000 10004",
  whatsapp: "919000010004",
  email: "",
  address: "No. 742, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
  city: "",
  mapQuery: "100 Feet Road Indiranagar Bengaluru",
  hours: {"mon": "12:00-23:30", "tue": "12:00-23:30", "wed": "12:00-23:30", "thu": "12:00-23:30", "fri": "12:00-23:30", "sat": "12:00-01:00", "sun": "12:00-23:30"},
  rating: 4.5,
  reviewCount: 2140,
  highlights: ["Craft Beer on Tap", "Live Music Weekends", "Sports Screening", "Rooftop Seating", "Card & UPI"],
  services: [],
  menuCategories: [
    {
      name: "Cocktails", icon: "bi-cup-straw",
      items: [
        {"title": "Copper Old Fashioned", "desc": "Bourbon, jaggery syrup, orange bitters", "price": "₹650", "tag": "Signature"},
        {"title": "Kokum Margarita", "desc": "Tequila, kokum, lime, chilli salt rim", "price": "₹550"},
        {"title": "Masala Mule", "desc": "Vodka, ginger beer, chaat masala, mint", "price": "₹520"},
        {"title": "Espresso Martini", "desc": "Vodka, coffee liqueur, fresh espresso", "price": "₹600"}
      ]
    },
    {
      name: "Beer on Tap", icon: "bi-cup",
      items: [
        {"title": "Hefeweizen (pint)", "desc": "Cloudy wheat beer, banana and clove notes", "price": "₹380", "tag": "Bestseller"},
        {"title": "Belgian Witbier (pint)", "desc": "Orange peel and coriander", "price": "₹380"},
        {"title": "IPA (pint)", "desc": "Hoppy, citrusy and bitter", "price": "₹420"},
        {"title": "Beer Tower (3 L)", "desc": "Any tap beer, for the table", "price": "₹1,650"}
      ]
    },
    {
      name: "Bar Bites", icon: "bi-egg-fried",
      items: [
        {"title": "Peri-Peri Fries", "desc": "Crispy fries with peri-peri dust", "price": "₹240", "veg": true},
        {"title": "Chilli Paneer Dry", "desc": "Indo-Chinese classic", "price": "₹320", "veg": true},
        {"title": "Chicken Wings", "desc": "Hot buffalo or barbecue glaze", "price": "₹380", "veg": false, "tag": "Spicy"},
        {"title": "Nachos Grande", "desc": "Cheese, salsa, jalapeños, sour cream", "price": "₹340", "veg": true}
      ]
    }
  ],
  heroImage: "",
  logo: "",
  gallery: [],
  testimonials: [
    {"name": "Vikram R.", "text": "Best hefeweizen in the city and the live music on Saturday was brilliant. Staff are quick even when it is packed.", "rating": 5},
    {"name": "Nisha P.", "text": "Hosted my birthday here for 15 people. They reserved the rooftop corner and the cocktails were spot on.", "rating": 5},
    {"name": "Arjun T.", "text": "Great place to watch the match with friends. Wings are a must-try.", "rating": 4}
  ],
  faqs: [
    {"q": "Do I need to reserve a table?", "a": "Walk-ins are welcome, but on Friday and Saturday nights we recommend reserving on WhatsApp so your table is ready."},
    {"q": "Is there a cover charge?", "a": "There is no cover charge on regular nights. Some special event nights have a cover that is fully redeemable on food and drinks."},
    {"q": "Do you host private parties?", "a": "Yes. Our rooftop section seats up to 40 guests. Share your date and headcount on WhatsApp for a package."},
    {"q": "Is there an age limit?", "a": "Alcohol is served only to guests aged 21 and above. Please carry a valid photo ID."}
  ],
  social: {"instagram": "", "facebook": "", "youtube": ""},
  languages: ["en", "hi"],
  theme: {},
  sections: [],
  developer: {"name": "Your Name", "phone": "+91 90000 00000", "whatsapp": "919000000000", "portfolio": "https://mydomain.com"}
};
