import React, { createContext, useContext, useEffect, useState } from "react";

const LANG_KEY = "kisansathi_lang";

const translations = {
  en: {
    nav: {
      brand: "Kisan Sarthi",
      tagline: "Skip the line. Keep your day.",
      centers: "Centers",
      howItWorks: "How It Works",
      dashboard: "Dashboard",
      profile: "Profile",
      login: "Log in",
      register: "Register",
      logout: "Log out",
      toggleLang: "हिन्दी",
      menu: "Menu",
    },
    hero: {
      findCenter: "Find a center",
      register: "Register as Farmer",
      quickStatus: "Live Mandi Status",
    },
    problem: {
      eyebrow: "THE PROBLEM",
      title: "Hours lost in mandi queues cost farmers their livelihood.",
      card1Title: "Endless queues at mandis.",
      card1Desc: "Farmers wait 6–12 hours under the scorching sun just to register crops or weigh grains.",
      card2Title: "Wasted trips & uncertainty.",
      card2Desc: "Arriving only to discover counters are full, paused, or closed for the day with zero heads-up.",
      card3Title: "Zero visibility on queue status.",
      card3Desc: "Paper slips offer no estimated time, forcing farmers to stay tethered to crowded shed yards.",
    },
    solution: {
      eyebrow: "ONE PLATFORM",
      title: "Fair, transparent digital queues for every farmer.",
      feat1Title: "Live position in queue",
      feat1Desc: "See exactly how many people are ahead of you from anywhere.",
      feat2Title: "Accurate estimated wait time",
      feat2Desc: "Smart counter calculation predicts your service time to the minute.",
      feat3Title: "Arrival advice alerts",
      feat3Desc: "Receive timely advice on when to leave home or fields to arrive just-in-time.",
      feat4Title: "Walk-in & offline friendly",
      feat4Desc: "Operators can register walk-ins without a smartphone, keeping queues unified.",
      sampleBadge: "SAMPLE LIVE TICKET",
    },
    howItWorks: {
      eyebrow: "HOW IT WORKS",
      title: "Three simple steps to save your workday.",
      step1Title: "1. Find your center",
      step1Desc: "Locate your nearest krishi mandi or procurement center, inspect operating hours, and active counters.",
      step2Title: "2. Book your turn",
      step2Desc: "Select the service needed (Registration, Weighing, Payout) and receive your verified virtual token.",
      step3Title: "3. Arrive when called",
      step3Desc: "Track your token in real-time. Head to the counter only when your number is approaching.",
    },
    centers: {
      eyebrow: "DIRECTORY",
      title: "Government Mandis & Procurement Centers.",
      subtitle: "Locate active centers, view services, and verify real-time counter status.",
      searchPlaceholder: "Search center name or address...",
      allDistricts: "All Districts",
      typeAll: "All Types",
      typeMandi: "Mandi (APMC)",
      typeProcurement: "Procurement Center",
      activeOnly: "Active centers only",
      showing: "Showing",
      of: "of",
      centersFound: "centers found",
      noCenters: "No service centers found matching your criteria.",
      viewDetails: "View Details & Counters",
      hours: "Hours",
      workingDays: "Working days",
      statusActive: "Active",
      statusInactive: "Inactive",
    },
    centerDetail: {
      eyebrow: "CENTER OVERVIEW",
      bookToken: "Book a Token",
      bookingComingSoon: "Booking Coming Soon",
      openHours: "Operating Hours",
      workingDays: "Working Days",
      location: "Location & Directions",
      viewOnMap: "View on Google Maps",
      servicesTitle: "Available Services",
      countersTitle: "Active Counters",
      noCounters: "No counters currently registered for this center.",
      noServices: "No services currently registered for this center.",
      duration: "Est. duration",
      mins: "mins",
      counterActive: "Active",
      counterPaused: "Paused (delays possible)",
      counterInactive: "Inactive",
    },
    footer: {
      desc: "Digital queue management system designed for India's farmers, mandis, and procurement centers.",
      quickLinks: "Quick Links",
      legal: "Public Utility",
      copyright: "© 2026 Kisan Sarthi. Built for fair farmer access.",
    },
  },
  hi: {
    nav: {
      brand: "किसान सारथी",
      tagline: "कतार छोड़ें। अपना समय बचाएं।",
      centers: "मंडी केंद्र",
      howItWorks: "यह कैसे काम करता है",
      dashboard: "डैशबोर्ड",
      profile: "प्रोफ़ाइल",
      login: "लॉग इन",
      register: "नया पंजीकरण",
      logout: "लॉग आउट",
      toggleLang: "English",
      menu: "मेनू",
    },
    hero: {
      findCenter: "मंडी केंद्र खोजें",
      register: "किसान के रूप में जुड़ें",
      quickStatus: "मंडी लाइव स्थिति",
    },
    problem: {
      eyebrow: "समस्या",
      title: "मंडी की कतारों में बर्बाद होने वाले घंटे किसानों की आजीविका छीनते हैं।",
      card1Title: "मंडियों में अंतहीन कतारें।",
      card1Desc: "फसल पंजीकरण या तुलाई के लिए किसानों को चिलचिलाती धूप में 6 से 12 घंटे तक खड़े रहना पड़ता है।",
      card2Title: "व्यर्थ यात्राएं और अनिश्चितता।",
      card2Desc: "मंडी पहुंचकर पता चलता है कि काउंटर बंद या स्थगित हैं, बिना किसी पूर्व सूचना के।",
      card3Title: "कतार की स्थिति की कोई जानकारी नहीं।",
      card3Desc: "कागज की पर्ची से समय का पता नहीं चलता, जिससे किसान पूरे दिन शेड में फंसे रहते हैं।",
    },
    solution: {
      eyebrow: "एक समाधान",
      title: "हर किसान के लिए पारदर्शी और डिजिटल कतार व्यवस्था।",
      feat1Title: "कतार में लाइव क्रम",
      feat1Desc: "कहीं से भी देखें कि आपके आगे कितने किसान हैं।",
      feat2Title: "सटीक अनुमानित प्रतीक्षा समय",
      feat2Desc: "काउंटर की गति के अनुसार मिनट-दर-मिनट समय का आकलन।",
      feat3Title: "पहुँचने की सही सलाह",
      feat3Desc: "मंडी पहुँचने का सही समय जानें ताकि आपका खेत का काम न छूटे।",
      feat4Title: "बिना स्मार्टफ़ोन वाले किसानों के लिए भी",
      feat4Desc: "मंडी ऑपरेटर सीधे वॉक-इन टोकन दर्ज कर सकते हैं।",
      sampleBadge: "नमूना लाइव टोकन",
    },
    howItWorks: {
      eyebrow: "कार्यप्रणाली",
      title: "कार्यदिवस बचाने के लिए तीन सरल कदम।",
      step1Title: "१. केंद्र खोजें",
      step1Desc: "अपनी नजदीकी कृषि मंडी या खरीद केंद्र, समय और सक्रिय काउंटर देखें।",
      step2Title: "२. टोकन बुक करें",
      step2Desc: "अपनी आवश्यक सेवा (पंजीकरण, तुलाई, भुगतान) चुनें और डिजिटल टोकन प्राप्त करें।",
      step3Title: "३. समय पर पहुँचें",
      step3Desc: "लाइव स्थिति देखें और केवल तभी पहुंचें जब आपका नंबर आने वाला हो।",
    },
    centers: {
      eyebrow: "निर्देशिका",
      title: "सरकारी कृषि मंडियां एवं खरीद केंद्र।",
      subtitle: "सक्रिय केंद्र खोजें, सेवाएं देखें और रीयल-टाइम काउंटर स्थिति की पुष्टि करें।",
      searchPlaceholder: "केंद्र का नाम या पता खोजें...",
      allDistricts: "सभी जिले",
      typeAll: "सभी प्रकार",
      typeMandi: "मंडी (APMC)",
      typeProcurement: "खरीद केंद्र",
      activeOnly: "केवल सक्रिय केंद्र",
      showing: "प्रदर्शित",
      of: "कुल",
      centersFound: "केंद्र उपलब्ध",
      noCenters: "आपकी खोज के अनुसार कोई केंद्र नहीं मिला।",
      viewDetails: "विवरण और काउंटर देखें",
      hours: "समय",
      workingDays: "कार्यदिवस",
      statusActive: "सक्रिय",
      statusInactive: "निष्क्रिय",
    },
    centerDetail: {
      eyebrow: "केंद्र विवरण",
      bookToken: "टोकन बुक करें",
      bookingComingSoon: "टोकन बुकिंग शीघ्र उपलब्ध",
      openHours: "कार्य समय",
      workingDays: "कार्य दिवस",
      location: "स्थान और पता",
      viewOnMap: "गूगल मैप पर देखें",
      servicesTitle: "उपलब्ध सेवाएं",
      countersTitle: "सक्रिय काउंटर",
      noCounters: "इस केंद्र के लिए कोई काउंटर पंजीकृत नहीं है।",
      noServices: "इस केंद्र के लिए कोई सेवा पंजीकृत नहीं है।",
      duration: "अनुमानित समय",
      mins: "मिनट",
      counterActive: "सक्रिय",
      counterPaused: "स्थगित (विलंब संभव)",
      counterInactive: "निष्क्रिय",
    },
    footer: {
      desc: "भारत के किसानों, कृषि मंडियों और खरीद केंद्रों के लिए समर्पित डिजिटल कतार प्रणाली।",
      quickLinks: "त्वरित लिंक",
      legal: "सार्वजनिक सेवा",
      copyright: "© 2026 किसान सारथी। किसानों के सम्मान और समय के लिए।",
    },
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_KEY) || "en";
  });

  const setLang = (newLang) => {
    const l = newLang === "hi" ? "hi" : "en";
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l;
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path, fallback = "") => {
    const parts = path.split(".");
    let current = translations[lang];
    for (const part of parts) {
      if (!current || current[part] === undefined) {
        // Fallback to english if hindi missing
        let enCurrent = translations.en;
        for (const ep of parts) {
          if (!enCurrent || enCurrent[ep] === undefined) return fallback;
          enCurrent = enCurrent[ep];
        }
        return enCurrent;
      }
      current = current[part];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isHindi: lang === "hi" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
