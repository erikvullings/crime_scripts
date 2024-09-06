import { ICONS } from './icons';

export type DataModel = {
  version: number;
  lastUpdate: number;
  crimeScripts: CrimeScript[];
  cast: Cast[];
  attributes: CrimeScriptAttributes[];
  locations: CrimeLocation[];
  acts: Act[];
};

export const defaultModel = {
  version: 1,
  lastUpdate: new Date().valueOf(),
  crimeScripts: [],
  cast: [],
  attributes: [],
  locations: [],
  acts: [],
} as DataModel;

export enum CATEGORY {
  HARDWARE = 1,
  BIO_ENHANCEMENT,
  PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION,
  TRAINING,
  SELF_REGULATION,
  NUTRITION,
  OTHER,
}

export enum STATUS {
  FIRST_DRAFT = 1,
  READY_FOR_REVIEW,
  UNDER_REVIEW,
  REVIEWED,
  FINISHED,
}

export enum CHOICE {
  NONE = 1,
  UNKNOWN,
  YES,
}

export enum YES_NO {
  //CAN BE USED AS A BOOSTER
  YES = 1,
  NO,
}

export enum LITERATURE_TYPE {
  CASE_STUDY = 1,
  THESIS,
  REPORT,
  TECHNICAL_REPORT,
  PRODUCER_WEBSITE,
  WHITE_PAPER,
  CONFERENCE_PROCEEDING,
  PATENT,
  POPULAR_MEDIA,
  CONSENSUS_STATEMENT,
  EMPERICAL_PR,
  REVIEW_PR,
  SYSTEMATIC_REVIEW_PR,
  META_ANALYSIS_PR,
}

export type SearchResult = {
  crimeScriptIdx: number;
  actIdx: number;
  phaseIdx: number;
  activityIdx: number;
  conditionIdx: number;
  resultMd: string;
  type: 'crimeScript' | 'act' | 'activity' | 'condition' | 'cast' | 'attribute' | 'location';
};

export type ID = string;

export type Labeled = {
  id: ID;
  label: string;
  description?: string;
  /** Data image, base64 encoded */
  url?: string;
  /** Icon */
  icon?: ICONS;
};

export type Literature = Labeled & {
  authors?: string;
  type?: LITERATURE_TYPE;
};

export type CrimeScript = Labeled & {
  owner: ID;
  /** Epoch time when last updated */
  updated: number;
  reviewer: ID[];
  status: STATUS;
  /** Specific application */
  category: CATEGORY;
  /** Literature referred to in this article */
  literature: Literature[];
  /** Stages in the crime script */
  stages: Stage[];
};

export type Measure = Labeled & {
  /** Category the measure belongs to, e.g. situational crime prevention or other */
  cat: string;
};

export enum ATTRIBUTE_TYPE {
  /**
   * A set of tools, machinery, or apparatus used for a specific purpose.
   * Examples: Computers, laboratory equipment, gym machines.
   */
  EQUIPMENT = 1,
  /**
   * Handheld devices or instruments used to perform specific tasks.
   * Examples: Hammer, screwdriver, pliers.
   */
  TOOLS,
  /**
   * Wearable items or personal apparatus designed for specific functions, protection, or performance enhancement.
   * Examples: Diving suit, overalls, helmet, safety harness, sports gear.
   */
  GEAR,
  /**
   * Electronic items designed for communication, computing, and multimedia purposes.
   * Examples: Smartphones, tablets, laptops, smartwatches.
   */
  DEVICES,
  /** Supplementary items that add functionality or compliance to a primary item or system (e.g., license plates, phone cases). */
  ACCESSORIES,
  /** Official documents and records used for legal, financial, and administrative purposes (e.g., accounting books, contracts, manuals) */
  DOCUMENTATION,
  CYBER,
  OTHER,
}

export const attributeTypeToIconMap = new Map<ATTRIBUTE_TYPE, string>([
  [ATTRIBUTE_TYPE.EQUIPMENT, 'build'],
  [ATTRIBUTE_TYPE.TOOLS, 'construction'],
  [ATTRIBUTE_TYPE.GEAR, 'settings'],
  [ATTRIBUTE_TYPE.DEVICES, 'devices'],
  [ATTRIBUTE_TYPE.ACCESSORIES, 'style'],
  [ATTRIBUTE_TYPE.DOCUMENTATION, 'description'],
  [ATTRIBUTE_TYPE.CYBER, 'security'],
  [ATTRIBUTE_TYPE.OTHER, 'more_horiz'],
]);

