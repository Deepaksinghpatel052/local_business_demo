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

    /* Salon / spa / boutique — soft rose, nude, gold, elegant serif */
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
   */
  var CATEGORIES = {
    restaurant: {
      preset: 'food', label: 'restaurant', schema: 'Restaurant', services: 'menu', style: 'menu', icon: 'bi-egg-fried',
      defaultServices: [
        { title: 'Dine-in', desc: 'Comfortable seating for families and groups.', icon: 'bi-shop' },
        { title: 'Takeaway', desc: 'Call ahead and pick up your order hot and fresh.', icon: 'bi-bag' },
        { title: 'Home Delivery', desc: 'Order on WhatsApp and we deliver to your door.', icon: 'bi-truck' },
        { title: 'Party Orders', desc: 'Bulk orders and catering for every occasion.', icon: 'bi-gift' }
      ]
    },
    cafe: {
      preset: 'food', label: 'café', schema: 'CafeOrCoffeeShop', services: 'menu', style: 'menu', icon: 'bi-cup-hot',
      defaultServices: [
        { title: 'Coffee & Tea', desc: 'Freshly brewed hot and cold beverages.', icon: 'bi-cup-hot' },
        { title: 'Snacks & Bites', desc: 'Sandwiches, fries and quick bites.', icon: 'bi-basket' },
        { title: 'Desserts', desc: 'Cakes, brownies and sweet treats.', icon: 'bi-cake2' },
        { title: 'Free Wi-Fi', desc: 'A cosy place to work or catch up.', icon: 'bi-wifi' }
      ]
    },
    bakery: {
      preset: 'food', label: 'bakery', schema: 'Bakery', services: 'menu', style: 'menu', icon: 'bi-cake2',
      defaultServices: [
        { title: 'Custom Cakes', desc: 'Birthday, anniversary and theme cakes made to order.', icon: 'bi-cake2' },
        { title: 'Fresh Breads', desc: 'Baked fresh every morning.', icon: 'bi-basket' },
        { title: 'Cookies & Pastries', desc: 'Crisp, buttery and freshly baked.', icon: 'bi-stars' },
        { title: 'Party Orders', desc: 'Bulk orders for parties and offices.', icon: 'bi-gift' }
      ]
    },
    salon: {
      preset: 'beauty', label: 'salon', schema: 'BeautySalon', services: 'services', style: 'cards', icon: 'bi-scissors',
      defaultServices: [
        { title: 'Haircut & Styling', desc: 'Cuts, blow-dry and styling for every look.', icon: 'bi-scissors' },
        { title: 'Hair Colour', desc: 'Global colour, highlights and balayage.', icon: 'bi-palette' },
        { title: 'Facials & Skin', desc: 'Cleanups and facials for glowing skin.', icon: 'bi-flower1' },
        { title: 'Bridal Makeup', desc: 'Complete bridal and party makeup packages.', icon: 'bi-stars' }
      ]
    },
    spa: {
      preset: 'beauty', label: 'spa', schema: 'DaySpa', services: 'treatments', style: 'cards', icon: 'bi-flower1',
      defaultServices: [
        { title: 'Swedish Massage', desc: 'A relaxing full-body massage to melt away stress.', icon: 'bi-flower1' },
        { title: 'Deep Tissue', desc: 'Targeted relief for tight, tired muscles.', icon: 'bi-heart' },
        { title: 'Body Scrub', desc: 'Exfoliating scrubs for soft, renewed skin.', icon: 'bi-droplet' },
        { title: 'Couple Packages', desc: 'Side-by-side treatments for two.', icon: 'bi-people' }
      ]
    },
    boutique: {
      preset: 'beauty', label: 'boutique', schema: 'ClothingStore', services: 'collections', style: 'cards', icon: 'bi-bag-heart',
      defaultServices: [
        { title: 'Ethnic Wear', desc: 'Sarees, suits and lehengas for every occasion.', icon: 'bi-bag-heart' },
        { title: 'Western Wear', desc: 'Dresses, tops and everyday styles.', icon: 'bi-handbag' },
        { title: 'Custom Stitching', desc: 'Tailoring and alterations for the perfect fit.', icon: 'bi-scissors' },
        { title: 'Bridal Collection', desc: 'Designer pieces for your big day.', icon: 'bi-stars' }
      ]
    },
    gym: {
      preset: 'fitness', label: 'gym', schema: 'HealthClub', services: 'plans', style: 'plans', icon: 'bi-lightning-charge',
      defaultServices: [
        { title: 'Monthly', price: 'Ask us', desc: 'Full gym access.', features: ['All equipment', 'Locker room', 'General trainer'] },
        { title: 'Quarterly', price: 'Ask us', desc: 'Our most popular plan.', features: ['All equipment', 'Diet guidance', 'Body assessment'], popular: true },
        { title: 'Personal Training', price: 'Ask us', desc: 'One-on-one coaching.', features: ['Dedicated trainer', 'Custom plan', 'Weekly check-ins'] }
      ]
    },
    clinic: {
      preset: 'medical', label: 'clinic', schema: 'MedicalClinic', services: 'services', style: 'cards', icon: 'bi-heart-pulse',
      defaultServices: [
        { title: 'General Consultation', desc: 'Diagnosis and treatment for everyday health concerns.', icon: 'bi-clipboard2-pulse' },
        { title: 'Health Check-ups', desc: 'Preventive check-up packages for all ages.', icon: 'bi-heart-pulse' },
        { title: 'Diabetes & BP Care', desc: 'Regular monitoring and long-term management.', icon: 'bi-activity' },
        { title: 'Vaccinations', desc: 'Vaccines for children and adults.', icon: 'bi-shield-plus' }
      ]
    },
    dentist: {
      preset: 'medical', label: 'dental clinic', schema: 'Dentist', services: 'treatments', style: 'cards', icon: 'bi-emoji-smile',
      defaultServices: [
        { title: 'Check-up & Cleaning', desc: 'Scaling, polishing and a complete oral check-up.', icon: 'bi-emoji-smile' },
        { title: 'Root Canal', desc: 'Painless single-sitting RCT where possible.', icon: 'bi-shield-plus' },
        { title: 'Braces & Aligners', desc: 'Straighter teeth with modern orthodontics.', icon: 'bi-stars' },
        { title: 'Implants', desc: 'Permanent, natural-looking tooth replacement.', icon: 'bi-award' }
      ]
    },
    hospital: {
      preset: 'medical', label: 'hospital', schema: 'Hospital', services: 'departments', style: 'cards', icon: 'bi-hospital',
      defaultServices: [
        { title: '24x7 Emergency', desc: 'Round-the-clock emergency care.', icon: 'bi-heart-pulse' },
        { title: 'General Medicine', desc: 'Diagnosis and treatment by experienced physicians.', icon: 'bi-clipboard2-pulse' },
        { title: 'Surgery', desc: 'Modern operation theatres and skilled surgeons.', icon: 'bi-hospital' },
        { title: 'Diagnostics', desc: 'In-house lab, X-ray and ultrasound.', icon: 'bi-activity' }
      ]
    },
    school: {
      preset: 'education', label: 'school', schema: 'School', services: 'programs', style: 'cards', icon: 'bi-mortarboard',
      defaultServices: [
        { title: 'Pre-Primary', desc: 'Play-based learning for our youngest learners.', icon: 'bi-balloon' },
        { title: 'Primary', desc: 'Strong foundations in language, maths and science.', icon: 'bi-book' },
        { title: 'Middle & Secondary', desc: 'Concept-focused teaching and board preparation.', icon: 'bi-mortarboard' },
        { title: 'Sports & Activities', desc: 'Sports, arts and clubs for all-round growth.', icon: 'bi-trophy' }
      ]
    },
    coaching: {
      preset: 'education', label: 'coaching institute', schema: 'EducationalOrganization', services: 'courses', style: 'cards', icon: 'bi-book',
      defaultServices: [
        { title: 'Class 9-10 Foundation', desc: 'Maths and science with regular tests.', icon: 'bi-journal-check' },
        { title: 'Class 11-12 Boards', desc: 'Complete board exam preparation.', icon: 'bi-book' },
        { title: 'Competitive Exams', desc: 'Focused coaching for entrance exams.', icon: 'bi-trophy' },
        { title: 'Doubt Sessions', desc: 'One-on-one doubt clearing every week.', icon: 'bi-chat-dots' }
      ]
    },
    hotel: {
      preset: 'hospitality', label: 'hotel', schema: 'Hotel', services: 'rooms', style: 'cards', icon: 'bi-building',
      defaultServices: [
        { title: 'Standard Room', desc: 'Comfortable room with all essentials.', icon: 'bi-house-door' },
        { title: 'Deluxe Room', desc: 'More space, a better view and extra comfort.', icon: 'bi-stars' },
        { title: 'Family Suite', desc: 'Spacious suite for families and groups.', icon: 'bi-people' },
        { title: 'Restaurant', desc: 'In-house dining for breakfast, lunch and dinner.', icon: 'bi-egg-fried' }
      ]
    },
    'car-service': {
      preset: 'industrial', label: 'car service centre', schema: 'AutoRepair', services: 'services', style: 'cards', icon: 'bi-car-front',
      defaultServices: [
        { title: 'Periodic Service', desc: 'Oil change, filters and a complete check-up.', icon: 'bi-wrench-adjustable' },
        { title: 'Denting & Painting', desc: 'Accident repair and factory-finish paint.', icon: 'bi-brush' },
        { title: 'AC Repair', desc: 'Gas refill and AC system repair.', icon: 'bi-snow' },
        { title: 'Wheel Alignment', desc: 'Computerised alignment and balancing.', icon: 'bi-gear' }
      ]
    },
    electronics: {
      preset: 'industrial', label: 'electronics store', schema: 'ElectronicsStore', services: 'products', style: 'cards', icon: 'bi-cpu',
      defaultServices: [
        { title: 'Mobiles & Accessories', desc: 'Latest phones, chargers and covers.', icon: 'bi-phone' },
        { title: 'TV & Appliances', desc: 'Top brands at the best prices.', icon: 'bi-tv' },
        { title: 'Laptops', desc: 'Laptops and accessories for work and study.', icon: 'bi-laptop' },
        { title: 'Repairs', desc: 'Quick repairs with genuine parts.', icon: 'bi-tools' }
      ]
    },
    hardware: {
      preset: 'industrial', label: 'hardware store', schema: 'HardwareStore', services: 'products', style: 'cards', icon: 'bi-tools',
      defaultServices: [
        { title: 'Tools', desc: 'Hand tools and power tools from trusted brands.', icon: 'bi-hammer' },
        { title: 'Plumbing', desc: 'Pipes, fittings and sanitary ware.', icon: 'bi-droplet' },
        { title: 'Electricals', desc: 'Wires, switches and lighting.', icon: 'bi-plug' },
        { title: 'Paints', desc: 'Interior and exterior paints and supplies.', icon: 'bi-paint-bucket' }
      ]
    },
    jewellery: {
      preset: 'luxury', label: 'jewellery store', schema: 'JewelryStore', services: 'collections', style: 'cards', icon: 'bi-gem',
      defaultServices: [
        { title: 'Gold Jewellery', desc: 'Hallmarked necklaces, bangles and rings.', icon: 'bi-gem' },
        { title: 'Diamond Collection', desc: 'Certified diamonds in timeless designs.', icon: 'bi-stars' },
        { title: 'Silver', desc: 'Silver jewellery, articles and gifts.', icon: 'bi-circle' },
        { title: 'Bridal Sets', desc: 'Complete sets for your special day.', icon: 'bi-heart' }
      ]
    },
    'real-estate': {
      preset: 'general', label: 'real estate agency', schema: 'RealEstateAgent', services: 'properties', style: 'cards', icon: 'bi-house-door',
      defaultServices: [
        { title: 'Buy a Home', desc: 'Verified flats, houses and plots.', icon: 'bi-house-door' },
        { title: 'Sell Property', desc: 'The right buyer at the right price.', icon: 'bi-cash-coin' },
        { title: 'Rentals', desc: 'Homes and shops for rent.', icon: 'bi-key' },
        { title: 'Legal Help', desc: 'Documentation and registration support.', icon: 'bi-file-earmark-text' }
      ]
    },
    general: {
      preset: 'general', label: 'local business', schema: 'LocalBusiness', services: 'services', style: 'cards', icon: 'bi-shop',
      defaultServices: [
        { title: 'Quality Service', desc: 'Done right, every time.', icon: 'bi-award' },
        { title: 'Expert Advice', desc: 'Honest guidance from experienced people.', icon: 'bi-chat-dots' },
        { title: 'Fair Prices', desc: 'Clear pricing with no hidden charges.', icon: 'bi-currency-rupee' }
      ]
    }
  };

  /* Keyword → icon map for highlight badges ("Free Parking" → bi-p-circle). */
  var HIGHLIGHT_ICONS = [
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
