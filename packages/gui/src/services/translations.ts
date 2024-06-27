import translate, { Options, Translate } from 'translate.js';
import { plural_EN } from 'translate.js/pluralize';
import { situationCrimePreventionClassificationTable, situationCrimePreventionClassificationTableNL } from './abstract';

export type Languages = 'nl' | 'en';

export const messages = {
  HOME: { TITLE: 'Home', ROUTE: '/home' },
  ABOUT: { TITLE: 'About the app', ROUTE: '/about', TEXT: situationCrimePreventionClassificationTable },
  SETTINGS: { TITLE: 'Settings', ROUTE: '/settings' },
  LANDING: { TITLE: 'Introduction', ROUTE: '/' },
  USER: 'User',
  EDITOR: 'Editor',
  ADMIN: 'Administrator',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  YES: 'Yes',
  NO: 'No',
  OK: 'Ok',
  NAME: 'Name',
  DESCRIPTION: 'Description',
  DELETE_ITEM: {
    TITLE: 'Delete {item}',
    DESCRIPTION: 'Are you certain you want to delete this {item}. There is no turning back?',
  },
  SAVE_BUTTON: {
    LABEL: 'Save',
    TOOLTIP: 'Save unsaved changes',
  },
  /** Crime Prevention Techniques */
  INCREASE_EFFORT: 'Increase the effort',
  TARGET_HARDEN: {
    TITLE: 'Target harden',
    DESC: 'Steering column locks and ignition immobilizers, Anti-robbery screens, Tamper-proof packaging',
  },
  CONTROL_ACCESS: {
    TITLE: 'Control access to facilities',
    DESC: 'Entry phones, Electronic card access, Baggage screening',
  },
  SCREEN_EXITS: {
    TITLE: 'Screen exits',
    DESC: 'Ticket needed for exit, Export documents, Electronic merchandise tags',
  },
  DEFLECT_OFFENDERS: {
    TITLE: 'Deflect offenders',
    DESC: 'Street closures, Separate bathrooms for women, Disperse pubs',
  },
  CONTROL_TOOLS: {
    TITLE: 'Control tools/weapons',
    DESC: '"Smart" guns, Restrict spray paint sales to juveniles, Toughened beer glasses',
  },
  INCREASE_RISKS: 'Increase the risks',
  EXTEND_GUARDIANSHIP: {
    TITLE: 'Extend guardianship',
    DESC: 'Go out in group at night, Leave signs of occupancy, Carry cell phone',
  },
  ASSIST_SURVEILLANCE: {
    TITLE: 'Assist natural surveillance',
    DESC: 'Improved street lighting, Defensible space design, Support whistleblowers',
  },
  REDUCE_ANONYMITY: {
    TITLE: 'Reduce anonymity',
    DESC: 'Taxi driver IDs, "How\'s my driving?" decals, School uniforms',
  },
  USE_PLACE_MANAGERS: {
    TITLE: 'Use place managers',
    DESC: 'CCTV for double-deck buses, Two clerks for convenience stores, Reward vigilance',
  },
  STRENGTHEN_SURVEILLANCE: {
    TITLE: 'Strengthen formal surveillance',
    DESC: 'Red light cameras, Burglar alarms, Security guards',
  },
  REDUCE_REWARDS: 'Reduce the rewards',
  CONCEAL_TARGETS: {
    TITLE: 'Conceal targets',
    DESC: 'Off-street parking, Gender-neutral phone directories, Unmarked armored trucks',
  },
  REMOVE_TARGETS: {
    TITLE: 'Remove targets',
    DESC: "Removable car radio, Women's shelters, Pre-paid cards for pay phones",
  },
  IDENTIFY_PROPERTY: {
    TITLE: 'Identify property',
    DESC: 'Property marking, Vehicle licensing and parts marking, Cattle branding',
  },
  DISRUPT_MARKETS: {
    TITLE: 'Disrupt markets',
    DESC: 'Monitor pawn shops, Controls on classified ads, License street vendors',
  },
  DENY_BENEFITS: {
    TITLE: 'Deny benefits',
    DESC: 'Ink merchandise tags, Graffiti cleaning, Disabling stolen cell phones',
  },
  REDUCE_PROVOCATIONS: 'Reduce provocations',
  REDUCE_FRUSTRATIONS: {
    TITLE: 'Reduce frustrations and stress',
    DESC: 'Efficient lines, Polite service, Expanded seating, Soothing music/muted lights',
  },
  AVOID_DISPUTES: {
    TITLE: 'Avoid disputes',
    DESC: 'Separate seating for rival soccer fans, Reduce crowding in bars, Fixed cab fares',
  },
  REDUCE_TEMPTATION: {
    TITLE: 'Reduce temptation and arousal',
    DESC: 'Controls on violent pornography, Enforce good behavior on soccer field, Prohibit racial slurs',
  },
  NEUTRALIZE_PRESSURE: {
    TITLE: 'Neutralize peer pressure',
    DESC: '"Idiots drink and drive", "It\'s OK to say No", Disperse troublemakers at school',
  },
  DISCOURAGE_IMITATION: {
    TITLE: 'Discourage imitation',
    DESC: 'Rapid repair of vandalism, V-chips in TVs, Censor details of modus operandi',
  },
  REMOVE_EXCUSES: 'Remove excuses',
  SET_RULES: {
    TITLE: 'Set rules',
    DESC: 'Rental agreements, Harassment codes, Hotel registration',
  },
  POST_INSTRUCTIONS: {
    TITLE: 'Post instructions',
    DESC: '"No parking", "Private property", "Extinguish camp fires"',
  },
  ALERT_CONSCIENCE: {
    TITLE: 'Alert conscience',
    DESC: 'Roadside speed display boards, Signatures for customs declarations, "Shoplifting is stealing"',
  },
  ASSIST_COMPLIANCE: {
    TITLE: 'Assist compliance',
    DESC: 'Easy library checkout, Public lavatories, Litter receptacles',
  },
  CONTROL_DRUGS: {
    TITLE: 'Control drugs and alcohol',
    DESC: 'Breathalyzers in bars, Server intervention programs, Alcohol-free events',
  },
};