export const AttributeTypeOptions = [
  {
    id: ATTRIBUTE_TYPE.EQUIPMENT,
    label: 'Equipment',
    description: 'A set of tools, machinery, or apparatus used for a specific purpose.',
  },
  {
    id: ATTRIBUTE_TYPE.TOOLS,
    label: 'Tools',
    description: 'Handheld devices or instruments used to perform specific tasks.',
  },
  {
    id: ATTRIBUTE_TYPE.GEAR,
    label: 'Gear',
    description:
      'Wearable items or personal apparatus designed for specific functions, protection, or performance enhancement.',
  },
  {
    id: ATTRIBUTE_TYPE.DEVICES,
    label: 'Devices/electronics',
    description: 'Electronic items designed for communication, computing, and multimedia purposes.',
  },
  {
    id: ATTRIBUTE_TYPE.ACCESSORIES,
    label: 'Accessories',
    description:
      'Supplementary items that add functionality or compliance to a primary item or system (e.g., license plates, phone cases).',
  },
  {
    id: ATTRIBUTE_TYPE.DOCUMENTATION,
    label: 'Documentation',
    description:
      'Official documents and records used for legal, financial, and administrative purposes (e.g., accounting books, contracts, manuals)',
  },
  { id: ATTRIBUTE_TYPE.CYBER, label: 'Cyber/digital', description: 'URLs, websites, digital information' },
  { id: ATTRIBUTE_TYPE.OTHER, label: 'Other' },
];

export type CrimeLocation = Labeled;

export type CrimeScriptAttributes = Labeled & {
  type: ATTRIBUTE_TYPE;
};

/**
 * A crime script consists of different stages, where a stage is a distinct segment
 * in a sequence where various activities (acts) occur, and it also suggests the
 * possibility of different approaches or methods being used to achieve similar
 * outcomes within that segment.
 */
export type Stage = {
  /** Currently selected Act ID */
  id: ID;
  /** Act IDs of all variants */
  ids: ID[];
};

export type Act = Labeled & {
  preparation: ActivityPhase;
  preactivity: ActivityPhase;
  activity: ActivityPhase;
  postactivity: ActivityPhase;
  /** Measures to prevent or stop crime */
  measures: Measure[];
};

export type ActivityPhase = {
  label: string;
  locationId?: ID;
  activities: Activity[];
  // description: string[];
  conditions: Condition[];
};

export enum ActivityType {
  NONE = 0,
  HAS_CAST = 1,
  HAS_ATTRIBUTES = 2,
  HAS_CAST_ATTRIBUTES = 4,
}

export const ActivityTypeOptions = [
  // { id: ActivityType.NONE, label: 'None' },
  { id: ActivityType.HAS_CAST, label: 'Cast' },
  { id: ActivityType.HAS_ATTRIBUTES, label: 'Attributes' },
  // { id: ActivityType.HAS_CAST_ATTRIBUTES, label: 'Both' },
];

export type Activity = Labeled & {
  type?: ActivityType | ActivityType[];
  cast: ID[];
  attributes: ID[];
  conditions: Condition[];
};

export type Cast = Labeled & {
  type: CastType;
  skills?: Skill[];
};

export enum CastType {
  Individual = 'Individual',
  Organisation = 'Organisation',
  Role = 'Role',
}

export const CastTypeOptions = [
  { id: CastType.Individual, label: 'Individual' },
  { id: CastType.Organisation, label: 'More than one or group' },
  // { id: CastType.Role, label: 'Role' },
];

export type Condition = Labeled & {
  type: ConditionType;
};

export enum ConditionType {
  Prerequisite = 'Prerequisite',
  Facilitator = 'Facilitator',
  Enforcement = 'Enforcement',
}

export const ConditionTypeOptions = [
  { id: ConditionType.Prerequisite, label: 'Prerequisite' },
  { id: ConditionType.Facilitator, label: 'Facilitator' },
  { id: ConditionType.Enforcement, label: 'Enforcement' },
];

export type Skill = Labeled & {
  level: LevelType;
};

export enum LevelType {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export const LevelTypeOptions = [
  { id: LevelType.Beginner, label: 'Beginner' },
  { id: LevelType.Intermediate, label: 'Intermediate' },
  { id: LevelType.Expert, label: 'Expert' },
];
