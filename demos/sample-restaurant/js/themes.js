/*!
 * themes.js — category presets for the Local Business Demo template.
 *
 * PRESETS      = visual families (palette, fonts, button style, defaults).
 * CATEGORIES   = every allowed `category` value in data.js, mapped to a preset
 *                plus category-specific labels, icons, schema type and
 *                default services.
 * FONT_WEIGHTS = Google Fonts weights to request per family (requesting a
 *                weight a font doesn't have makes Google return an error).
 *
 * Text tokens available in default copy: {name} {city} {category}
 */
(function (window) {
  'use strict';

  var FONT_WEIGHTS = {
    'Playfair Display': '500;600;700',
    'Nunito': '400;600;700',
    'Cormorant Garamond': '500;600;700',
    'Jost': '400;500;600',
    'Oswald': '500;600;700',
    'Barlow': '400;500;600;700',
    'Poppins': '400;500;600;700',
    'Open Sans': '400;600;700',
    'Montserrat': '500;600;700;800',
    'Mulish': '400;600;700',
    'Rajdhani': '500;600;700',
    'Roboto': '400;500;700',
    'Cinzel': '500;600;700',
    'Raleway': '400;500;600;700',
    'DM Serif Display': '400',
    'DM Sans': '400;500;700',
    'Plus Jakarta Sans': '400;500;600;700;800',
    'Inter': '400;500;600;700',
    'Lora': '400;500;600;700',
    'Outfit': '400;500;600;700',
    'Josefin Sans': '400;600;700',
    'Marcellus': '400',
    'Fredoka': '400;500;600;700',
    'Quicksand': '500;600;700',
    'Manrope': '400;500;600;700;800',
    'Sora': '400;600;700;800',
    'Space Grotesk': '400;500;600;700',
    'Archivo': '400;500;600;700;800',
    'Saira': '400;500;600;700',
    'Fraunces': '500;600;700',
    'Bodoni Moda': '400;500;600;700',
    'Bebas Neue': '400',
    'Yeseva One': '400',
    'Rozha One': '400',
    'Lato': '400;700',
    'Noto Sans Devanagari': '400;600;700'
  };

  var PRESETS = {
    /* Restaurant / cafe / bakery — warm reds, oranges, cream */
    food: {
      label: 'Food & Dining',
      palette: { primary: '#B7322C', accent: '#F2A541', background: '#FFF8EF', surface: '#FFFFFF', text: '#2D1B14' },
      headingFont: 'Playfair Display',
      bodyFont: 'Nunito',
      buttonStyle: 'pill',
      borderRadius: '16px',
      alternatives: [
        { name: 'Saffron Spice', primary: '#C2410C', accent: '#EAB308', background: '#FFFBF2', surface: '#FFFFFF', text: '#2B1A0E' },
        { name: 'Leafy Green', primary: '#2E7D32', accent: '#F59E0B', background: '#F6FBF2', surface: '#FFFFFF', text: '#1B2A1C' }
      ],
      highlightIcon: 'bi-stars',
      taglineDefault: 'Fresh food and warm hospitality in {city}',
      aboutDefault: '{name} is a much-loved {category} in {city}. We cook every dish fresh, with quality ingredients and the same care we would give our own family. Come in for a meal, order a takeaway, or call us for home delivery.',
      whyChooseUs: [
        { icon: 'bi-fire', title: 'Freshly cooked', text: 'Every order is prepared fresh in our kitchen, never reheated.' },
        { icon: 'bi-shield-check', title: 'Clean & hygienic', text: 'A spotless kitchen and filtered water, every single day.' },
        { icon: 'bi-currency-rupee', title: 'Honest prices', text: 'Generous portions at prices that feel fair.' },
        { icon: 'bi-people', title: 'Family friendly', text: 'Comfortable seating for families, friends and groups.' }
      ],
      faqs: [
        { q: 'Do you offer home delivery?', a: 'Yes. Call us or send a WhatsApp message with your order and address, and we will confirm the delivery time.' },
        { q: 'Can I book a table for a group or party?', a: 'Absolutely. Message us on WhatsApp with the date, time and number of guests and we will reserve seating for you.' },
        { q: 'Do you take bulk or catering orders?', a: 'Yes, we take bulk orders for functions, offices and festivals. Please give us at least a day\'s notice.' },
        { q: 'Which payment methods do you accept?', a: 'We accept cash, UPI and all major cards.' }
      ],
      cta: { title: 'Hungry already?', text: 'Order on WhatsApp in seconds, or call us to book a table.', button: 'orderNow' }
    },

    /* Salon / boutique — soft rose, nude, gold, elegant serif */
    beauty: {
      label: 'Beauty & Wellness',
      palette: { primary: '#A85C6A', accent: '#C9A96E', background: '#FBF6F3', surface: '#FFFFFF', text: '#3B2A2F' },
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Jost',
      buttonStyle: 'pill',
      borderRadius: '22px',
      alternatives: [
        { name: 'Blush Plum', primary: '#7B3F61', accent: '#E3B5A4', background: '#FCF7F8', surface: '#FFFFFF', text: '#2F1F28' },
        { name: 'Sage Spa', primary: '#5E8064', accent: '#D4B483', background: '#F5F8F3', surface: '#FFFFFF', text: '#243128' }
      ],
      highlightIcon: 'bi-flower2',
      taglineDefault: 'Look good, feel wonderful, right here in {city}',
      aboutDefault: '{name} is a {category} in {city} where trained professionals, premium products and a relaxing atmosphere come together. Whether it is a quick touch-up or a full pampering session, we make every visit feel special.',
      whyChooseUs: [
        { icon: 'bi-award', title: 'Trained experts', text: 'Experienced stylists and therapists who listen first.' },
        { icon: 'bi-droplet', title: 'Premium products', text: 'Only trusted, skin-friendly professional brands.' },
        { icon: 'bi-shield-check', title: 'Hygiene first', text: 'Sanitised tools and fresh linen for every client.' },
        { icon: 'bi-calendar-check', title: 'Easy booking', text: 'Book your slot on WhatsApp, no waiting around.' }
      ],
      faqs: [
        { q: 'Do I need an appointment?', a: 'Walk-ins are welcome, but booking on WhatsApp guarantees your slot and saves waiting time.' },
        { q: 'Which products do you use?', a: 'We use professional, dermatologically tested brands. Ask us about anything specific before your service.' },
        { q: 'Do you offer bridal and party packages?', a: 'Yes. Message us with your date and requirements for a custom package and a trial session.' },
        { q: 'Which payment methods do you accept?', a: 'Cash, UPI and all major cards.' }
      ],
      cta: { title: 'Treat yourself today', text: 'Pick a time that suits you and we will keep your slot ready.', button: 'bookSlot' }
    },

    /* Spa / massage — calm sage, sand and stone, classical serif */
    wellness: {
      label: 'Spa & Wellness',
      palette: { primary: '#5E7D6A', accent: '#C2A16B', background: '#F6F4EF', surface: '#FFFFFF', text: '#26302A' },
      headingFont: 'Marcellus',
      bodyFont: 'Lato',
      buttonStyle: 'pill',
      borderRadius: '20px',
      alternatives: [
        { name: 'Teak & Cream', primary: '#8A5A3B', accent: '#D9B98C', background: '#FAF6F0', surface: '#FFFFFF', text: '#2E2119' },
        { name: 'Lotus Plum', primary: '#6B4E71', accent: '#D8B4A0', background: '#F9F6F8', surface: '#FFFFFF', text: '#2A2030' }
      ],
      highlightIcon: 'bi-flower1',
      taglineDefault: 'Massages and spa therapies to relax, restore and recharge in {city}',
      aboutDefault: '{name} is a peaceful {category} in {city} where trained therapists help you leave stress behind. Choose from Swedish, deep tissue, Thai, Balinese and Ayurvedic massages, body scrubs and steam, all in private, softly lit rooms with fresh linen and natural oils.',
      whyChooseUs: [
        { icon: 'bi-person-check', title: 'Certified therapists', text: 'Trained, experienced and respectful, with male and female therapists available.' },
        { icon: 'bi-droplet', title: 'Natural oils', text: 'Aromatherapy and Ayurvedic oils chosen for your skin and needs.' },
        { icon: 'bi-shield-check', title: 'Clean & private', text: 'Private rooms, fresh linen and disposables for every guest.' },
        { icon: 'bi-moon-stars', title: 'Total calm', text: 'Soft lighting, quiet music and herbal tea after every session.' }
      ],
      faqs: [
        { q: 'Which massage should I choose?', a: 'Swedish is best for relaxation, deep tissue for tight muscles and pain, and Thai or Balinese for stretching and energy. Tell us how you feel and our therapist will suggest the right one.' },
        { q: 'Do you have male and female therapists?', a: 'Yes. Let us know your preference when you book and we will arrange it.' },
        { q: 'What should I wear, and when should I arrive?', a: 'Come as you are. We provide a robe, disposables and towels. Please arrive 10 minutes early to fill a short health form and relax with a welcome drink.' },
        { q: 'Do you offer couple massages and gift vouchers?', a: 'Yes, we have side-by-side couple rooms and gift vouchers for birthdays and anniversaries. Ask us on WhatsApp.' }
      ],
      cta: { title: 'Time to unwind', text: 'Book your massage on WhatsApp and we will keep a quiet room ready for you.', button: 'bookMassage' }
    },

    /* Gym — black with neon green / orange, bold condensed headings */
    fitness: {
      label: 'Fitness',
      palette: { primary: '#A3E635', accent: '#F97316', background: '#0B0B0C', surface: '#17181B', text: '#F4F4F5' },
      headingFont: 'Oswald',
      bodyFont: 'Barlow',
      buttonStyle: 'square',
      borderRadius: '4px',
      alternatives: [
        { name: 'Blaze Orange', primary: '#FF6B00', accent: '#FACC15', background: '#0D0D0D', surface: '#1A1A1A', text: '#F5F5F5' },
        { name: 'Electric Blue', primary: '#38BDF8', accent: '#A3E635', background: '#0A0F14', surface: '#141B23', text: '#F1F5F9' }
      ],
      highlightIcon: 'bi-lightning-charge',
      taglineDefault: 'Train harder. Get stronger. Right here in {city}.',
      aboutDefault: '{name} is a fully equipped {category} in {city} for beginners and serious lifters alike. Certified trainers, modern equipment and a motivating crowd help you show up and see results.',
      whyChooseUs: [
        { icon: 'bi-person-check', title: 'Certified trainers', text: 'Personal guidance on form, diet and progress.' },
        { icon: 'bi-lightning-charge', title: 'Modern equipment', text: 'Strength, cardio and functional zones.' },
        { icon: 'bi-clock', title: 'Flexible timings', text: 'Early morning to late evening slots.' },
        { icon: 'bi-graph-up-arrow', title: 'Real results', text: 'Structured plans that keep you progressing.' }
      ],
      faqs: [
        { q: 'Is there a free trial?', a: 'Yes. Message us on WhatsApp to book a free trial session and a tour of the gym.' },
        { q: 'Do you have personal trainers?', a: 'Yes, certified personal trainers are available on all plans, with dedicated PT packages for faster results.' },
        { q: 'Are there separate timings for women?', a: 'Please ask us on WhatsApp. We are happy to guide you to the most comfortable time slot.' },
        { q: 'Can I pause my membership?', a: 'Longer plans can be paused for travel or medical reasons. Ask at the front desk for details.' }
      ],
      cta: { title: 'Your first workout is on us', text: 'Book a free trial session and meet our trainers.', button: 'freeTrial' }
    },

    /* Clinic / dentist / hospital — blue, teal, white */
    medical: {
      label: 'Healthcare',
      palette: { primary: '#0E6BA8', accent: '#14B8A6', background: '#F5FAFD', surface: '#FFFFFF', text: '#12263A' },
      headingFont: 'Poppins',
      bodyFont: 'Open Sans',
      buttonStyle: 'rounded',
      borderRadius: '14px',
      alternatives: [
        { name: 'Calm Teal', primary: '#0F766E', accent: '#38BDF8', background: '#F3FAF9', surface: '#FFFFFF', text: '#0F2A2A' },
        { name: 'Care Green', primary: '#15803D', accent: '#0EA5E9', background: '#F4FBF6', surface: '#FFFFFF', text: '#14281C' }
      ],
      highlightIcon: 'bi-heart-pulse',
      taglineDefault: 'Trusted, caring treatment for your whole family in {city}',
      aboutDefault: '{name} is a {category} in {city} focused on honest diagnosis, gentle treatment and clear advice. We take time to listen, explain every option and make each visit as comfortable as possible.',
      whyChooseUs: [
        { icon: 'bi-person-badge', title: 'Qualified doctors', text: 'Experienced, registered medical professionals.' },
        { icon: 'bi-shield-plus', title: 'Safe & sterile', text: 'Strict sterilisation and hygiene protocols.' },
        { icon: 'bi-chat-heart', title: 'Patient first', text: 'Clear explanations and no unnecessary procedures.' },
        { icon: 'bi-calendar-check', title: 'Easy appointments', text: 'Book on WhatsApp and skip the waiting room.' }
      ],
      faqs: [
        { q: 'How do I book an appointment?', a: 'Tap "Book Appointment" or send us a WhatsApp message with your name, preferred date and time. We will confirm your slot.' },
        { q: 'Do you accept walk-in patients?', a: 'Yes, walk-ins are welcome during working hours. Booked appointments are seen first, so booking saves time.' },
        { q: 'What should I bring to my first visit?', a: 'Please bring any previous prescriptions, reports and a list of medicines you currently take.' },
        { q: 'What are the consultation charges?', a: 'Please call or WhatsApp us for current consultation fees and any treatment estimates.' }
      ],
      cta: { title: 'Need to see a doctor?', text: 'Book your appointment on WhatsApp and we will confirm a time.', button: 'bookAppointment' }
    },

    /* Coaching / school — navy and yellow */
    education: {
      label: 'Education',
      palette: { primary: '#1E2A5A', accent: '#FACC15', background: '#F8F9FC', surface: '#FFFFFF', text: '#1B2340' },
      headingFont: 'Montserrat',
      bodyFont: 'Mulish',
      buttonStyle: 'rounded',
      borderRadius: '12px',
      alternatives: [
        { name: 'Maroon & Gold', primary: '#7A1F2B', accent: '#F2B705', background: '#FCF9F5', surface: '#FFFFFF', text: '#2A1518' },
        { name: 'Royal Green', primary: '#14532D', accent: '#FBBF24', background: '#F6FAF7', surface: '#FFFFFF', text: '#142218' }
      ],
      highlightIcon: 'bi-mortarboard',
      taglineDefault: 'Building bright futures in {city}',
      aboutDefault: '{name} is a {category} in {city} with experienced teachers, small batches and a proven way of teaching. We focus on strong concepts, regular practice and personal attention for every student.',
      whyChooseUs: [
        { icon: 'bi-person-workspace', title: 'Experienced faculty', text: 'Teachers who explain concepts simply and clearly.' },
        { icon: 'bi-people', title: 'Small batches', text: 'Personal attention and doubt-solving for every student.' },
        { icon: 'bi-journal-check', title: 'Regular tests', text: 'Weekly tests and progress reports for parents.' },
        { icon: 'bi-trophy', title: 'Proven results', text: 'Students who consistently improve and succeed.' }
      ],
      faqs: [
        { q: 'Is there a free demo class?', a: 'Yes. Message us on WhatsApp to book a free demo class before you enrol.' },
        { q: 'What is the batch size?', a: 'We keep batches small so every student gets personal attention.' },
        { q: 'Do you provide study material?', a: 'Yes, notes, practice sheets and test papers are included.' },
        { q: 'How are parents kept updated?', a: 'Parents receive regular progress reports and can meet teachers on request.' }
      ],
      cta: { title: 'Book a free demo class', text: 'See how we teach before you decide. Seats are limited in every batch.', button: 'bookDemo' }
    },

    /* Car service / hardware / electronics — steel grey with red, industrial */
    industrial: {
      label: 'Service & Retail',
      palette: { primary: '#D62828', accent: '#2B2D31', background: '#EEF0F2', surface: '#FFFFFF', text: '#1F2328' },
      headingFont: 'Rajdhani',
      bodyFont: 'Roboto',
      buttonStyle: 'square',
      borderRadius: '6px',
      alternatives: [
        { name: 'Steel Blue', primary: '#1D4ED8', accent: '#2B2D31', background: '#EEF1F5', surface: '#FFFFFF', text: '#1B2230' },
        { name: 'Safety Yellow', primary: '#EAB308', accent: '#27272A', background: '#F1F1EF', surface: '#FFFFFF', text: '#1C1C1A' }
      ],
      highlightIcon: 'bi-tools',
      taglineDefault: 'Reliable service and genuine parts in {city}',
      aboutDefault: '{name} is a trusted {category} in {city}. Skilled technicians, genuine parts and transparent pricing mean the job is done right the first time, with no surprises on the bill.',
      whyChooseUs: [
        { icon: 'bi-wrench-adjustable', title: 'Skilled technicians', text: 'Years of hands-on experience on every job.' },
        { icon: 'bi-patch-check', title: 'Genuine parts', text: 'Original and branded spares with warranty.' },
        { icon: 'bi-receipt', title: 'Transparent billing', text: 'Clear estimates before any work begins.' },
        { icon: 'bi-speedometer2', title: 'Quick turnaround', text: 'Most jobs completed the same day.' }
      ],
      faqs: [
        { q: 'Can I get an estimate before the work starts?', a: 'Yes. We always share a clear estimate first and start only after your approval.' },
        { q: 'Do you offer a warranty?', a: 'Genuine parts come with the manufacturer\'s warranty, and we stand behind our workmanship.' },
        { q: 'Do you offer pickup or home service?', a: 'Message us on WhatsApp with your location and we will tell you what is possible.' },
        { q: 'Which payment methods do you accept?', a: 'Cash, UPI and all major cards.' }
      ],
      cta: { title: 'Get a quick quote', text: 'Send us the details on WhatsApp and we will get back with an estimate.', button: 'getQuote' }
    },

    /* Jewellery — maroon, gold, ivory, luxury */
    luxury: {
      label: 'Luxury',
      palette: { primary: '#6D1A36', accent: '#C9A227', background: '#FBF8F1', surface: '#FFFFFF', text: '#2A1A1F' },
      headingFont: 'Cinzel',
      bodyFont: 'Raleway',
      buttonStyle: 'square',
      borderRadius: '2px',
      alternatives: [
        { name: 'Emerald & Gold', primary: '#0F5132', accent: '#D4AF37', background: '#F8FAF5', surface: '#FFFFFF', text: '#14231A' },
        { name: 'Midnight & Gold', primary: '#1F2340', accent: '#D4AF37', background: '#F9F8F4', surface: '#FFFFFF', text: '#1A1C2C' }
      ],
      highlightIcon: 'bi-gem',
      taglineDefault: 'Timeless jewellery, crafted with trust in {city}',
      aboutDefault: '{name} has been a trusted name for fine jewellery in {city}. Every piece is hallmarked, honestly priced and finished by skilled craftsmen, from everyday elegance to once-in-a-lifetime bridal sets.',
      whyChooseUs: [
        { icon: 'bi-patch-check', title: 'BIS hallmarked', text: 'Certified purity on every gold piece.' },
        { icon: 'bi-gem', title: 'Exquisite craft', text: 'Designs finished by skilled karigars.' },
        { icon: 'bi-currency-rupee', title: 'Transparent pricing', text: 'Clear making charges and daily gold rates.' },
        { icon: 'bi-arrow-repeat', title: 'Easy exchange', text: 'Fair exchange and buy-back policy.' }
      ],
      faqs: [
        { q: 'Is all your gold jewellery hallmarked?', a: 'Yes, all our gold jewellery is BIS hallmarked for guaranteed purity.' },
        { q: 'Do you make custom designs?', a: 'Yes. Share a photo or idea on WhatsApp and our craftsmen will create it for you.' },
        { q: 'Do you exchange old gold?', a: 'Yes, we offer a transparent old-gold exchange at the current rate.' },
        { q: 'Can I see designs before visiting?', a: 'Of course. Message us on WhatsApp and we will share photos of the latest collection.' }
      ],
      cta: { title: 'See the new collection', text: 'Ask on WhatsApp for photos and prices of our latest designs.', button: 'enquireNow' }
    },

    /* Hotel — warm wood with sea teal */
    hospitality: {
      label: 'Hospitality',
      palette: { primary: '#8B5E3C', accent: '#2A9D8F', background: '#FAF7F2', surface: '#FFFFFF', text: '#2B2622' },
      headingFont: 'DM Serif Display',
      bodyFont: 'DM Sans',
      buttonStyle: 'rounded',
      borderRadius: '14px',
      alternatives: [
        { name: 'Ocean Breeze', primary: '#1D5C7A', accent: '#E9C46A', background: '#F5F9FA', surface: '#FFFFFF', text: '#14262E' },
        { name: 'Forest Retreat', primary: '#3A5A40', accent: '#DDA15E', background: '#F7F8F2', surface: '#FFFFFF', text: '#1D261E' }
      ],
      highlightIcon: 'bi-building',
      taglineDefault: 'Comfortable stays and warm hospitality in {city}',
      aboutDefault: '{name} is a welcoming {category} in {city} with clean, comfortable rooms and friendly staff. Whether you are travelling for work or with family, we make sure you feel at home.',
      whyChooseUs: [
        { icon: 'bi-house-heart', title: 'Clean rooms', text: 'Fresh linen and housekeeping every day.' },
        { icon: 'bi-geo-alt', title: 'Great location', text: 'Close to the places you want to be.' },
        { icon: 'bi-wifi', title: 'Free Wi-Fi', text: 'Stay connected throughout your stay.' },
        { icon: 'bi-person-check', title: 'Friendly staff', text: 'Help available around the clock.' }
      ],
      faqs: [
        { q: 'What are the check-in and check-out times?', a: 'Standard check-in is at 12:00 PM and check-out at 11:00 AM. Early check-in is subject to availability.' },
        { q: 'How do I book a room?', a: 'Send us a WhatsApp message with your dates and number of guests, and we will confirm availability and price.' },
        { q: 'Is parking available?', a: 'Yes, please let us know in advance if you are arriving by car.' },
        { q: 'Which ID proofs are accepted?', a: 'Aadhaar, passport, driving licence or voter ID for every adult guest.' }
      ],
      cta: { title: 'Plan your stay', text: 'Check room availability on WhatsApp in a minute.', button: 'checkAvailability' }
    },

    /* Bar / pub / lounge — dark with warm amber and a neon-pink accent */
    nightlife: {
      label: 'Nightlife',
      palette: { primary: '#E0A84F', accent: '#E0457B', background: '#0F0D13', surface: '#1A1720', text: '#F3EEE6' },
      headingFont: 'Josefin Sans',
      bodyFont: 'Outfit',
      buttonStyle: 'pill',
      borderRadius: '14px',
      alternatives: [
        { name: 'Neon Violet', primary: '#B57BFF', accent: '#22D3EE', background: '#0D0B14', surface: '#18152A', text: '#F1EEFA' },
        { name: 'Whisky Oak', primary: '#C8853B', accent: '#E9D8A6', background: '#15100B', surface: '#211912', text: '#F5EDE1' }
      ],
      highlightIcon: 'bi-moon-stars',
      taglineDefault: 'Great drinks, good music and better company in {city}',
      aboutDefault: '{name} is a lively {category} in {city} for after-work drinks, weekend nights and everything in between. Expect well-made cocktails, chilled beer, tasty bar food and a crowd that knows how to have a good time.',
      whyChooseUs: [
        { icon: 'bi-cup-straw', title: 'Signature cocktails', text: 'Classics and house specials, mixed by experienced bartenders.' },
        { icon: 'bi-music-note-beamed', title: 'Music & vibes', text: 'DJ nights, live gigs and playlists that keep the night going.' },
        { icon: 'bi-egg-fried', title: 'Bar bites', text: 'Hot, tasty food made to go with your drinks.' },
        { icon: 'bi-people', title: 'Groups & parties', text: 'Space and packages for birthdays, office parties and get-togethers.' }
      ],
      faqs: [
        { q: 'Do I need to reserve a table?', a: 'Walk-ins are welcome, but on Friday and Saturday nights we recommend reserving on WhatsApp so your table is ready.' },
        { q: 'Is there a cover charge or entry fee?', a: 'Entry rules can change on event nights. Message us on WhatsApp and we will tell you what applies on your date.' },
        { q: 'Do you host private parties?', a: 'Yes. Share the date, number of guests and budget on WhatsApp and we will suggest a package.' },
        { q: 'Is there an age limit?', a: 'Alcohol is served only to guests of legal drinking age. Please carry a valid photo ID.' }
      ],
      cta: { title: 'Plans for tonight?', text: 'Reserve your table on WhatsApp and skip the wait at the door.', button: 'reserveTable' }
    },

    /* Tours & travels — ocean blue with a sunset coral accent */
    travel: {
      label: 'Travel',
      palette: { primary: '#0B6E8C', accent: '#F4845F', background: '#F4F9FB', surface: '#FFFFFF', text: '#0F2A33' },
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      buttonStyle: 'pill',
      borderRadius: '18px',
      alternatives: [
        { name: 'Desert Sun', primary: '#B45309', accent: '#0EA5E9', background: '#FDF8F1', surface: '#FFFFFF', text: '#2A1B0B' },
        { name: 'Himalayan Green', primary: '#166534', accent: '#F59E0B', background: '#F4FAF5', surface: '#FFFFFF', text: '#122016' }
      ],
      highlightIcon: 'bi-compass',
      taglineDefault: 'Holidays, tours and travel planned for you from {city}',
      aboutDefault: '{name} is a trusted {category} in {city}. From weekend getaways to family holidays, pilgrimages and international trips, we plan the whole journey: tickets, hotels, sightseeing and transport, so you only have to pack your bags.',
      whyChooseUs: [
        { icon: 'bi-map', title: 'Customised trips', text: 'Itineraries built around your dates, budget and interests.' },
        { icon: 'bi-currency-rupee', title: 'Best prices', text: 'Good deals on hotels, tickets and packages, with no hidden costs.' },
        { icon: 'bi-headset', title: 'Support on the trip', text: 'A real person to call if anything changes while you travel.' },
        { icon: 'bi-shield-check', title: 'Safe & reliable', text: 'Verified hotels, licensed drivers and trusted partners.' }
      ],
      faqs: [
        { q: 'Can you customise a package for us?', a: 'Yes. Tell us your destination, dates, number of travellers and budget on WhatsApp, and we will send you a plan.' },
        { q: 'Do you book flights, trains and hotels separately?', a: 'Yes, we can book just tickets or just hotels as well as complete packages.' },
        { q: 'How do I pay?', a: 'An advance confirms your booking and the balance is paid before the trip. We accept UPI, bank transfer and cards.' },
        { q: 'What is your cancellation policy?', a: 'It depends on the hotels and tickets in your package. We explain the rules clearly before you pay.' }
      ],
      cta: { title: 'Where to next?', text: 'Share your dream destination on WhatsApp and get a free trip plan.', button: 'planTrip' }
    },

    /* Handyman / home repairs — safety orange with deep navy */
    trades: {
      label: 'Home Services',
      palette: { primary: '#E8661A', accent: '#1E3A5F', background: '#F5F6F8', surface: '#FFFFFF', text: '#1A202C' },
      headingFont: 'Barlow',
      bodyFont: 'Inter',
      buttonStyle: 'rounded',
      borderRadius: '10px',
      alternatives: [
        { name: 'Tool Blue', primary: '#1D4ED8', accent: '#F59E0B', background: '#F3F6FB', surface: '#FFFFFF', text: '#111827' },
        { name: 'Workshop Green', primary: '#15803D', accent: '#1F2937', background: '#F4F7F4', surface: '#FFFFFF', text: '#14201A' }
      ],
      highlightIcon: 'bi-house-gear',
      taglineDefault: 'Repairs and odd jobs done right, at your doorstep in {city}',
      aboutDefault: '{name} is a reliable {category} in {city} for all the small jobs around your home or office. Plumbing, electrical work, carpentry, painting and installations, handled by skilled, verified people who turn up on time and clean up after.',
      whyChooseUs: [
        { icon: 'bi-person-check', title: 'Verified experts', text: 'Skilled, background-checked technicians for every job.' },
        { icon: 'bi-clock-history', title: 'On-time visits', text: 'We arrive in the slot you book, usually the same day.' },
        { icon: 'bi-receipt', title: 'Upfront pricing', text: 'Clear visit charges and a quote before any work starts.' },
        { icon: 'bi-shield-check', title: 'Work guarantee', text: 'If something is not right, we come back and fix it.' }
      ],
      faqs: [
        { q: 'Do you charge for a visit?', a: 'A small visit charge may apply, and it is adjusted in the bill if you go ahead with the work. Ask us on WhatsApp for current rates.' },
        { q: 'How soon can someone come?', a: 'Most bookings are attended the same day or the next day. Urgent jobs are prioritised whenever possible.' },
        { q: 'Do you bring materials and spare parts?', a: 'We carry common tools and parts. For anything else, we share the cost with you before buying.' },
        { q: 'Which payment methods do you accept?', a: 'Cash, UPI and all major cards, after the job is done.' }
      ],
      cta: { title: 'Something needs fixing?', text: 'Send a photo of the problem on WhatsApp and book a visit.', button: 'bookVisit' }
    },

    /* General — neutral modern */
    general: {
      label: 'Local Business',
      palette: { primary: '#4F46E5', accent: '#10B981', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Plus Jakarta Sans',
      buttonStyle: 'rounded',
      borderRadius: '14px',
      alternatives: [
        { name: 'Slate & Amber', primary: '#334155', accent: '#F59E0B', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
        { name: 'Ocean', primary: '#0369A1', accent: '#F97316', background: '#F5F9FC', surface: '#FFFFFF', text: '#0B1B2B' }
      ],
      highlightIcon: 'bi-check2-circle',
      taglineDefault: 'Trusted by customers across {city}',
      aboutDefault: '{name} is a trusted {category} in {city}. We believe in quality work, fair prices and friendly service, and we are proud that so many of our customers keep coming back.',
      whyChooseUs: [
        { icon: 'bi-hand-thumbs-up', title: 'Trusted locally', text: 'Rated highly by customers on Google.' },
        { icon: 'bi-award', title: 'Quality work', text: 'We do every job as if it were our own.' },
        { icon: 'bi-currency-rupee', title: 'Fair pricing', text: 'Clear prices with no hidden charges.' },
        { icon: 'bi-chat-dots', title: 'Quick response', text: 'Reach us instantly on call or WhatsApp.' }
      ],
      faqs: [
        { q: 'How can I contact you?', a: 'Call us or send a WhatsApp message any time. We usually reply within minutes during working hours.' },
        { q: 'Where are you located?', a: 'You can find our full address and a map in the contact section below.' },
        { q: 'Which payment methods do you accept?', a: 'Cash, UPI and all major cards.' },
        { q: 'Do you offer home service or delivery?', a: 'Message us on WhatsApp with your location and we will let you know.' }
      ],
      cta: { title: 'Let\'s talk', text: 'Message us on WhatsApp and we will get back to you right away.', button: 'whatsappUs' }
    }
  };

  /*
   * label      = human readable category name (used in titles and copy)
   * schema     = schema.org type for LocalBusiness JSON-LD
   * services   = i18n key for the services section heading
   * style      = 'cards' | 'menu' | 'plans' (menu tabs need menuCategories)
   * icon       = default icon for services and the text logo
   * services list = shown when data.js has no services
   * hero       = 'full' (photo behind text) | 'center' (showcase) | 'split' (text + photo side by side)
   * photos     = placeholder folder in placeholders/ used when the business has no photos
   * order      = default section order, following how customers of this business decide
   * look       = this category's own palette, fonts, copy, FAQs and CTA (overrides its preset)
   */
  var CATEGORIES = {
    restaurant: {
      preset: 'food', label: 'restaurant', schema: 'Restaurant', services: 'menu', style: 'menu', icon: 'bi-egg-fried',
      hero: 'full', photos: 'food',
      order: ['hero', 'highlights', 'services', 'gallery', 'about', 'why', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      defaultServices: [
        { title: 'Dine-in', desc: 'Comfortable seating for families and groups.', icon: 'bi-shop' },
        { title: 'Takeaway', desc: 'Call ahead and pick up your order hot and fresh.', icon: 'bi-bag' },
        { title: 'Home Delivery', desc: 'Order on WhatsApp and we deliver to your door.', icon: 'bi-truck' },
        { title: 'Party Orders', desc: 'Bulk orders and catering for every occasion.', icon: 'bi-gift' }
      ]
    },
    cafe: {
      preset: 'food', label: 'café', schema: 'CafeOrCoffeeShop', services: 'menu', style: 'menu', icon: 'bi-cup-hot',
      hero: 'split', photos: 'cafe',
      order: ['hero', 'highlights', 'services', 'about', 'gallery', 'why', 'testimonials', 'hours', 'cta', 'faq', 'contact'],
      look: {
        palette: { primary: '#6F4E37', accent: '#D9A066', background: '#F7F1EA', surface: '#FFFFFF', text: '#2B1D14' },
        headingFont: 'Lora', bodyFont: 'DM Sans', buttonStyle: 'rounded', borderRadius: '16px',
        alternatives: [
          { name: 'Matcha', primary: '#4D7C4A', accent: '#E8C07D', background: '#F4F7F0', surface: '#FFFFFF', text: '#1E2A1C' },
          { name: 'Blue Roast', primary: '#2C4A6B', accent: '#E7B07A', background: '#F4F6F9', surface: '#FFFFFF', text: '#17222F' }
        ],
        highlightIcon: 'bi-cup-hot',
        taglineDefault: 'Freshly brewed coffee, good food and cosy corners in {city}',
        aboutDefault: '{name} is a friendly {category} in {city} for your morning coffee, a working lunch or a long evening chat. We brew every cup fresh, bake snacks in-house and keep the Wi-Fi fast and the music easy.',
        whyChooseUs: [
          { icon: 'bi-cup-hot', title: 'Freshly brewed', text: 'Espresso, pour-over and cold brew made to order.' },
          { icon: 'bi-wifi', title: 'Work friendly', text: 'Fast Wi-Fi, charging points and quiet corners.' },
          { icon: 'bi-basket', title: 'All-day menu', text: 'Breakfast, sandwiches, bowls and desserts.' },
          { icon: 'bi-emoji-smile', title: 'Friendly baristas', text: 'They remember your order, and your name.' }
        ],
        faqs: [
          { q: 'Can I work from the café?', a: 'Of course. We have free Wi-Fi and charging points. On busy weekend afternoons we may ask laptop users to share larger tables.' },
          { q: 'Do you take table reservations?', a: 'We keep most tables for walk-ins, but message us on WhatsApp for groups of six or more.' },
          { q: 'Can we host a small birthday or meetup?', a: 'Yes. Share the date and headcount on WhatsApp and we will suggest a set menu.' },
          { q: 'Do you have dairy-free options?', a: 'Yes, oat and almond milk are available for all coffees.' }
        ],
        cta: { title: 'Your table is waiting', text: 'Order ahead on WhatsApp or drop in for a fresh cup.', button: 'orderNow' }
      },
      defaultServices: [
        { title: 'Coffee & Tea', desc: 'Freshly brewed hot and cold beverages.', icon: 'bi-cup-hot' },
        { title: 'Snacks & Bites', desc: 'Sandwiches, fries and quick bites.', icon: 'bi-basket' },
        { title: 'Desserts', desc: 'Cakes, brownies and sweet treats.', icon: 'bi-cake2' },
        { title: 'Free Wi-Fi', desc: 'A cosy place to work or catch up.', icon: 'bi-wifi' }
      ]
    },
    bakery: {
      preset: 'food', label: 'bakery', schema: 'Bakery', services: 'menu', style: 'menu', icon: 'bi-cake2',
      hero: 'center', photos: 'bakery',
      order: ['hero', 'services', 'gallery', 'highlights', 'about', 'why', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      look: {
        palette: { primary: '#B4436C', accent: '#F2B880', background: '#FFF7F3', surface: '#FFFFFF', text: '#3A2228' },
        headingFont: 'Fredoka', bodyFont: 'Nunito', buttonStyle: 'pill', borderRadius: '24px',
        alternatives: [
          { name: 'Chocolate', primary: '#5C3A21', accent: '#F4C27F', background: '#FBF6F0', surface: '#FFFFFF', text: '#2B1B10' },
          { name: 'Pistachio', primary: '#5F8A4E', accent: '#F3A6B5', background: '#F7FAF3', surface: '#FFFFFF', text: '#1F2A1A' }
        ],
        highlightIcon: 'bi-cake2',
        taglineDefault: 'Freshly baked cakes, breads and treats every morning in {city}',
        aboutDefault: '{name} is a neighbourhood {category} in {city} baking fresh every single morning. From soft breads and buttery cookies to custom birthday and wedding cakes, everything is made in our own kitchen with quality ingredients.',
        whyChooseUs: [
          { icon: 'bi-sunrise', title: 'Baked fresh daily', text: 'Nothing on our shelves is older than a day.' },
          { icon: 'bi-cake2', title: 'Custom cakes', text: 'Any theme, photo cake or design you can imagine.' },
          { icon: 'bi-egg', title: 'Eggless options', text: 'Most cakes and cookies are available eggless.' },
          { icon: 'bi-truck', title: 'Same-day delivery', text: 'Order before noon for delivery the same evening.' }
        ],
        faqs: [
          { q: 'How early should I order a custom cake?', a: 'One day is enough for most cakes. Tiered and theme cakes need 2-3 days. Send the design, flavour and date on WhatsApp.' },
          { q: 'Do you make eggless cakes?', a: 'Yes, almost every cake and cookie can be made eggless at no extra cost.' },
          { q: 'Do you deliver?', a: 'Yes, we deliver across the city. Delivery charges depend on distance.' },
          { q: 'Do you take bulk orders?', a: 'Yes, for offices, schools, weddings and festivals. Please give us a few days\' notice.' }
        ],
        cta: { title: 'Order your celebration cake', text: 'Share the design, flavour and date on WhatsApp and we will bake it fresh.', button: 'orderCake' }
      },
      defaultServices: [
        { title: 'Custom Cakes', desc: 'Birthday, anniversary and theme cakes made to order.', icon: 'bi-cake2' },
        { title: 'Fresh Breads', desc: 'Baked fresh every morning.', icon: 'bi-basket' },
        { title: 'Cookies & Pastries', desc: 'Crisp, buttery and freshly baked.', icon: 'bi-stars' },
        { title: 'Party Orders', desc: 'Bulk orders for parties and offices.', icon: 'bi-gift' }
      ]
    },
    salon: {
      preset: 'beauty', label: 'salon', schema: 'BeautySalon', services: 'services', style: 'cards', icon: 'bi-scissors',
      hero: 'full', photos: 'beauty',
      order: ['hero', 'highlights', 'services', 'gallery', 'about', 'why', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      defaultServices: [
        { title: 'Haircut & Styling', desc: 'Cuts, blow-dry and styling for every look.', icon: 'bi-scissors' },
        { title: 'Hair Colour', desc: 'Global colour, highlights and balayage.', icon: 'bi-palette' },
        { title: 'Facials & Skin', desc: 'Cleanups and facials for glowing skin.', icon: 'bi-flower1' },
        { title: 'Bridal Makeup', desc: 'Complete bridal and party makeup packages.', icon: 'bi-stars' }
      ]
    },
    spa: {
      preset: 'wellness', label: 'spa', schema: 'DaySpa', services: 'therapies', style: 'cards', icon: 'bi-flower1',
      hero: 'full', photos: 'wellness',
      order: ['hero', 'highlights', 'about', 'services', 'why', 'gallery', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      defaultServices: [
        { title: 'Swedish Massage', desc: 'Long, gentle strokes for full-body relaxation.', icon: 'bi-flower1' },
        { title: 'Deep Tissue Massage', desc: 'Firm pressure to release knots and muscle pain.', icon: 'bi-activity' },
        { title: 'Thai Massage', desc: 'Stretching and pressure points for energy and flexibility.', icon: 'bi-person-arms-up' },
        { title: 'Balinese Massage', desc: 'Aromatic oils with rhythmic, soothing techniques.', icon: 'bi-droplet' },
        { title: 'Foot Reflexology', desc: 'Pressure-point foot massage for tired feet.', icon: 'bi-heart' },
        { title: 'Couple Massage', desc: 'Side-by-side massages for two in a private room.', icon: 'bi-people' }
      ]
    },
    boutique: {
      preset: 'beauty', label: 'boutique', schema: 'ClothingStore', services: 'collections', style: 'cards', icon: 'bi-bag-heart',
      hero: 'center', photos: 'boutique',
      order: ['hero', 'gallery', 'services', 'highlights', 'about', 'why', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      look: {
        palette: { primary: '#1F1A17', accent: '#C08B5C', background: '#FAF7F2', surface: '#FFFFFF', text: '#1F1A17' },
        headingFont: 'Bodoni Moda', bodyFont: 'Manrope', buttonStyle: 'square', borderRadius: '2px',
        alternatives: [
          { name: 'Rani Pink', primary: '#B0125B', accent: '#E8B44F', background: '#FDF6F8', surface: '#FFFFFF', text: '#2A0F1C' },
          { name: 'Indigo Block', primary: '#233D7A', accent: '#D9A441', background: '#F5F7FB', surface: '#FFFFFF', text: '#151E33' }
        ],
        highlightIcon: 'bi-bag-heart',
        taglineDefault: 'Handpicked ethnic and western wear in {city}',
        aboutDefault: '{name} is a {category} in {city} with handpicked sarees, suits, kurtis and western wear for every occasion. New designs arrive every week, and our in-house tailors make sure everything fits you perfectly.',
        whyChooseUs: [
          { icon: 'bi-stars', title: 'New arrivals weekly', text: 'Fresh designs every week, not last season\'s stock.' },
          { icon: 'bi-scissors', title: 'Custom stitching', text: 'Blouses, suits and alterations by in-house tailors.' },
          { icon: 'bi-rulers', title: 'Every size', text: 'From XS to 4XL, with a perfect fit guaranteed.' },
          { icon: 'bi-whatsapp', title: 'Shop on WhatsApp', text: 'See photos and prices before you visit.' }
        ],
        faqs: [
          { q: 'Can I see the collection on WhatsApp?', a: 'Yes. Tell us what you are looking for and your budget, and we will send photos and prices.' },
          { q: 'Do you do alterations and custom stitching?', a: 'Yes. Most alterations are ready in 2-3 days and custom stitching in about a week.' },
          { q: 'What is your exchange policy?', a: 'Unworn items with tags can be exchanged within 7 days of purchase.' },
          { q: 'Do you ship outside the city?', a: 'Yes, we ship across India. Ask us on WhatsApp for shipping charges.' }
        ],
        cta: { title: 'New arrivals are in', text: 'Ask on WhatsApp for photos and prices of the latest collection.', button: 'enquireNow' }
      },
      defaultServices: [
        { title: 'Ethnic Wear', desc: 'Sarees, suits and lehengas for every occasion.', icon: 'bi-bag-heart' },
        { title: 'Western Wear', desc: 'Dresses, tops and everyday styles.', icon: 'bi-handbag' },
        { title: 'Custom Stitching', desc: 'Tailoring and alterations for the perfect fit.', icon: 'bi-scissors' },
        { title: 'Bridal Collection', desc: 'Designer pieces for your big day.', icon: 'bi-stars' }
      ]
    },
    gym: {
      preset: 'fitness', label: 'gym', schema: 'HealthClub', services: 'plans', style: 'plans', icon: 'bi-lightning-charge',
      hero: 'full', photos: 'fitness',
      order: ['hero', 'highlights', 'services', 'why', 'gallery', 'testimonials', 'cta', 'hours', 'faq', 'about', 'contact'],
      defaultServices: [
        { title: 'Monthly', price: 'Ask us', desc: 'Full gym access.', features: ['All equipment', 'Locker room', 'General trainer'] },
        { title: 'Quarterly', price: 'Ask us', desc: 'Our most popular plan.', features: ['All equipment', 'Diet guidance', 'Body assessment'], popular: true },
        { title: 'Personal Training', price: 'Ask us', desc: 'One-on-one coaching.', features: ['Dedicated trainer', 'Custom plan', 'Weekly check-ins'] }
      ]
    },
    clinic: {
      preset: 'medical', label: 'clinic', schema: 'MedicalClinic', services: 'services', style: 'cards', icon: 'bi-heart-pulse',
      hero: 'split', photos: 'medical',
      order: ['hero', 'highlights', 'doctor', 'services', 'why', 'testimonials', 'hours', 'cta', 'faq', 'about', 'gallery', 'contact'],
      defaultServices: [
        { title: 'General Consultation', desc: 'Diagnosis and treatment for everyday health concerns.', icon: 'bi-clipboard2-pulse' },
        { title: 'Health Check-ups', desc: 'Preventive check-up packages for all ages.', icon: 'bi-heart-pulse' },
        { title: 'Diabetes & BP Care', desc: 'Regular monitoring and long-term management.', icon: 'bi-activity' },
        { title: 'Vaccinations', desc: 'Vaccines for children and adults.', icon: 'bi-shield-plus' }
      ]
    },
    dentist: {
      preset: 'medical', label: 'dental clinic', schema: 'Dentist', services: 'treatments', style: 'cards', icon: 'bi-emoji-smile',
      hero: 'split', photos: 'dentist',
      order: ['hero', 'highlights', 'services', 'doctor', 'why', 'gallery', 'testimonials', 'cta', 'hours', 'faq', 'about', 'contact'],
      look: {
        palette: { primary: '#0E7490', accent: '#2DD4BF', background: '#F1FAFB', surface: '#FFFFFF', text: '#0E2A33' },
        headingFont: 'Quicksand', bodyFont: 'Nunito', buttonStyle: 'pill', borderRadius: '22px',
        alternatives: [
          { name: 'Fresh Mint', primary: '#0F766E', accent: '#A3E635', background: '#F2FBF8', surface: '#FFFFFF', text: '#0F2A26' },
          { name: 'Calm Lilac', primary: '#6D28D9', accent: '#22D3EE', background: '#F8F6FD', surface: '#FFFFFF', text: '#1E1636' }
        ],
        highlightIcon: 'bi-emoji-smile',
        taglineDefault: 'Gentle, painless dental care for the whole family in {city}',
        aboutDefault: '{name} is a modern {category} in {city} where every treatment starts with a clear explanation. From check-ups and cleaning to root canals, braces and implants, we keep things gentle, sterile and honestly priced.',
        whyChooseUs: [
          { icon: 'bi-emoji-smile', title: 'Painless treatment', text: 'Gentle techniques and modern anaesthesia.' },
          { icon: 'bi-display', title: 'Digital X-rays', text: 'Low-radiation imaging and clear diagnosis on screen.' },
          { icon: 'bi-shield-plus', title: 'Fully sterilised', text: 'Autoclaved instruments and single-use disposables.' },
          { icon: 'bi-credit-card', title: 'Clear costs & EMI', text: 'Written estimates and easy EMI on bigger treatments.' }
        ],
        faqs: [
          { q: 'Is a root canal painful?', a: 'No. With local anaesthesia and modern rotary instruments, most patients feel no more than a filling.' },
          { q: 'How many visits does a root canal take?', a: 'Many root canals are completed in a single sitting. Complex cases may need two.' },
          { q: 'Braces or clear aligners: which is better?', a: 'Both work well. We will check your teeth and explain the cost, time and comfort of each option.' },
          { q: 'Do you treat children?', a: 'Yes. We see children from the age of three, with extra patience and a friendly setup.' }
        ],
        cta: { title: 'Smile with confidence', text: 'Book a dental check-up on WhatsApp and we will confirm a time.', button: 'bookAppointment' }
      },
      defaultServices: [
        { title: 'Check-up & Cleaning', desc: 'Scaling, polishing and a complete oral check-up.', icon: 'bi-emoji-smile' },
        { title: 'Root Canal', desc: 'Painless single-sitting RCT where possible.', icon: 'bi-shield-plus' },
        { title: 'Braces & Aligners', desc: 'Straighter teeth with modern orthodontics.', icon: 'bi-stars' },
        { title: 'Implants', desc: 'Permanent, natural-looking tooth replacement.', icon: 'bi-award' }
      ]
    },
    hospital: {
      preset: 'medical', label: 'hospital', schema: 'Hospital', services: 'departments', style: 'cards', icon: 'bi-hospital',
      hero: 'full', photos: 'hospital',
      order: ['hero', 'highlights', 'services', 'doctor', 'why', 'about', 'testimonials', 'cta', 'gallery', 'faq', 'hours', 'contact'],
      look: {
        palette: { primary: '#1E3A8A', accent: '#DC2626', background: '#F5F7FB', surface: '#FFFFFF', text: '#0F1B33' },
        headingFont: 'Manrope', bodyFont: 'Inter', buttonStyle: 'rounded', borderRadius: '10px',
        alternatives: [
          { name: 'Care Teal', primary: '#0F766E', accent: '#E11D48', background: '#F3F9F8', surface: '#FFFFFF', text: '#0F2422' },
          { name: 'Trust Blue', primary: '#0369A1', accent: '#F97316', background: '#F4F8FB', surface: '#FFFFFF', text: '#0C1F2E' }
        ],
        highlightIcon: 'bi-hospital',
        taglineDefault: '24x7 emergency and specialist care in {city}',
        aboutDefault: '{name} is a multi-speciality {category} in {city} with round-the-clock emergency care, experienced specialists, modern operation theatres and an in-house lab and pharmacy, all under one roof.',
        whyChooseUs: [
          { icon: 'bi-truck-front', title: '24x7 emergency', text: 'Emergency doctors and ambulance available day and night.' },
          { icon: 'bi-person-badge', title: 'Specialist doctors', text: 'Experienced consultants across major specialities.' },
          { icon: 'bi-hospital', title: 'ICU & modern OTs', text: 'Critical care and fully equipped operation theatres.' },
          { icon: 'bi-wallet2', title: 'Cashless insurance', text: 'Tie-ups with leading insurers and TPAs.' }
        ],
        faqs: [
          { q: 'What should I do in an emergency?', a: 'Call us immediately on the number above. Our emergency department and ambulance are available 24x7.' },
          { q: 'Do you accept cashless insurance?', a: 'Yes, we work with most major insurers and TPAs. Please bring your insurance card and ID.' },
          { q: 'What are the OPD and visiting hours?', a: 'OPD timings vary by department. Call or WhatsApp us for the doctor\'s schedule and visiting hours.' },
          { q: 'How do I get my test reports?', a: 'Reports can be collected from the lab desk or sent to you on WhatsApp.' }
        ],
        cta: { title: 'Emergency? We are open 24x7', text: 'Call us right away, or book an OPD appointment on WhatsApp.', button: 'bookAppointment' }
      },
      defaultServices: [
        { title: '24x7 Emergency', desc: 'Round-the-clock emergency care.', icon: 'bi-heart-pulse' },
        { title: 'General Medicine', desc: 'Diagnosis and treatment by experienced physicians.', icon: 'bi-clipboard2-pulse' },
        { title: 'Surgery', desc: 'Modern operation theatres and skilled surgeons.', icon: 'bi-hospital' },
        { title: 'Diagnostics', desc: 'In-house lab, X-ray and ultrasound.', icon: 'bi-activity' }
      ]
    },
    school: {
      preset: 'education', label: 'school', schema: 'School', services: 'programs', style: 'cards', icon: 'bi-mortarboard',
      hero: 'center', photos: 'education',
      order: ['hero', 'highlights', 'about', 'services', 'results', 'why', 'gallery', 'testimonials', 'cta', 'faq', 'hours', 'contact'],
      look: {
        cta: { title: 'Admissions are open', text: 'Ask us about seats, fees and a campus visit on WhatsApp.', button: 'admissionEnquiry' }
      },
      defaultServices: [
        { title: 'Pre-Primary', desc: 'Play-based learning for our youngest learners.', icon: 'bi-balloon' },
        { title: 'Primary', desc: 'Strong foundations in language, maths and science.', icon: 'bi-book' },
        { title: 'Middle & Secondary', desc: 'Concept-focused teaching and board preparation.', icon: 'bi-mortarboard' },
        { title: 'Sports & Activities', desc: 'Sports, arts and clubs for all-round growth.', icon: 'bi-trophy' }
      ]
    },
    coaching: {
      preset: 'education', label: 'coaching institute', schema: 'EducationalOrganization', services: 'courses', style: 'cards', icon: 'bi-book',
      hero: 'split', photos: 'coaching',
      order: ['hero', 'highlights', 'results', 'services', 'why', 'testimonials', 'cta', 'about', 'gallery', 'faq', 'hours', 'contact'],
      look: {
        palette: { primary: '#4338CA', accent: '#F97316', background: '#F7F7FC', surface: '#FFFFFF', text: '#1E1B3A' },
        headingFont: 'Sora', bodyFont: 'Inter', buttonStyle: 'rounded', borderRadius: '12px',
        alternatives: [
          { name: 'Topper Red', primary: '#B91C1C', accent: '#FACC15', background: '#FCF8F7', surface: '#FFFFFF', text: '#2A1414' },
          { name: 'Focus Teal', primary: '#0F766E', accent: '#F59E0B', background: '#F3FAF9', surface: '#FFFFFF', text: '#0F2422' }
        ],
        highlightIcon: 'bi-trophy',
        taglineDefault: 'Result-focused coaching with small batches in {city}',
        aboutDefault: '{name} is a {category} in {city} built around one goal: results. Experienced faculty, small batches, a full test series and personal doubt sessions help every student reach their target score.',
        whyChooseUs: [
          { icon: 'bi-person-workspace', title: 'Expert faculty', text: 'Teachers with years of exam-specific experience.' },
          { icon: 'bi-journal-check', title: 'Full test series', text: 'Weekly tests with All-India level analysis.' },
          { icon: 'bi-people', title: 'Small batches', text: 'Every student is known and tracked personally.' },
          { icon: 'bi-chat-dots', title: 'Daily doubt sessions', text: 'Get stuck questions solved the same day.' }
        ],
        faqs: [
          { q: 'Can I attend a free demo class?', a: 'Yes. Message us on WhatsApp to book a free demo class in your subject.' },
          { q: 'What are the batch timings?', a: 'We run morning, evening and weekend batches. Ask us for the current schedule.' },
          { q: 'Can fees be paid in instalments?', a: 'Yes, fees can be paid in easy instalments. Scholarships are available on merit.' },
          { q: 'Do you have online classes?', a: 'Yes, live online classes and recorded lectures are available for most courses.' }
        ],
        cta: { title: 'Book a free demo class', text: 'See how we teach before you join. Seats are limited in every batch.', button: 'bookDemo' }
      },
      defaultServices: [
        { title: 'Class 9-10 Foundation', desc: 'Maths and science with regular tests.', icon: 'bi-journal-check' },
        { title: 'Class 11-12 Boards', desc: 'Complete board exam preparation.', icon: 'bi-book' },
        { title: 'Competitive Exams', desc: 'Focused coaching for entrance exams.', icon: 'bi-trophy' },
        { title: 'Doubt Sessions', desc: 'One-on-one doubt clearing every week.', icon: 'bi-chat-dots' }
      ]
    },
    hotel: {
      preset: 'hospitality', label: 'hotel', schema: 'Hotel', services: 'rooms', style: 'cards', icon: 'bi-building',
      hero: 'full', photos: 'hospitality',
      order: ['hero', 'highlights', 'services', 'gallery', 'about', 'why', 'testimonials', 'cta', 'faq', 'hours', 'contact'],
      defaultServices: [
        { title: 'Standard Room', desc: 'Comfortable room with all essentials.', icon: 'bi-house-door' },
        { title: 'Deluxe Room', desc: 'More space, a better view and extra comfort.', icon: 'bi-stars' },
        { title: 'Family Suite', desc: 'Spacious suite for families and groups.', icon: 'bi-people' },
        { title: 'Restaurant', desc: 'In-house dining for breakfast, lunch and dinner.', icon: 'bi-egg-fried' }
      ]
    },
    'car-service': {
      preset: 'industrial', label: 'car service centre', schema: 'AutoRepair', services: 'services', style: 'cards', icon: 'bi-car-front',
      hero: 'full', photos: 'industrial',
      order: ['hero', 'highlights', 'services', 'why', 'cta', 'about', 'testimonials', 'hours', 'gallery', 'faq', 'contact'],
      defaultServices: [
        { title: 'Periodic Service', desc: 'Oil change, filters and a complete check-up.', icon: 'bi-wrench-adjustable' },
        { title: 'Denting & Painting', desc: 'Accident repair and factory-finish paint.', icon: 'bi-brush' },
        { title: 'AC Repair', desc: 'Gas refill and AC system repair.', icon: 'bi-snow' },
        { title: 'Wheel Alignment', desc: 'Computerised alignment and balancing.', icon: 'bi-gear' }
      ]
    },
    garage: {
      preset: 'industrial', label: 'car garage', schema: 'AutoRepair', services: 'services', style: 'cards', icon: 'bi-wrench-adjustable',
      hero: 'full', photos: 'garage',
      order: ['hero', 'highlights', 'services', 'why', 'testimonials', 'cta', 'hours', 'faq', 'about', 'gallery', 'contact'],
      look: {
        palette: { primary: '#F2B705', accent: '#1C1C1E', background: '#F3F2EE', surface: '#FFFFFF', text: '#1C1C1E' },
        headingFont: 'Saira', bodyFont: 'Roboto', buttonStyle: 'square', borderRadius: '4px',
        alternatives: [
          { name: 'Racing Green', primary: '#15803D', accent: '#1C1C1E', background: '#F2F4F1', surface: '#FFFFFF', text: '#141A15' },
          { name: 'Workshop Blue', primary: '#1D4ED8', accent: '#F59E0B', background: '#F1F3F7', surface: '#FFFFFF', text: '#111827' }
        ],
        highlightIcon: 'bi-wrench-adjustable',
        taglineDefault: 'Honest car repairs for every make and model in {city}',
        aboutDefault: '{name} is a trusted multi-brand {category} in {city}. Our mechanics show you exactly what is wrong, give you a fair estimate before starting, and hand back your old parts so you know the work was done.',
        whyChooseUs: [
          { icon: 'bi-car-front', title: 'All makes & models', text: 'Maruti to Mercedes, petrol, diesel and CNG.' },
          { icon: 'bi-eye', title: 'See the problem', text: 'We show you the fault and return your old parts.' },
          { icon: 'bi-currency-rupee', title: 'Fair labour rates', text: 'Much lower than authorised workshops.' },
          { icon: 'bi-cone-striped', title: 'Breakdown help', text: 'Roadside help and towing when you are stuck.' }
        ],
        faqs: [
          { q: 'Can I get an estimate before you start?', a: 'Always. We inspect the car, explain the problem and start only after you approve the estimate.' },
          { q: 'Do you use genuine parts?', a: 'Yes. We offer genuine (OEM) parts and good-quality alternatives, and tell you the price of both.' },
          { q: 'Do you offer pick-up and drop?', a: 'Yes, within the city. Send your location on WhatsApp.' },
          { q: 'Will my car insurance cover repairs here?', a: 'For accident repairs we help with the claim paperwork. Ask us about your insurer.' }
        ],
        cta: { title: 'Car trouble?', text: 'Send a photo or describe the problem on WhatsApp for a quick estimate.', button: 'getQuote' }
      },
      defaultServices: [
        { title: 'General Repairs', desc: 'Engine, brakes, clutch and suspension work for all makes.', icon: 'bi-wrench-adjustable' },
        { title: 'Breakdown Help', desc: 'Roadside help and towing when your car will not start.', icon: 'bi-cone-striped' },
        { title: 'Battery & Tyres', desc: 'Battery replacement, puncture repair and new tyres.', icon: 'bi-battery-charging' },
        { title: 'Periodic Service', desc: 'Oil change, filters and a full check-up at fair rates.', icon: 'bi-car-front' }
      ]
    },
    electronics: {
      preset: 'industrial', label: 'electronics store', schema: 'ElectronicsStore', services: 'products', style: 'cards', icon: 'bi-cpu',
      hero: 'split', photos: 'electronics',
      order: ['hero', 'highlights', 'services', 'why', 'about', 'gallery', 'testimonials', 'hours', 'cta', 'faq', 'contact'],
      look: {
        palette: { primary: '#2563EB', accent: '#06B6D4', background: '#F5F8FF', surface: '#FFFFFF', text: '#0B1220' },
        headingFont: 'Space Grotesk', bodyFont: 'Inter', buttonStyle: 'rounded', borderRadius: '14px',
        alternatives: [
          { name: 'Neon Purple', primary: '#7C3AED', accent: '#22D3EE', background: '#F8F6FE', surface: '#FFFFFF', text: '#171233' },
          { name: 'Signal Red', primary: '#DC2626', accent: '#0EA5E9', background: '#FBF7F7', surface: '#FFFFFF', text: '#1F1313' }
        ],
        highlightIcon: 'bi-cpu',
        taglineDefault: 'Latest phones, laptops and appliances at the best prices in {city}',
        aboutDefault: '{name} is a trusted {category} in {city} for mobiles, laptops, TVs and home appliances from the top brands. Genuine products with bill and warranty, easy EMI, exchange offers and quick repairs.',
        whyChooseUs: [
          { icon: 'bi-patch-check', title: 'Genuine products', text: 'Original stock with GST bill and brand warranty.' },
          { icon: 'bi-credit-card', title: 'Easy EMI', text: 'No-cost EMI on most cards and finance options.' },
          { icon: 'bi-arrow-repeat', title: 'Exchange offers', text: 'Best value for your old phone or appliance.' },
          { icon: 'bi-tools', title: 'Repairs & service', text: 'Screen, battery and board repairs done quickly.' }
        ],
        faqs: [
          { q: 'Do you offer EMI?', a: 'Yes, no-cost EMI is available on most products with major cards and finance companies.' },
          { q: 'Can I exchange my old phone?', a: 'Yes. Bring it in or send photos on WhatsApp for an exchange value.' },
          { q: 'Are products covered by warranty?', a: 'All products come with the official brand warranty and a GST invoice.' },
          { q: 'Do you deliver and install?', a: 'Yes, TVs and appliances are delivered and installed at home.' }
        ],
        cta: { title: 'Looking for a new gadget?', text: 'Ask for today\'s price and offers on WhatsApp.', button: 'checkPrice' }
      },
      defaultServices: [
        { title: 'Mobiles & Accessories', desc: 'Latest phones, chargers and covers.', icon: 'bi-phone' },
        { title: 'TV & Appliances', desc: 'Top brands at the best prices.', icon: 'bi-tv' },
        { title: 'Laptops', desc: 'Laptops and accessories for work and study.', icon: 'bi-laptop' },
        { title: 'Repairs', desc: 'Quick repairs with genuine parts.', icon: 'bi-tools' }
      ]
    },
    hardware: {
      preset: 'industrial', label: 'hardware store', schema: 'HardwareStore', services: 'products', style: 'cards', icon: 'bi-tools',
      hero: 'split', photos: 'hardware',
      order: ['hero', 'highlights', 'services', 'about', 'why', 'hours', 'gallery', 'testimonials', 'cta', 'faq', 'contact'],
      look: {
        palette: { primary: '#166534', accent: '#FACC15', background: '#F5F7F2', surface: '#FFFFFF', text: '#14201A' },
        headingFont: 'Archivo', bodyFont: 'Roboto', buttonStyle: 'rounded', borderRadius: '6px',
        alternatives: [
          { name: 'Brick Red', primary: '#B91C1C', accent: '#FACC15', background: '#F8F5F3', surface: '#FFFFFF', text: '#231312' },
          { name: 'Cement Grey', primary: '#374151', accent: '#F97316', background: '#F4F4F5', surface: '#FFFFFF', text: '#111827' }
        ],
        highlightIcon: 'bi-tools',
        taglineDefault: 'Tools, plumbing, electricals and paints under one roof in {city}',
        aboutDefault: '{name} is a well-stocked {category} in {city} for homeowners, contractors and builders. Tools, plumbing, electricals, paints and fittings from trusted brands, at fair prices with delivery to your site.',
        whyChooseUs: [
          { icon: 'bi-box-seam', title: 'Huge stock', text: 'Thousands of items, so you get everything in one trip.' },
          { icon: 'bi-patch-check', title: 'Trusted brands', text: 'Asian Paints, Havells, Supreme, Bosch and more.' },
          { icon: 'bi-percent', title: 'Contractor rates', text: 'Special prices for bulk and regular buyers.' },
          { icon: 'bi-truck', title: 'Site delivery', text: 'Delivery to your home or site, same day.' }
        ],
        faqs: [
          { q: 'Do you give discounts on bulk orders?', a: 'Yes. Contractors and bulk buyers get special rates. Send your list on WhatsApp for a quote.' },
          { q: 'Do you deliver to site?', a: 'Yes, we deliver across the city, usually the same day.' },
          { q: 'Can you mix paint colours?', a: 'Yes, we have computerised colour mixing for thousands of shades.' },
          { q: 'Can I return unused items?', a: 'Unused items in original packing can be returned with the bill within 7 days.' }
        ],
        cta: { title: 'Need materials for your project?', text: 'Send your list on WhatsApp and we will share a quote.', button: 'getQuote' }
      },
      defaultServices: [
        { title: 'Tools', desc: 'Hand tools and power tools from trusted brands.', icon: 'bi-hammer' },
        { title: 'Plumbing', desc: 'Pipes, fittings and sanitary ware.', icon: 'bi-droplet' },
        { title: 'Electricals', desc: 'Wires, switches and lighting.', icon: 'bi-plug' },
        { title: 'Paints', desc: 'Interior and exterior paints and supplies.', icon: 'bi-paint-bucket' }
      ]
    },
    jewellery: {
      preset: 'luxury', label: 'jewellery store', schema: 'JewelryStore', services: 'collections', style: 'cards', icon: 'bi-gem',
      hero: 'center', photos: 'luxury',
      order: ['hero', 'highlights', 'gallery', 'services', 'about', 'why', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      defaultServices: [
        { title: 'Gold Jewellery', desc: 'Hallmarked necklaces, bangles and rings.', icon: 'bi-gem' },
        { title: 'Diamond Collection', desc: 'Certified diamonds in timeless designs.', icon: 'bi-stars' },
        { title: 'Silver', desc: 'Silver jewellery, articles and gifts.', icon: 'bi-circle' },
        { title: 'Bridal Sets', desc: 'Complete sets for your special day.', icon: 'bi-heart' }
      ]
    },
    'real-estate': {
      preset: 'general', label: 'real estate agency', schema: 'RealEstateAgent', services: 'properties', style: 'cards', icon: 'bi-house-door',
      hero: 'split', photos: 'real-estate',
      order: ['hero', 'highlights', 'services', 'why', 'about', 'testimonials', 'cta', 'gallery', 'faq', 'hours', 'contact'],
      look: {
        palette: { primary: '#0F3D3E', accent: '#C9A66B', background: '#F7F5F0', surface: '#FFFFFF', text: '#142425' },
        headingFont: 'Fraunces', bodyFont: 'Manrope', buttonStyle: 'rounded', borderRadius: '12px',
        alternatives: [
          { name: 'Terracotta', primary: '#9A3412', accent: '#E9C46A', background: '#FBF6F2', surface: '#FFFFFF', text: '#2A160C' },
          { name: 'Skyline Blue', primary: '#1E3A5F', accent: '#F2A541', background: '#F4F7FA', surface: '#FFFFFF', text: '#122033' }
        ],
        highlightIcon: 'bi-house-check',
        taglineDefault: 'Verified homes, plots and rentals in {city}',
        aboutDefault: '{name} is a trusted {category} in {city} helping families and investors buy, sell and rent property with confidence. Every listing is verified, and we handle site visits, negotiation, home loans and registration for you.',
        whyChooseUs: [
          { icon: 'bi-patch-check', title: 'Verified listings', text: 'Clear titles and genuine owners only.' },
          { icon: 'bi-building-check', title: 'RERA registered', text: 'Transparent dealings you can trust.' },
          { icon: 'bi-bank', title: 'Home loan help', text: 'Tie-ups with leading banks for quick approvals.' },
          { icon: 'bi-file-earmark-text', title: 'Legal paperwork', text: 'Agreements, registration and documentation handled.' }
        ],
        faqs: [
          { q: 'Do you charge for site visits?', a: 'No. Site visits are free, and we can pick you up for visits to multiple properties.' },
          { q: 'What is your brokerage?', a: 'Brokerage depends on the property and deal type. We tell you upfront, before any visit.' },
          { q: 'Which documents should I check before buying?', a: 'Title deed, encumbrance certificate, approved plan, RERA registration and tax receipts. We verify all of these for you.' },
          { q: 'Can you help with a home loan?', a: 'Yes. We work with leading banks and help with the paperwork for a quick approval.' }
        ],
        cta: { title: 'Looking for the right property?', text: 'Tell us your budget and area on WhatsApp and book a free site visit.', button: 'siteVisit' }
      },
      defaultServices: [
        { title: 'Buy a Home', desc: 'Verified flats, houses and plots.', icon: 'bi-house-door' },
        { title: 'Sell Property', desc: 'The right buyer at the right price.', icon: 'bi-cash-coin' },
        { title: 'Rentals', desc: 'Homes and shops for rent.', icon: 'bi-key' },
        { title: 'Legal Help', desc: 'Documentation and registration support.', icon: 'bi-file-earmark-text' }
      ]
    },
    bar: {
      preset: 'nightlife', label: 'bar', schema: 'BarOrPub', services: 'menu', style: 'menu', icon: 'bi-cup-straw',
      hero: 'center', photos: 'nightlife',
      order: ['hero', 'highlights', 'services', 'gallery', 'hours', 'why', 'testimonials', 'cta', 'about', 'faq', 'contact'],
      defaultServices: [
        { title: 'Cocktails', desc: 'Classic and signature cocktails, shaken and stirred.', icon: 'bi-cup-straw' },
        { title: 'Beer & Spirits', desc: 'Chilled beer on tap and a wide range of spirits.', icon: 'bi-cup' },
        { title: 'Bar Food', desc: 'Starters, platters and snacks to share.', icon: 'bi-egg-fried' },
        { title: 'Live Music & DJ', desc: 'Weekend gigs, DJ nights and match screenings.', icon: 'bi-music-note-beamed' }
      ]
    },
    travel: {
      preset: 'travel', label: 'tour & travel agency', schema: 'TravelAgency', services: 'packages', style: 'cards', icon: 'bi-airplane',
      hero: 'center', photos: 'travel',
      order: ['hero', 'services', 'gallery', 'why', 'highlights', 'testimonials', 'cta', 'about', 'faq', 'hours', 'contact'],
      defaultServices: [
        { title: 'Holiday Packages', desc: 'Hotels, sightseeing and transfers in one plan.', icon: 'bi-luggage' },
        { title: 'Flight & Train Tickets', desc: 'Domestic and international bookings at good fares.', icon: 'bi-airplane' },
        { title: 'Cab & Tempo Traveller', desc: 'Outstation cabs and group vehicles with drivers.', icon: 'bi-car-front' },
        { title: 'Visa & Passport Help', desc: 'Guidance and paperwork for smooth approvals.', icon: 'bi-passport' }
      ]
    },
    handyman: {
      preset: 'trades', label: 'handyman service', schema: 'HomeAndConstructionBusiness', services: 'services', style: 'cards', icon: 'bi-tools',
      hero: 'split', photos: 'trades',
      order: ['hero', 'highlights', 'services', 'why', 'cta', 'testimonials', 'faq', 'about', 'gallery', 'hours', 'contact'],
      defaultServices: [
        { title: 'Plumbing', desc: 'Leaks, taps, blockages and bathroom fittings.', icon: 'bi-droplet' },
        { title: 'Electrical', desc: 'Wiring, switches, fans and light fittings.', icon: 'bi-lightning' },
        { title: 'Carpentry', desc: 'Furniture repair, doors, locks and assembly.', icon: 'bi-hammer' },
        { title: 'Painting & Repairs', desc: 'Touch-ups, wall repairs and small renovations.', icon: 'bi-paint-bucket' }
      ]
    },
    general: {
      preset: 'general', label: 'local business', schema: 'LocalBusiness', services: 'services', style: 'cards', icon: 'bi-shop',
      hero: 'full', photos: 'general',
      order: ['hero', 'highlights', 'about', 'services', 'why', 'gallery', 'testimonials', 'cta', 'hours', 'faq', 'contact'],
      defaultServices: [
        { title: 'Quality Service', desc: 'Done right, every time.', icon: 'bi-award' },
        { title: 'Expert Advice', desc: 'Honest guidance from experienced people.', icon: 'bi-chat-dots' },
        { title: 'Fair Prices', desc: 'Clear pricing with no hidden charges.', icon: 'bi-currency-rupee' }
      ]
    }
  };

  /* Keyword → icon map for highlight badges ("Free Parking" → bi-p-circle). */
  var HIGHLIGHT_ICONS = [
    [/cocktail|beer|bar\b|drinks|brew/i, 'bi-cup-straw'],
    [/music|\bdj\b|live band|karaoke/i, 'bi-music-note-beamed'],
    [/screening|sports|match/i, 'bi-tv'],
    [/visa|passport/i, 'bi-passport'],
    [/flight|ticket|tour|holiday|trip/i, 'bi-airplane'],
    [/cab|taxi|tempo|bus\b/i, 'bi-car-front'],
    [/plumb|leak/i, 'bi-droplet'],
    [/electric|wiring/i, 'bi-lightning'],
    [/carpent|furniture/i, 'bi-hammer'],
    [/towing|breakdown|roadside/i, 'bi-cone-striped'],
    [/veg|vegetarian/i, 'bi-flower3'],
    [/deliver/i, 'bi-truck'],
    [/park/i, 'bi-p-circle'],
    [/family|kids|child/i, 'bi-people'],
    [/\bac\b|air.?condition/i, 'bi-snow'],
    [/wi.?fi|internet/i, 'bi-wifi'],
    [/card|upi|payment|cash/i, 'bi-credit-card'],
    [/appoint|booking/i, 'bi-calendar-check'],
    [/24|night|round.the.clock/i, 'bi-clock'],
    [/certif|licen|registered|hallmark/i, 'bi-patch-check'],
    [/hygien|clean|safe|steril/i, 'bi-shield-check'],
    [/experienc|expert|year/i, 'bi-award'],
    [/emergenc/i, 'bi-heart-pulse'],
    [/trainer|coach/i, 'bi-person-check'],
    [/women|ladies|female/i, 'bi-gender-female'],
    [/warrant|guarantee/i, 'bi-shield-check'],
    [/pick.?up|doorstep|home service/i, 'bi-car-front'],
    [/organic|natural|herbal/i, 'bi-tree'],
    [/gold|diamond|jewel/i, 'bi-gem'],
    [/result|topper|rank/i, 'bi-trophy'],
    [/takeaway|take away|parcel/i, 'bi-bag'],
    [/party|catering|event/i, 'bi-gift'],
    [/sweet|cake|dessert/i, 'bi-cake2'],
    [/coffee|tea|chai/i, 'bi-cup-hot'],
    [/wheelchair|accessible/i, 'bi-universal-access'],
    [/price|afford|cheap|budget/i, 'bi-currency-rupee']
  ];

  window.THEME_PRESETS = PRESETS;
  window.THEME_CATEGORIES = CATEGORIES;
  window.FONT_WEIGHTS = FONT_WEIGHTS;
  window.HIGHLIGHT_ICONS = HIGHLIGHT_ICONS;
})(window);
