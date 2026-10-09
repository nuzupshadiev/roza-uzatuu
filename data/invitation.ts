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
  slug: "roza-kyz-uzatuu",
  type: "kyz_uzatuu",
  people: {
    bride: {
      name: {
        ru: "Роза",
        ky: "Роза",
      },
    },
  },
  event: {
    date: "2026-11-13",
    startTime: "16:00",
  },
  venue: {
    name: {
      ru: "«Aksaray Grand Hall»",
      ky: "«Aksaray Grand Hall»",
    },
    address: {
      ru: "Улица Анкара, 114",
      ky: "Анкара көчөсү, 114",
    },
    mapUrl: "https://2gis.kg/bishkek/firm/70000001033906214",
  },
  weddingDetails: {
    customMessage: {
      ru: "Приглашаем вас стать почётными гостями нашего торжества, посвящённого проводам нашей любимой дочери {{bride}}!",
      ky: "Сиздерди сүйүктүү {{bride}} кызыбыздын узатуу тоюна арналган салтанаттуу ак дасторконубуздун кадырлуу коногу болууга чакырабыз!",
    },
    hosts: {
      ru: "Мирбек - Гүлайым",
      ky: "Мирбек - Гүлайым",
    },
  },
  /**
   * Public path of the background track. No audio file ships with the template —
   * drop one at `public/assets/audio/music.m4a` (or let Invitation Admin install
   * a library track) and the music control appears on its own.
   */
  music: "/assets/audio/music.m4a",
};
