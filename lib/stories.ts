export interface StoryPage {
  text: string;
  scene: string;
  character: string;
  characterExtra?: string;
  bgGradient: string;
}

export interface Story {
  id: string;
  title: string;
  ageGroup: "1-2" | "5-6";
  emoji: string;
  description: string;
  pages: StoryPage[];
}

export const STORIES: Story[] = [
  // ── Ages 1-2 ──────────────────────────────────────────────────────────────
  {
    id: "saba_kova",
    title: "הכובע של סבא",
    ageGroup: "1-2",
    emoji: "🎩",
    description: "הכובע של סבא נעלם — ואיפה הוא?",
    pages: [
      {
        text: "לסבא גדעון יש כובע שחור,\nהוא אוהב אותו בוקר וצהור.\nבכל בוקר הוא שם על הראש,\nואומר: \"הכובע שלי — הכי יפה יש!\"",
        scene: "cottage",
        character: "👴",
        characterExtra: "🎩",
        bgGradient: "linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)",
      },
      {
        text: "יום אחד קם סבא בבוקר שקט,\nחיפש את הכובע — אין! נעלם! רק דממת.\n\"אוי ואבוי!\" הוא צעק חזק מאוד,\n\"מי לקח את הכובע? יבוא ויגיד מיד!\"",
        scene: "cottage",
        character: "😱",
        characterExtra: "❓",
        bgGradient: "linear-gradient(180deg, #FFF9C4 0%, #FFD54F 100%)",
      },
      {
        text: "רומי רצה, ארי קפץ,\nכולם חיפשו — אחד לא מצא.\nמתחת לכיסא? לא.\nמאחורי הדלת? לא.\nאולי מתחת לשולחן? גם לא!",
        scene: "cottage",
        character: "🧒",
        characterExtra: "🔍",
        bgGradient: "linear-gradient(180deg, #E1F5FE 0%, #B3E5FC 100%)",
      },
      {
        text: "הלכו לגינה לחפש שם,\nוראו את הכלב ישן על הדשא רם.\nעל הראש של הכלב — מה זה? אוי לאוי!\nהכובע השחור של סבא גדעון! הוי!",
        scene: "garden",
        character: "🐕",
        characterExtra: "🎩",
        bgGradient: "linear-gradient(180deg, #C8E6C9 0%, #A5D6A7 100%)",
      },
      {
        text: "\"חאם!\" אמר הכלב ברוח טובה,\n\"הכובע שלי! הוא מאוד נוח לשכיבה!\"\nכולם פרצו בצחוק גדול,\nוסבא לחש: \"כלב, אתה ממש שוטה, אבל כל כך חמוד!\"",
        scene: "garden",
        character: "😂",
        characterExtra: "🐕",
        bgGradient: "linear-gradient(180deg, #FFF9C4 0%, #FFCC02 100%)",
      },
      {
        text: "מאז, לסבא יש שני כובעים:\nאחד לראש ואחד לכלב — שניהם מאושרים!\nכשמגיעים ארי, רומי ודורי הם תמיד אומרים:\n\"סבא וכלבו — הכי טובים בעולם המקסים!\"",
        scene: "cottage",
        character: "👴",
        characterExtra: "🎩",
        bgGradient: "linear-gradient(180deg, #E8EAF6 0%, #C5CAE9 100%)",
      },
    ],
  },

  {
    id: "savta_ugot",
    title: "עוגות הסבתא",
    ageGroup: "1-2",
    emoji: "🍰",
    description: "סבתא אופה ואופה — ואין סוף לעוגות!",
    pages: [
      {
        text: "סבתא רוחמה אופה כל יום,\nהריח מהמטבח — מממ, מה טעים!\nשוקולד ווניל ותפוח וגבינה,\nהמטבח שלה — ממש כמו חנות יפינה.",
        scene: "kitchen",
        character: "👵",
        characterExtra: "🍰",
        bgGradient: "linear-gradient(180deg, #FFCCBC 0%, #FF8A65 100%)",
      },
      {
        text: "\"מה אופים היום?\" שאלו ארי, רומי ודורי,\n\"הפתעה!\" אמרה סבתא בעיניים צוחקות ועליזות.\nהם ניסו לנחש: \"עוגת תפוח? שוקולד?\"\n\"תחכו ותראו\" — ורק חייכה וחייכה.",
        scene: "kitchen",
        character: "🧒",
        characterExtra: "❓",
        bgGradient: "linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%)",
      },
      {
        text: "מן התנור יצאה עוגה ענקית,\nאורה של עוגה — כמו שמש גדולה ואמיתית!\nעליה כתוב בקרם: \"אני אוהבת אתכם!\"\nארי, רומי ודורי ידעו: זאת העוגה הכי טעימה בעולם!",
        scene: "kitchen",
        character: "🎂",
        characterExtra: "❤️",
        bgGradient: "linear-gradient(180deg, #FCE4EC 0%, #F48FB1 100%)",
      },
      {
        text: "ישבו סביב השולחן יחד,\nסבתא וילדים — כל אחד אחד.\nארי הגדול אכל שלוש פרוסות!\nרומי הקטנה — ארבע! (עם שפתיים ורדרדות.)",
        scene: "kitchen",
        character: "😋",
        characterExtra: "🍰",
        bgGradient: "linear-gradient(180deg, #F3E5F5 0%, #CE93D8 100%)",
      },
      {
        text: "\"סבתא, תלמדי אותנו!\" ביקשו שלושתם,\n\"אחד אחד תלמדו אתי — כולכם מוכנים?\"\nלשו קמח, שמנת וביצה,\nאיזה בלגן! — ואיזה שמחה!",
        scene: "kitchen",
        character: "👵",
        characterExtra: "🥄",
        bgGradient: "linear-gradient(180deg, #E8F5E9 0%, #A5D6A7 100%)",
      },
      {
        text: "מאז אופים ביחד בכל שישי בבוקר,\nסבתא, ארי, רומי ודורי — כל אחד תורם ותורם.\nהמטבח מלא צחוק וקמח ואהבה,\nוהעוגות? הכי טעימות ביקום — ובכל הגלקסיה!",
        scene: "kitchen",
        character: "❤️",
        characterExtra: "🍰",
        bgGradient: "linear-gradient(180deg, #FFF9C4 0%, #FFF176 100%)",
      },
    ],
  },

  // ── Ages 5-6 ──────────────────────────────────────────────────────────────
  {
    id: "saba_doktor",
    title: "סבא שהיה רופא",
    ageGroup: "5-6",
    emoji: "🩺",
    description: "סבא גדעון היה פעם רופא — ועכשיו הוא רופא לצעצועים!",
    pages: [
      {
        text: "סבא גדעון היה פעם רופא גדול,\nבבית החולים הכי טוב בעיר — קול.\nאבל עכשיו פרש ויושב בבית בשקט,\nועוזר לנכדים — זה עבודה הרבה יותר מלהקט.",
        scene: "cottage",
        character: "👴",
        characterExtra: "🩺",
        bgGradient: "linear-gradient(180deg, #E3F2FD 0%, #90CAF9 100%)",
      },
      {
        text: "יום אחד ארי הגיע עם פרצוף עצוב,\n\"סבא, הדוב שלי חולה — הוא לא מרגיש טוב!\"\nסבא לקח את הסטטוסקופ המיוחד,\nובדק את הדוב — לגמרי ברצינות וסדר.",
        scene: "cottage",
        character: "🧸",
        characterExtra: "🩺",
        bgGradient: "linear-gradient(180deg, #FFF8E1 0%, #FFECB3 100%)",
      },
      {
        text: "\"מה יש לו סבא?\" שאל ארי בדאגה.\n\"הדוב שלך סובל ממחסור חמור בחיבוקים — זו האבחנה!\"\n\"מה הטיפול?\" \"פשוט מאוד!\"\n\"עשרים חיבוקים ביום — ותוצאות תראה מיד!\"",
        scene: "cottage",
        character: "👴",
        characterExtra: "🧸",
        bgGradient: "linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)",
      },
      {
        text: "רומי הגיעה עם הבובה שלה, ואחריה דורי הקטן עם רכבת.\n\"גם לבובה שלי יש כאב ראש!\" \"גם לרכבת — היא לא נוסעת!\"\nסבא בדק את כולם בסדר — בובה, רכבת ואפילו דינוזאור,\nוקבע: \"כולם צריכים שיר לפני השינה — זה הטיפול הכי חשוב בעולם הזהיר!\"",
        scene: "cottage",
        character: "👵",
        characterExtra: "🩺",
        bgGradient: "linear-gradient(180deg, #F3E5F5 0%, #E1BEE7 100%)",
      },
      {
        text: "שמעה סבתא ובאה לראות מה קורה,\n\"גדעון, מה אתה עושה?\" שאלה בתמיהה.\n\"אני עובד!\" אמר סבא ברצינות מלאה,\n\"ומשכורתי? חיבוק אחד מארי, מרומי ומדורי — זאת השכר הכי גבוה בהיסטוריה!\"",
        scene: "cottage",
        character: "😄",
        characterExtra: "❤️",
        bgGradient: "linear-gradient(180deg, #FFF3E0 0%, #FFCC80 100%)",
      },
      {
        text: "מאז יש לסבא מרפאה מיוחדת בסלון,\nרק לצעצועים — עם שלט כחול ועם בלון.\nארי, רומי ודורי מגיעים בתור ומחכים,\nוסבא מרפא הכל — עם חיבוקים ועם שיר מרגיעים!",
        scene: "cottage",
        character: "🏥",
        characterExtra: "❤️",
        bgGradient: "linear-gradient(180deg, #E8EAF6 0%, #C5CAE9 100%)",
      },
      {
        text: "וכשארי שאל: \"סבא, מה הכי טוב בעבודה החדשה?\"\nסבא חייך ואמר: \"בבית החולים לא היה לי אף פעם כזאת שמחה.\nשם ריפאתי אנשים — חשוב וגדול!\nאבל כאן — אני מרפא לבבות — זה הכי חשוב בעולם!\"",
        scene: "cottage",
        character: "👴",
        characterExtra: "🌟",
        bgGradient: "linear-gradient(180deg, #FFFDE7 0%, #FFF9C4 100%)",
      },
    ],
  },

  {
    id: "savta_telefon",
    title: "סבתא והטלפון הפלא",
    ageGroup: "5-6",
    emoji: "📱",
    description: "סבתא קיבלה טלפון חדש — ועכשיו היא הבוסית!",
    pages: [
      {
        text: "סבתא רוחמה קיבלה טלפון,\nסמארטפון חדש, מבריק ואיך לא!\nארי לימד אותה: \"זה כפתור, זה מסך!\"\nסבתא אמרה: \"הבנתי — תן לי לנסות קצת מהר!\"",
        scene: "cottage",
        character: "👵",
        characterExtra: "📱",
        bgGradient: "linear-gradient(180deg, #E8EAF6 0%, #9FA8DA 100%)",
      },
      {
        text: "יום ראשון: סבתא שלחה הודעה לסבא שיושב לידה.\n\"סבא, תוריד גרביים מהמייבש\" — הוא ראה ולא האמין.\n\"רוחמה, אני כאן! לידך! בספה!\"\n\"יפה\" אמרה, \"קיבלת את ההודעה? אז לך כבר!\"",
        scene: "cottage",
        character: "😂",
        characterExtra: "📱",
        bgGradient: "linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%)",
      },
      {
        text: "יום שני: סבתא גילתה סלפי!\nצילמה את עצמה מאה פעם — איזה יופי!\nשלחה לארי, לרומי ולדורי: \"אני צילמת!\" עם שלוש קריאות,\nהם ענו: \"סבתא, את הכי יפה — ובכל הצילומים!\"",
        scene: "garden",
        character: "🤳",
        characterExtra: "💃",
        bgGradient: "linear-gradient(180deg, #FCE4EC 0%, #F48FB1 100%)",
      },
      {
        text: "יום שלישי: סבתא מצאה סרטוני בישול.\nצפתה בהם כל הלילה — בלי שינה ובלי גבול!\nבבוקר הכינה מנה צרפתית מפורסמת,\n\"קראתי הוראות!\" — ויצא... מרק עם פסטה. מצוינת!",
        scene: "kitchen",
        character: "👵",
        characterExtra: "🍝",
        bgGradient: "linear-gradient(180deg, #E8F5E9 0%, #A5D6A7 100%)",
      },
      {
        text: "יום רביעי: סבתא פתחה וואטסאפ קבוצה.\n\"משפחה שלי❤️\" — כולם הצטרפו בשמחה.\nהיא שלחה תמונות, מתכונים, בדיחות וחדשות,\nהטלפון של סבא צלצל מאה פעם — ז'יז'יז'י!",
        scene: "cottage",
        character: "📲",
        characterExtra: "❤️",
        bgGradient: "linear-gradient(180deg, #E1F5FE 0%, #81D4FA 100%)",
      },
      {
        text: "ביום חמישי סבא ביקש: \"רוחמה, תוריד הודעות, אני לא ישן!\"\nסבתא ענתה: \"סבא, זה נקרא להיות מחובר — שלמד!\"\nסבא לקח את הטלפון שלו,\nוכתב: \"לייק\" לכל תמונה — כי מה יש לעשות, זה ג'ינג'לה!",
        scene: "cottage",
        character: "👴",
        characterExtra: "😴",
        bgGradient: "linear-gradient(180deg, #F3E5F5 0%, #CE93D8 100%)",
      },
      {
        text: "עכשיו סבתא מומחית גדולה בטלפון,\nמלמדת את שכנותיה — עם סבלנות ועם חן.\nוכל ערב שישי, בשיחת וידאו יחד,\nארי, רומי, דורי והסבים — כולם בפריים אחד!",
        scene: "cottage",
        character: "🤩",
        characterExtra: "📱",
        bgGradient: "linear-gradient(180deg, #FFFDE7 0%, #FFF176 100%)",
      },
    ],
  },

  {
    id: "ari_hamahir",
    title: "ארי הילד הכי מהיר בעולם",
    ageGroup: "5-6",
    emoji: "🏃",
    description: "ארי חושב שהוא הכי מהיר — עד שהוא פוגש את סבא!",
    pages: [
      {
        text: "ארי רץ, ארי קפץ,\nארי טס כמו רקטה!\n\"אני הכי מהיר!\" הוא הכריז בכל יום,\n\"אף אחד לא יכול לתפוס אותי — לא היום, לא מחר, לא לעולם!\"",
        scene: "meadow",
        character: "🏃",
        characterExtra: "💨",
        bgGradient: "linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)",
      },
      {
        text: "הוא ניצח את רומי במרוץ.\nניצח את דורי — פעמיים!\nניצח את הכלב ברוכסן — הוא לא האמין!\nאבל אז הגיע סבא — ואז הכל השתנה.",
        scene: "meadow",
        character: "😏",
        characterExtra: "🏆",
        bgGradient: "linear-gradient(180deg, #DCEDC8 0%, #AED581 100%)",
      },
      {
        text: "\"סבא,\" אמר ארי, \"אתה רוצה לרוץ איתי?\"\nסבא הסיר את כובעו ואמר: \"בשמחה, בני!\"\nארי צחק — סבא ישן! סבא זקן! סבא אטי!\nאבל סבא כבר עמד בקו הזינוק — ואמר: \"מוכן כבר? יאללה!\"",
        scene: "meadow",
        character: "👴",
        characterExtra: "👟",
        bgGradient: "linear-gradient(180deg, #FFF9C4 0%, #FFD54F 100%)",
      },
      {
        text: "\"אחת — שתיים — שלוש!\" — והם יצאו לדרך!\nארי רץ כמו הרוח — מהר מהר ומהר!\nהביט אחורה — וראה את סבא — נשאר מאחור.\n\"ניצחתי!\" צעק ארי — ואז ראה משהו מפתיע ומוזר.",
        scene: "meadow",
        character: "🏃",
        characterExtra: "😮",
        bgGradient: "linear-gradient(180deg, #E1F5FE 0%, #81D4FA 100%)",
      },
      {
        text: "סבא הגיע לקו הסיום — בהליכה שקטה ורגועה.\n\"סבא! הפסדת!\" אמר ארי בחיוך גאה.\n\"נכון\" אמר סבא, \"אבל ראית? נהניתי כל הדרך!\nצפרים, פרחים, שמיים — ואת כל זה — ראית היום?\"",
        scene: "meadow",
        character: "👴",
        characterExtra: "🌸",
        bgGradient: "linear-gradient(180deg, #F3E5F5 0%, #E1BEE7 100%)",
      },
      {
        text: "ארי חשב. הוא רץ מהר מאוד — אבל לא ראה כלום.\nסבא הלך לאט — ועולם שלם נפתח לו.\n\"סבא,\" שאל, \"אתה מלמד אותי ללכת לאט?\"\n\"אני מלמד אותך לראות\" — ואז חייכו שניהם יחד בשמחה.",
        scene: "meadow",
        character: "👴",
        characterExtra: "🧒",
        bgGradient: "linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)",
      },
      {
        text: "מאז רצים יחד, סבא וארי, כל בוקר בגינה,\nפעם ארי לפני, פעם סבא — איזה שמחה!\nוכשארי שואל: \"מי ניצח?\"\nסבא עונה: \"שנינו — כי אנחנו יחד — וזה הניצחון הכי גדול!\"",
        scene: "garden",
        character: "❤️",
        characterExtra: "🌅",
        bgGradient: "linear-gradient(180deg, #FFFDE7 0%, #FFF176 100%)",
      },
    ],
  },

  {
    id: "dori_kvutza_yeruka",
    title: "דורי והחולצה הירוקה",
    ageGroup: "5-6",
    emoji: "⚽",
    description: "דורי אוהב כדורגל, אבל החולצה הירוקה נעלמה לפני המשחק הגדול!",
    pages: [
      {
        text: "לדורי יש חולצה ירוקה בוהקת,\nשל קבוצת הכדורגל — הכי טובה, הכי זוהרת!\nהוא לובש אותה בכל אימון ומשחק,\nואפילו בשינה — כי הוא הכי גדול אוהד!",
        scene: "meadow",
        character: "🏃",
        characterExtra: "⚽",
        bgGradient: "linear-gradient(180deg, #2E7D32 0%, #66BB6A 100%)",
      },
      {
        text: "יום אחד, לפני משחק גדול ומרגש,\nחיפש דורי את החולצה — ולא מצא אף נגש!\n\"ארי! ראית את החולצה?\" \"לא!\"\n\"רומי? סבא? סבתא?\" — גם הם אמרו לא!",
        scene: "cottage",
        character: "😱",
        characterExtra: "❓",
        bgGradient: "linear-gradient(180deg, #FFF9C4 0%, #FFD54F 100%)",
      },
      {
        text: "סבא גדעון חשב חשב ואמר בשקט:\n\"דורי'לה, בוא נחשוב — מאיפה היא חסרת?\"\n\"הייתה לי אתמול!\" \"ואיפה היית אתמול?\"\n\"באימון... ואחר כך... אוי! אני יודע! המגרש!\"",
        scene: "meadow",
        character: "👴",
        characterExtra: "🤔",
        bgGradient: "linear-gradient(180deg, #E8F5E9 0%, #A5D6A7 100%)",
      },
      {
        text: "רצו שניהם — סבא ודורי — למגרש הכדורגל,\nשם, מתחת לספסל, קמוט ובלגן מלא —\nהחולצה הירוקה! קצת מלוכלכת מהדשא,\n\"מצאתי!\" צעק דורי — ורץ לאמא!",
        scene: "meadow",
        character: "🎽",
        characterExtra: "✨",
        bgGradient: "linear-gradient(180deg, #C8E6C9 0%, #81C784 100%)",
      },
      {
        text: "\"אבל היא מלוכלכת!\" אמר דורי בדאגה,\n\"המשחק בעוד שעה — זאת בעיה גדולה!\"\nסבא לקח את החולצה ואמר: \"אל תדאג, בני!\"\n\"סבא, מה אתה עושה?\" — \"תראה ותלמד ממני!\"",
        scene: "cottage",
        character: "👴",
        characterExtra: "🎽",
        bgGradient: "linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%)",
      },
      {
        text: "סבא שטף מהר בכיור עם סבון וחום,\nניגב ופרס על הרדיאטור — לא הפסיד שום דבר!\n\"זה לא יתייבש!\" ישב דורי עם פרצוף עצוב.\n\"עשר דקות — ותראה!\" אמר סבא בביטחון.",
        scene: "kitchen",
        character: "🧼",
        characterExtra: "⏱️",
        bgGradient: "linear-gradient(180deg, #E1F5FE 0%, #81D4FA 100%)",
      },
      {
        text: "עשר דקות עברו — והחולצה... יבשה!\nירוקה ומבריקה — כמו חדשה לגמרי!\n\"סבא! אתה קוסם!\" \"לא, רק סבא שאוהב.\"\n\"כל בעיה פתירה — כשיש מישהו שתמיד עוזר!\"",
        scene: "cottage",
        character: "🎽",
        characterExtra: "⭐",
        bgGradient: "linear-gradient(180deg, #F3E5F5 0%, #CE93D8 100%)",
      },
      {
        text: "דורי לבש את החולצה, רץ למגרש מאושר,\nוהבקיע שלושה גולים — ממש כמו כוכב!\nואחרי המשחק אמר לסבא בחיוך גדול:\n\"סבא, החולצה הביאה מזל — אבל אתה — הבאת את הגול!\"",
        scene: "meadow",
        character: "⚽",
        characterExtra: "🏆",
        bgGradient: "linear-gradient(180deg, #FFF9C4 0%, #FFCC02 100%)",
      },
    ],
  },
];

export function getStoryById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

export function getStoriesByAge(ageGroup: Story["ageGroup"]): Story[] {
  return STORIES.filter((s) => s.ageGroup === ageGroup);
}