export const messagesNL: typeof messages = {
  HOME: { TITLE: 'Home', ROUTE: '/home' },
  ABOUT: { TITLE: 'Over de app', ROUTE: '/over', TEXT: situationCrimePreventionClassificationTableNL },
  SETTINGS: { TITLE: 'Instellingen', ROUTE: '/instellingen' },
  LANDING: { TITLE: 'Introductie', ROUTE: '/' },
  USER: 'Gebruiker',
  EDITOR: 'Redacteur',
  ADMIN: 'Beheerder',
  CANCEL: 'Annuleren',
  DELETE: 'Verwijderen',
  YES: 'Ja',
  NO: 'Nee',
  OK: 'Ok',
  NAME: 'Naam',
  DESCRIPTION: 'Beschrijving',
  DELETE_ITEM: {
    TITLE: '{item} verwijderen',
    DESCRIPTION: 'Weet je zeker dat je dit {item} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
  },
  SAVE_BUTTON: {
    LABEL: 'Opslaan',
    TOOLTIP: 'Wijzigingen opslaan',
  },
  /** Crime Prevention Techniques */
  INCREASE_EFFORT: 'Verhoog de inspanning',
  TARGET_HARDEN: {
    TITLE: 'Doelversteviging',
    DESC: 'Stuursloten en startonderbrekers, Anti-overval schermen, Manipulatiebestendige verpakking',
  },
  CONTROL_ACCESS: {
    TITLE: 'Controleer toegang tot faciliteiten',
    DESC: 'Deurtelefoons, Elektronische kaart toegang, Bagagecontrole',
  },
  SCREEN_EXITS: {
    TITLE: 'Controleer uitgangen',
    DESC: 'Ticket nodig voor vertrek, Exportdocumenten, Elektronische artikelbeveiliging',
  },
  DEFLECT_OFFENDERS: {
    TITLE: 'Leid overtreders af',
    DESC: 'Straatafsluitingen, Aparte toiletten voor vrouwen, Verspreid pubs',
  },
  CONTROL_TOOLS: {
    TITLE: 'Beheers gereedschappen/wapens',
    DESC: '"Slimme" wapens, Beperk verkoop spuitverf aan jongeren, Geharde bierglazen',
  },
  INCREASE_RISKS: "Verhoog de risico's",
  EXTEND_GUARDIANSHIP: {
    TITLE: 'Breid toezicht uit',
    DESC: "Ga 's nachts in groep uit, Laat tekenen van bewoning achter, Draag een mobiele telefoon",
  },
  ASSIST_SURVEILLANCE: {
    TITLE: 'Ondersteun natuurlijk toezicht',
    DESC: 'Verbeterde straatverlichting, Verdedigbaar ruimteontwerp, Ondersteuning van klokkenluiders',
  },
  REDUCE_ANONYMITY: {
    TITLE: 'Verminder anonimiteit',
    DESC: 'Taxichauffeur ID\'s, "Hoe is mijn rijgedrag?" stickers, Schooluniformen',
  },
  USE_PLACE_MANAGERS: {
    TITLE: 'Gebruik plaatsmanagers',
    DESC: 'CCTV voor dubbeldekkers, Twee bedienden voor gemakswinkels, Beloon waakzaamheid',
  },
  STRENGTHEN_SURVEILLANCE: {
    TITLE: 'Versterk formeel toezicht',
    DESC: "Roodlichtcamera's, Inbraakalarm, Beveiligingspersoneel",
  },
  REDUCE_REWARDS: 'Verminder de beloningen',
  CONCEAL_TARGETS: {
    TITLE: 'Verberg doelen',
    DESC: 'Parkeren buiten de straat, Genderneutrale telefoongidsen, Ongemarkeerde gepantserde vrachtwagens',
  },
  REMOVE_TARGETS: {
    TITLE: 'Verwijder doelen',
    DESC: 'Verwijderbare autoradio, Vrouwenopvang, Prepaidkaarten voor openbare telefoons',
  },
  IDENTIFY_PROPERTY: {
    TITLE: 'Identificeer eigendom',
    DESC: 'Eigendomsmarkering, Voertuigregistratie en onderdelenmarkering, Veemerken',
  },
  DISRUPT_MARKETS: {
    TITLE: 'Verstoor markten',
    DESC: 'Monitor pandjeshuis, Controles op rubrieksadvertenties, Vergunning voor straatverkopers',
  },
  DENY_BENEFITS: {
    TITLE: 'Ontzeg voordelen',
    DESC: 'Inktlabels op artikelen, Graffiti reiniging, Uitschakelen gestolen mobiele telefoons',
  },
  REDUCE_PROVOCATIONS: 'Verminder provocaties',
  REDUCE_FRUSTRATIONS: {
    TITLE: 'Verminder frustraties en stress',
    DESC: 'Efficiënte rijen, Beleefde service, Uitgebreide zitplaatsen, Rustgevende muziek/gedempte verlichting',
  },
  AVOID_DISPUTES: {
    TITLE: 'Vermijd geschillen',
    DESC: 'Gescheiden zitplaatsen voor rivaliserende voetbalfans, Verminder drukte in bars, Vaste taxitarieven',
  },
  REDUCE_TEMPTATION: {
    TITLE: 'Verminder verleiding en opwinding',
    DESC: 'Controles op gewelddadige pornografie, Handhaaf goed gedrag op voetbalveld, Verbied racistische opmerkingen',
  },
  NEUTRALIZE_PRESSURE: {
    TITLE: 'Neutraliseer groepsdruk',
    DESC: '"Idioten drinken en rijden", "Het is OK om Nee te zeggen", Verspreid onruststokers op school',
  },
  DISCOURAGE_IMITATION: {
    TITLE: 'Ontmoedig imitatie',
    DESC: "Snelle reparatie van vandalisme, V-chips in TV's, Censureer details van modus operandi",
  },
  REMOVE_EXCUSES: 'Verwijder excuses',
  SET_RULES: {
    TITLE: 'Stel regels op',
    DESC: 'Huurovereenkomsten, Intimidatiecodes, Hotelregistratie',
  },
  POST_INSTRUCTIONS: {
    TITLE: 'Plaats instructies',
    DESC: '"Parkeren verboden", "Privé-eigendom", "Doof kampvuren"',
  },
  ALERT_CONSCIENCE: {
    TITLE: 'Activeer geweten',
    DESC: 'Snelheidsweergaveborden langs de weg, Handtekeningen voor douaneaangiften, "Winkeldiefstal is stelen"',
  },
  ASSIST_COMPLIANCE: {
    TITLE: 'Help bij naleving',
    DESC: 'Eenvoudige bibliotheekuitleen, Openbare toiletten, Afvalbakken',
  },
  CONTROL_DRUGS: {
    TITLE: 'Beheers drugs en alcohol',
    DESC: "Ademanalysers in bars, Interventie programma's voor barpersoneel, Alcoholvrije evenementen",
  },
};

