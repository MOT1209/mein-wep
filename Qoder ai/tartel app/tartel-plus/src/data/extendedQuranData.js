const extendedQuranData = {
  surahs: [
    {
      id: 1,
      name: "الفاتحة",
      transliteration: "Al-Fatihah",
      translation: "The Opening",
      ayahCount: 7,
      revelationType: "Meccan",
      juz: 1
    },
    {
      id: 2,
      name: "البقرة",
      transliteration: "Al-Baqarah",
      translation: "The Cow",
      ayahCount: 286,
      revelationType: "Medinan",
      juz: 1
    },
    {
      id: 3,
      name: "آل عمران",
      transliteration: "Ali 'Imran",
      translation: "Family of Imran",
      ayahCount: 200,
      revelationType: "Medinan",
      juz: 3
    },
    {
      id: 4,
      name: "النساء",
      transliteration: "An-Nisa",
      translation: "The Women",
      ayahCount: 176,
      revelationType: "Medinan",
      juz: 4
    },
    {
      id: 5,
      name: "المائدة",
      transliteration: "Al-Ma'idah",
      translation: "The Table Spread",
      ayahCount: 120,
      revelationType: "Medinan",
      juz: 6
    },
    {
      id: 12,
      name: "يوسف",
      transliteration: "Yusuf",
      translation: "Joseph",
      ayahCount: 111,
      revelationType: "Meccan",
      juz: 12
    },
    {
      id: 18,
      name: "الكهف",
      transliteration: "Al-Kahf",
      translation: "The Cave",
      ayahCount: 110,
      revelationType: "Meccan",
      juz: 15
    },
    {
      id: 36,
      name: "يس",
      transliteration: "Ya-Sin",
      translation: "Ya Sin",
      ayahCount: 83,
      revelationType: "Meccan",
      juz: 22
    },
    {
      id: 55,
      name: "الرحمن",
      transliteration: "Ar-Rahman",
      translation: "The Beneficent",
      ayahCount: 78,
      revelationType: "Medinan",
      juz: 27
    },
    {
      id: 67,
      name: "الملك",
      transliteration: "Al-Mulk",
      translation: "The Kingdom",
      ayahCount: 30,
      revelationType: "Meccan",
      juz: 29
    }
  ],
  verses: {
    // Surah Al-Fatihah
    "1:1": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "1:2": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "1:3": "الرَّحْمَٰنِ الرَّحِيمِ",
    "1:4": "مَالِكِ يَوْمِ الدِّينِ",
    "1:5": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    "1:6": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    "1:7": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    
    // Additional verses for demonstration
    "2:1": "الم",
    "2:2": "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    "12:1": "الر تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ",
    "18:1": "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا",
    "36:1": "يس",
    "55:1": "الرَّحْمَٰنُ",
    "67:1": "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
  },
  tajweedRules: {
    "ghunnah": {
      letters: ["ن", "م"],
      description: "Ghunnah (Nasal sound)",
      color: "#FF5722"
    },
    "ikhfa": {
      letters: ["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"],
      description: "Ikhfa (Concealment)",
      color: "#4CAF50"
    },
    "idgham": {
      letters: ["ي", "و", "ن", "م"],
      description: "Idgham (Merging)",
      color: "#2196F3"
    },
    "qalqalah": {
      letters: ["ق", "ط", "ب", "ج", "د"],
      description: "Qalqalah (Echo/Echoing)",
      color: "#9C27B0"
    }
  }
};

export default extendedQuranData;