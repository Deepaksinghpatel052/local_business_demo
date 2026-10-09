/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: clinic using the DEFAULT "medical" preset (theme: {}), no logo
 * (text logo from initials), no photos (category placeholders) and default
 * FAQs: what a quickly filled demo looks like. All details are dummy data.
 */
window.BUSINESS = {
  name: "Dr. Mehta's Family Clinic",
  slug: "sample-clinic",
  category: "clinic",   // restaurant | cafe | bakery | salon | spa | gym | clinic | dentist | hospital | school | coaching | hotel | car-service | electronics | hardware | boutique | jewellery | real-estate | general
  tagline: "Caring, honest treatment for your whole family",
  about: "Dr. Mehta's Family Clinic has looked after families in Navrangpura for over 15 years. We treat everyday illnesses, manage long-term conditions like diabetes and blood pressure, and offer preventive health check-ups, always with clear advice and no unnecessary tests.",
  established: "2009",
  owner: "Dr. Anil Mehta",
  phone: "+91 97250 12345",
  whatsapp: "919725012345",
  email: "care@mehtaclinic.example",
  address: "2nd Floor, Shivam Complex, CG Road, Navrangpura, Ahmedabad, Gujarat 380009",
  city: "",
  mapQuery: "CG Road Navrangpura Ahmedabad",
  hours: { mon: "9:30-13:30, 17:00-21:00", tue: "9:30-13:30, 17:00-21:00", wed: "9:30-13:30, 17:00-21:00", thu: "9:30-13:30, 17:00-21:00", fri: "9:30-13:30, 17:00-21:00", sat: "9:30-13:30", sun: "closed" },
  rating: 4.7,
  reviewCount: 186,
  highlights: ["Experienced Doctor", "Appointments on WhatsApp", "Wheelchair Accessible", "Lab Tests Arranged"],
  services: [
    { title: "General Consultation", desc: "Fever, infections, allergies and everyday health concerns.", price: "₹500", icon: "bi-clipboard2-pulse" },
    { title: "Diabetes & BP Care", desc: "Regular monitoring, medicine review and diet advice.", price: "", icon: "bi-activity" },
    { title: "Health Check-ups", desc: "Full-body packages for adults and senior citizens.", price: "from ₹1,499", icon: "bi-heart-pulse" },
    { title: "Child Care & Vaccines", desc: "Growth check-ups and vaccinations as per IAP schedule.", price: "", icon: "bi-shield-plus" }
  ],
  menuCategories: [],
  doctor: {                  // shown in the "Meet the Doctor" card
    name: "Dr. Anil Mehta", qualification: "MBBS, MD (General Medicine)", experience: "18+ years",
    photo: "", about: "Dr. Mehta is known for his patient, unhurried consultations and practical advice that families can actually follow.",
    specialities: ["Family Medicine", "Diabetes", "Hypertension", "Thyroid", "Preventive Health"]
  },
  heroImage: "",             // empty = category placeholder
  logo: "",                  // empty = text logo from initials
  gallery: [],               // empty = category placeholders
  testimonials: [
    { name: "Hetal Shah", text: "Dr. Mehta has been our family doctor for ten years. He listens patiently and never prescribes unnecessary medicines.", rating: 5 },
    { name: "Vikram Patel", text: "Booked on WhatsApp and was seen within 10 minutes of arriving. Clean clinic and very helpful staff.", rating: 5 }
  ],
  faqs: [],                  // empty = clinic default FAQs
  social: { instagram: "", facebook: "", youtube: "" },
  languages: ["en", "hi"],
  theme: {},                 // {} = default "medical" preset
  sections: [],
  developer: { name: "Your Name", phone: "+91 90000 00000", whatsapp: "919000000000", portfolio: "https://mydomain.com" }
};