const setGuiLanguage = (language: Languages) => {
  const options = {
    // These are the defaults:
    debug: true, //[Boolean]: Logs missing translations to console and add "@@" around output, if `true`.
    array: true, //[Boolean]: Returns translations with placeholder-replacements as Arrays, if `true`.
    resolveAliases: true, //[Boolean]: Parses all translations for aliases and replaces them, if `true`.
    pluralize: plural_EN, //[Function(count)]: Provides a custom pluralization mapping function, should return a string (or number)
    useKeyForMissingTranslation: true, //[Boolean]: If there is no translation found for given key, the key is used as translation, when set to false, it returns undefiend in this case
  };
  return translate(language === 'nl' ? messagesNL : messages, options) as Translate<typeof messages, Options>;
};

export type TextDirection = 'rtl' | 'ltr';

export type Locale = {
  /** Friendly name */
  name: string;
  /** Fully qualified name, e.g. 'en-UK' */
  fqn: string;
  /** Text direction: Left to right or right to left */
  dir?: TextDirection;
  /** Is the default language */
  default?: boolean;
};

export type Locales = Record<Languages, Locale>;

export type Listener = (locale: string, dir: TextDirection) => void;

const onChangeLocale: Listener[] = [];

export const i18n = {
  defaultLocale: 'en' as Languages,
  currentLocale: 'en' as Languages,
  locales: {} as Locales,
  init,
  addOnChangeListener,
  loadAndSetLocale,
  // i18n: {} as I18n,
  // } as {
  //   defaultLocale: Languages;
  //   currentLocale: Languages;
  //   locales: Locales;
  //   t: Translate<typeof messages, Options>;
};

