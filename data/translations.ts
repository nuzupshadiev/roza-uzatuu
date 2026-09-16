/**
 * Interface copy.
 *
 * This edition of the template is Kyrgyz-only by request, so there is no
 * language switcher and `LANGUAGE` is fixed to `"ky"`. It is still the single
 * place every visible label comes from: swapping it for a `Record<Language, …>`
 * map is enough to bring a second language back.
 *
 * Customer-owned wording (names, venue, message, hosts, dress code) is not here
 * — that lives in `data/invitation.ts`.
 */
export const LANGUAGE = "ky" as const;

export type Language = typeof LANGUAGE;

export const translations = {
  /** <html lang> and the locale used for date formatting. */
  locale: "ky-KG",

  intro: {
    label: "Чакыруу жүктөлүүдө",
  },

  hero: {
    kind: "кыз узатуу",
    scrollHint: "жогору жылжытыңыз",
  },

  message: {
    greeting: "Урматтуу коноктор!",
    lead: "Сиздерди сүйүктүү",
    /** Signs the invitation off, immediately above the hosts' names. */
    hostsLabel: "Урматтоо менен,",
  },

  date: {
    label: "күнү",
    /** Rendered as `саат 17:00`. */
    timePrefix: "саат",
    weekdays: ["дш", "шш", "шр", "бш", "жм", "иш", "жк"],
    months: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    calendarLabel: "Той күнү календарда белгиленген",
  },

  countdown: {
    heading: "Той салтанатына чейин:",
    units: {
      days: "күн",
      hours: "саат",
      minutes: "мүнөт",
      seconds: "секунд",
    },
    started: "Той башталды!",
  },

  venue: {
    heading: "Дарегибиз:",
    mapButton: "картадан көрүү",
    mapCardLabel: "Тойдун өтүүчү жери картада",
  },

  dressCode: {
    heading: "Дресс-код:",
    lookbookButton: "кийим үлгүлөрүн көрүү",
  },

  rsvp: {
    heading: "тойго келериңизди билдирип коюшуңузду өтүнөбүз",
    nameLabel: "аты-жөнү",
    namePlaceholder: "аты-жөнү",
    attendanceLegend:
      "Жубайыңыз менен келсеңиз, экөөңүздүн аты-жөнүңүздөрдү кошо жазып коюңуз",
    options: {
      alone: "Келем",
      couple: "Жубайым менен келем",
      declined: "Келе албайм",
    },
    guestCountLabel: "Коноктордун саны",
    guestCountDecrease: "Конокторду азайтуу",
    guestCountIncrease: "Конокторду көбөйтүү",
    submit: "Жоопту жөнөтүү",
    submitting: "Жөнөтүлүүдө…",
    retry: "Кайра жөнөтүү",
    success: "Жообуңуз үчүн рахмат!",
    errors: {
      name: "Аты-жөнүңүздү жазыңыз",
      attendance: "Жообуңузду тандаңыз",
      guestCount: "Конокторуңуздун саны 1 менен 20дун ортосунда болушу керек",
      network: "Байланыш үзүлдү. Кайра аракет кылып көрүңүз.",
      server: "Ката кетти. Кайра аракет кылып көрүңүз.",
      config: "RSVP кызматы тууралана элек.",
    },
    statusLabel: "Жооптун абалы",
  },

  footer: {
    message: "Сиздерди чыдамсыздык менен күтөбүз!",
  },

  music: {
    play: "Музыканы коюу",
    pause: "Музыканы токтотуу",
  },

  alt: {
    hero: "Улуттук оюмдар менен кооздолгон боз үйдүн ичи",
    ornament: "",
    footerWash: "",
  },
} as const;
