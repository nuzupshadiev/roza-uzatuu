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
  rsvp: {
    endpoint: string;
  };
  music: string;
}

export const invitation: InvitationData = {
  slug: "aruuke-kyz-uzatuu",
  type: "kyz_uzatuu",
  people: {
    bride: {
      name: {
        ru: "Арууке",
        ky: "Арууке",
      },
    },
  },
  event: {
    date: "2026-09-20",
    startTime: "17:00",
  },
  venue: {
    name: {
      ru: "«Алтын Уя»",
      ky: "«Алтын Уя»",
    },
    address: {
      ru: "г. Бишкек, пр. Чуй, 20",
      ky: "Бишкек шаары, Чүй проспекти, 20",
    },
    mapUrl: "https://maps.google.com/?q=Bishkek",
  },
  weddingDetails: {
    customMessage: {
      ru: "кызыбыздын узатуу тоюна арналган салтанаттуу ак дасторконубуздун кадырлуу коногу болууга чакырабыз!",
      ky: "кызыбыздын узатуу тоюна арналган салтанаттуу ак дасторконубуздун кадырлуу коногу болууга чакырабыз!",
    },
    hosts: {
      ru: "Нурлан - Гүлсүн",
      ky: "Нурлан - Гүлсүн",
    },
    dressCode: {
      ru: "Кечки майрамга жарашыктуу, өзүңүзгө ыңгайлуу кийим тандасаңыз болот. Катуу талаптар жок — эң башкысы, өзүңүздү жайлуу сезиңиз.",
      ky: "Кечки майрамга жарашыктуу, өзүңүзгө ыңгайлуу кийим тандасаңыз болот. Катуу талаптар жок — эң башкысы, өзүңүздү жайлуу сезиңиз.",
    },
  },
  /**
   * RSVP endpoint. Empty on purpose: the running invitation builds the endpoint
   * from `NEXT_PUBLIC_RSVP_API_URL` and only falls back to this value, which
   * Invitation Admin fills with the absolute central API URL when it generates
   * a customer invitation.
   */
  rsvp: {
    endpoint: "",
  },
  /**
   * Public path of the background track. No audio file ships with the template —
   * drop one at `public/assets/audio/music.m4a` (or let Invitation Admin install
   * a library track) and the music control appears on its own.
   */
  music: "/assets/audio/music.m4a",
};