export let t: Translate<typeof messages, Options>;

async function init(locales: Locales, selectedLocale: Languages) {
  i18n.locales = locales;
  const defaultLocale = (Object.keys(locales) as Languages[]).filter((l) => (locales[l] as Locale).default).shift();
  if (defaultLocale) {
    i18n.defaultLocale = defaultLocale || selectedLocale;
  }
  document.documentElement.setAttribute('lang', selectedLocale);
  await loadAndSetLocale(selectedLocale);
}

function addOnChangeListener(listener: Listener) {
  onChangeLocale.push(listener);
}

async function loadAndSetLocale(newLocale: Languages) {
  if (i18n.currentLocale === newLocale) {
    return;
  }

  const resolvedLocale = supported(newLocale) ? newLocale : i18n.defaultLocale;
  i18n.currentLocale = resolvedLocale;
  t = setGuiLanguage(newLocale);
  // i18n.i18n = {
  //   editRepeat: t('i18n', 'editRepeat'),
  //   createRepeat: t('i18n', 'createRepeat'),
  //   deleteItem: t('i18n', 'deleteItem'),
  //   agree: t('i18n', 'agree'),
  //   disagree: t('i18n', 'disagree'),
  //   pickOne: t('i18n', 'pickOne'),
  //   pickOneOrMore: t('i18n', 'pickOneOrMore'),
  //   cancel: t('i18n', 'cancel'),
  //   save: t('i18n', 'save'),
  // } as I18n;
  onChangeLocale.forEach((listener) => listener(i18n.currentLocale, dir()));
}

function supported(locale: Languages) {
  return Object.keys(i18n.locales).indexOf(locale) >= 0;
}

function dir(locale = i18n.currentLocale) {
  return (i18n.locales[locale] as Locale).dir || 'ltr';
}
