/**
 * Canonical invitation payload.
 *
 * Invitation Admin rewrites this object when it generates a customer
 * invitation, so it must stay a plain exported object literal named
 * `invitation`. Only customer-owned values live here — design copy, labels,
 * decorations and schedules belong in `data/template-content.ts`.
 *
 * The template renders Kyrgyz only, but every localized value keeps the `ru`
 * and `ky` keys the admin contract requires; components read `.ky`.
 */
export interface LocalizedText {
  ru: string;
  ky: string;
}

export interface InvitationData {
  slug: string;
  type: "kyz_uzatuu";
  people: {
    bride: {
      name: LocalizedText;
    };
  };
  event: {
    date: string;
    startTime: string;
  };
  venue: {
    name: LocalizedText;
    address: LocalizedText;
    mapUrl: string;
  };
  weddingDetails: {
    customMessage: LocalizedText;
    hosts: LocalizedText;
    dressCode?: LocalizedText;
  };
  music: string;
}

export const invitation: InvitationData = {
  slug: "saikal-kyz-uzatuu",
  type: "kyz_uzatuu",
  people: {
    bride: {
      name: {
        ru: "Сайкал",
        ky: "Сайкал",
      },
    },
  },
  event: {
    date: "2026-10-22",
    startTime: "16:00",
  },
  venue: {
    name: {
      ru: "«Ата»",
      ky: "«Ата»",
    },
    address: {
      ru: "г. Бишкек, ул. Мадиева, 22Б",
      ky: "Бишкек шаары, Мадиев көчөсү, 22Б",
    },
    mapUrl: "https://2gis.kg/bishkek/firm/70000001087638363",
  },
  weddingDetails: {
    customMessage: {
      ru: "Приглашаем вас стать почётными гостями нашего торжества, посвящённого проводам нашей любимой дочери {{bride}}!",
      ky: "Сиздерди сүйүктүү {{bride}} кызыбыздын узатуу тоюна арналган салтанаттуу ак дасторконубуздун кадырлуу коногу болууга чакырабыз!",
    },
    hosts: {
      ru: "Нурлан - Гулбарчын",
      ky: "Нурлан - Гулбарчын",
    },
  },
  /**
   * Public path of the background track. The music control only appears while
   * the file really loads, so removing it simply hides the button.
   */
  music: "/assets/audio/music.m4a",
};
