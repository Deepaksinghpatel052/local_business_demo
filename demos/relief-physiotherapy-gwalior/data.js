/*
 * data.js: the ONLY file you edit for this business.
 * Created 2026-10-19 by new_demo.py.
 *
 * Required: name, category, phone, address. Anything left as "TODO" or ""
 * is ignored: that section is hidden or falls back to category defaults.
 * Images: a relative path ("images/hero.jpg") or a full https URL.
 * Hours: "9:00-22:00", "10:00-14:00, 17:00-21:00", "closed" or "24h".
 *
 * Still to add: 2-4 real Google reviews (testimonials), Dr. Rahul's years of
 * experience, and real clinic photos.
 * doctor.jpg, qualifications and hours come from the clinic's Facebook poster;
 * the other photos in images/ are Unsplash stock (see images/CREDITS.md).
 */
window.BUSINESS = {
  name: "Relief Physiotherapy Clinic & Neuro Spine Care",
  slug: "relief-physiotherapy-gwalior",
  category: "clinic",   // restaurant | cafe | bakery | salon | spa | gym | clinic | dentist | hospital | school | coaching | hotel | car-service | garage | electronics | hardware | boutique | jewellery | real-estate | bar | travel | taxi | handyman | general
  tagline: "Physiotherapy and neuro spine care in Lashkar, Gwalior, rated 4.9★ by 234 patients",
  about: "Relief Physiotherapy Clinic & Neuro Spine Care is Dr. Rahul Kurcija's clinic inside Gshri Hospital on Hospital Road, Lashkar. We treat back and neck pain, slip disc, sciatica, joint pain and sports injuries, and help patients recover movement after stroke, paralysis and surgery, with a treatment plan built around each patient. Visits are by appointment, so you get the doctor's full attention.",
  established: "TODO",        // year, e.g. "1998"
  owner: "Dr. Rahul Kurcija",
  phone: "+91 79746 29581",
  whatsapp: "917974629581",   // same mobile as the phone number
  email: "TODO",
  address: "Gshri Hospital, Hospital Rd, near Gurudev Medical, opposite Madhav Dispensary, Lalitpur Colony, Lashkar, Gwalior, Madhya Pradesh 474009",
  city: "Gwalior",
  mapQuery: "Relief Physiotherapy clinic and Neuro spine care Dr Rahul Kurcija Gshri Hospital Lashkar Gwalior",
  hours: { mon: "9:00-18:00", tue: "9:00-18:00", wed: "9:00-18:00", thu: "9:00-18:00", fri: "9:00-18:00", sat: "9:00-18:00", sun: "closed" },
  rating: 4.9,
  reviewCount: 234,
  highlights: ["4.9★ on Google", "Appointment Based", "Wheelchair Accessible", "Free Parking", "Google Pay & NFC Payments", "Nursing Room", "LGBTQ+ Friendly"],
  services: [
    { title: "Back & Neck Pain", desc: "Relief for lower back pain, neck stiffness and cervical spondylosis with manual therapy and guided exercise.", price: "", icon: "bi-person-standing" },
    { title: "Slip Disc & Sciatica", desc: "Non-surgical care for disc problems and nerve pain running down the leg.", price: "", icon: "bi-lightning-charge" },
    { title: "Neuro Rehabilitation", desc: "Recovery programmes after stroke, paralysis, Bell's palsy and other nerve conditions.", price: "", icon: "bi-activity" },
    { title: "Joint Pain & Arthritis", desc: "Knee, shoulder and hip pain, frozen shoulder and arthritis, treated to restore easy movement.", price: "", icon: "bi-bandaid" },
    { title: "Post-Surgery Rehab", desc: "Step-by-step rehab after knee or hip replacement, fractures and spine surgery.", price: "", icon: "bi-hospital" },
    { title: "Sports Injuries", desc: "Ligament sprains, muscle tears and tendon pain, with a safe plan back to sport.", price: "", icon: "bi-trophy" }
  ],
  menuCategories: [],
  doctor: {                  // shown in the "Meet the Doctor" card
    name: "Dr. Rahul Kurcija (PT)", title: "Consultant Physiotherapist, Spine & Posture Specialist", qualification: "B.P.Th, COMT, M.P.Th (Neurology), FOMT (Australia), DO (Canada), MIAP", experience: "",
    photo: "images/doctor.jpg", about: "Consultant Physiotherapist and Spine & Posture Specialist, and a member of the Indian Association of Physiotherapists. Dr. Rahul treats spine, joint and nerve conditions with hands-on therapy and exercise plans patients can follow at home.",
    specialities: ["Physiotherapy", "Neuro Rehabilitation", "Spine Care", "Back & Neck Pain", "Sports Injuries", "Post-Surgery Rehab"]
  },
  heroImage: "images/hero.png",
  logo: "images/logo-web.png",   // web-sized copy of images/logo.png
  logoWidth: 118,            // wide logo shown at this width (px) instead of icon + business name
  gallery: [
    { src: "images/therapy.jpg", caption: "Hands-on physiotherapy" },
    { src: "images/spine-scan.jpg", caption: "Spine and nerve assessment" },
    { src: "images/hand-rehab.jpg", caption: "Hand and wrist rehabilitation" },
    { src: "images/neuro.jpg", caption: "Neuro spine care" }
  ],
  testimonials: [],          // copy 2-4 real Google reviews: { name, text, rating }
  whyChooseUs: [
    { icon: "bi-star-fill", title: "Rated 4.9★ on Google", text: "Trusted by 234 patients who reviewed us on Google." },
    { icon: "bi-calendar-check", title: "Appointment based", text: "Book ahead and get unhurried, one-to-one treatment." },
    { icon: "bi-universal-access", title: "Fully accessible", text: "Wheelchair-accessible parking, entrance and toilet." },
    { icon: "bi-p-circle", title: "Free parking", text: "Free parking lot at Gshri Hospital, Hospital Road." }
  ],
  faqs: [
    { q: "Do I need an appointment?", a: "Yes. The clinic works by appointment. Call or WhatsApp us with your name and preferred time and we will confirm your slot." },
    { q: "Where is the clinic?", a: "Inside Gshri Hospital on Hospital Road, near Gurudev Medical and opposite Madhav Dispensary, Lalitpur Colony, Lashkar, Gwalior." },
    { q: "Is the clinic wheelchair accessible?", a: "Yes. The car park, entrance and toilet are all wheelchair accessible, and there is a free parking lot." },
    { q: "How many physiotherapy sessions will I need?", a: "It depends on your condition. After your first assessment, Dr. Rahul will explain the treatment plan and the expected number of sessions." },
    { q: "Which payment methods do you accept?", a: "Google Pay and NFC mobile payments are accepted at the clinic." },
    { q: "What should I bring to my first visit?", a: "Please bring any X-ray, MRI or other reports, previous prescriptions and a list of the medicines you take." }
  ],
  social: { instagram: "", facebook: "https://www.facebook.com/Dr.Rahul001/", youtube: "" },
  languages: ["en", "hi"],   // remove "hi" to hide the Hindi toggle
  theme: { primary: "#053771", primaryDark: "#03264F", accent: "#1E88E5", background: "#FFFFFF", surface: "#FFFFFF", text: "#0B1F3A" },   // clinic brand: navy #053771 + white
  sections: [],              // optional order, e.g. ["hero","about","services","gallery","contact"]
  developer: { name: "Devnixplus", phone: "+91 91835 59191", whatsapp: "919183559191", portfolio: "https://www.devnixplus.com" }
};
