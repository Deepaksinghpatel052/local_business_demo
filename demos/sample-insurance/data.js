/*
 * data.js: the ONLY file you edit for this business.
 * SAMPLE: insurance & mutual fund advisor: own look (navy & green, IBM Plex Sans + Source Sans 3),
 * split hero, plans first, each plan with the advisor's own referral link ("link"), and the
 * insurance / mutual fund disclaimer in the footer (category default).
 * All details below are dummy data: the links point to example.com and the ARN is not real.
 */
window.BUSINESS = {
  name: "Mehta Insurance & Investments",
  slug: "sample-insurance",
  category: "insurance",
  tagline: "Term, health and motor insurance plus mutual fund SIPs, explained simply in Adajan",
  about: "Anil Mehta has helped more than 1,200 families in Surat protect their income and grow their savings since 2011. You get plans from several companies compared side by side, in plain Gujarati, Hindi or English, with no pressure to buy. And when it is time to claim, Anil handles the paperwork and follows up until the money reaches you.",
  established: "2011",
  owner: "Anil Mehta",
  phone: "+91 91835 59191",
  whatsapp: "919183559191",
  email: "",
  address: "Office 204, Star Plaza, Anand Mahal Road, Adajan, Surat, Gujarat 395009",
  mapQuery: "Anand Mahal Road Adajan Surat",
  hours: { mon: "10:00-19:00", tue: "10:00-19:00", wed: "10:00-19:00", thu: "10:00-19:00", fri: "10:00-19:00", sat: "10:00-14:00", sun: "closed" },
  rating: 4.9,
  reviewCount: 356,
  highlights: ["IRDAI Licensed Agent", "AMFI Registered (ARN-000000)", "Claim Support", "SIP from ₹500", "Tax Saving Plans"],
  services: [
    { title: "Term Life Insurance", desc: "₹1 crore cover for your family at a low yearly premium. Compare top insurers in minutes.", price: "from ₹490/month", icon: "bi-shield-check",
      link: "https://example.com/your-referral-link/term-insurance", linkLabel: "Get a term quote" },
    { title: "Family Health Insurance", desc: "Cashless treatment at thousands of hospitals, covering parents too.", price: "from ₹850/month", icon: "bi-heart-pulse",
      link: "https://example.com/your-referral-link/health-insurance", linkLabel: "Check health plans" },
    { title: "Mutual Fund SIP", desc: "Goal-based SIPs for your child's education, a home or retirement.", price: "from ₹500/month", icon: "bi-graph-up-arrow",
      link: "https://example.com/your-referral-link/start-sip", linkLabel: "Start a SIP online" },
    { title: "Tax Saving (ELSS)", desc: "Save tax under Section 80C with a 3-year lock-in equity fund.", price: "", icon: "bi-receipt",
      link: "https://example.com/your-referral-link/elss", linkLabel: "Invest in ELSS" },
    { title: "Car & Bike Insurance", desc: "Quick renewals, zero-depreciation add-ons and claim help.", price: "", icon: "bi-car-front",
      link: "https://example.com/your-referral-link/motor-insurance", linkLabel: "Renew motor insurance" },
    { title: "Retirement Planning", desc: "A clear monthly plan to build your pension corpus.", price: "Free consultation", icon: "bi-piggy-bank" }
  ],
  menuCategories: [],
  heroImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&h=900&fit=crop&q=70",
  logo: "",
  gallery: [
    { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=70", caption: "Your portfolio, tracked every quarter" },
    { src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=70", caption: "Free family review meetings" },
    { src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=70", caption: "Claims handled for you" }
  ],
  testimonials: [
    { name: "Hetal P.", text: "When my father was hospitalised, Anil bhai handled the cashless claim from start to end. We did not pay a rupee from our pocket.", rating: 5 },
    { name: "Rakesh S.", text: "He explained term insurance so simply. I compared three companies with him and bought the right cover in one meeting.", rating: 5 },
    { name: "Priya D.", text: "Started a SIP for my daughter's education. He reviews it with us every year and never pushes products.", rating: 5 }
  ],
  whyChooseUs: [
    { icon: "bi-patch-check", title: "Licensed and registered", text: "IRDAI licensed agent and AMFI registered mutual fund distributor." },
    { icon: "bi-list-check", title: "Plans compared for you", text: "Several companies side by side, explained in your language." },
    { icon: "bi-file-earmark-check", title: "1,200+ claims supported", text: "We stay with you from the first document to the settlement." },
    { icon: "bi-calendar-check", title: "Yearly free review", text: "We check your cover and SIPs every year as your life changes." }
  ],
  faqs: [],                  // empty = insurance advisor default FAQs
  social: { instagram: "", facebook: "https://facebook.com/", youtube: "https://youtube.com/" },
  languages: ["en", "hi"],
  theme: {},
  sections: [],
  developer: { name: "Devnixplus", phone: "+91 91835 59191", whatsapp: "919183559191", portfolio: "https://www.devnixplus.com" }
};
