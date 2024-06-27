import { t } from '../services';

export const crimePreventionStrategies = [
  {
    id: '1',
    label: t('INCREASE_EFFORT'),
    sub: [
      {
        id: '1',
        label: t('TARGET_HARDEN', 'TITLE'),
        desc: t('TARGET_HARDEN', 'DESC'),
      },
      {
        id: '2',
        label: t('CONTROL_ACCESS', 'TITLE'),
        desc: t('CONTROL_ACCESS', 'DESC'),
      },
      {
        id: '3',
        label: t('SCREEN_EXITS', 'TITLE'),
        desc: t('SCREEN_EXITS', 'DESC'),
      },
      {
        id: '4',
        label: t('DEFLECT_OFFENDERS', 'TITLE'),
        desc: t('DEFLECT_OFFENDERS', 'DESC'),
      },
      {
        id: '5',
        label: t('CONTROL_TOOLS', 'TITLE'),
        desc: t('CONTROL_TOOLS', 'DESC'),
      },
    ],
  },
  {
    id: '2',
    label: t('INCREASE_RISKS'),
    sub: [
      {
        id: '6',
        label: t('EXTEND_GUARDIANSHIP', 'TITLE'),
        desc: t('EXTEND_GUARDIANSHIP', 'DESC'),
      },
      {
        id: '7',
        label: t('ASSIST_SURVEILLANCE', 'TITLE'),
        desc: t('ASSIST_SURVEILLANCE', 'DESC'),
      },
      {
        id: '8',
        label: t('REDUCE_ANONYMITY', 'TITLE'),
        desc: t('REDUCE_ANONYMITY', 'DESC'),
      },
      {
        id: '9',
        label: t('USE_PLACE_MANAGERS', 'TITLE'),
        desc: t('USE_PLACE_MANAGERS', 'DESC'),
      },
      {
        id: '10',
        label: t('STRENGTHEN_SURVEILLANCE', 'TITLE'),
        desc: t('STRENGTHEN_SURVEILLANCE', 'DESC'),
      },
    ],
  },
  {
    id: '3',
    label: t('REDUCE_REWARDS'),
    sub: [
      {
        id: '11',
        label: t('CONCEAL_TARGETS', 'TITLE'),
        desc: t('CONCEAL_TARGETS', 'DESC'),
      },
      {
        id: '12',
        label: t('REMOVE_TARGETS', 'TITLE'),
        desc: t('REMOVE_TARGETS', 'DESC'),
      },
      {
        id: '13',
        label: t('IDENTIFY_PROPERTY', 'TITLE'),
        desc: t('IDENTIFY_PROPERTY', 'DESC'),
      },
      {
        id: '14',
        label: t('DISRUPT_MARKETS', 'TITLE'),
        desc: t('DISRUPT_MARKETS', 'DESC'),
      },
      {
        id: '15',
        label: t('DENY_BENEFITS', 'TITLE'),
        desc: t('DENY_BENEFITS', 'DESC'),
      },
    ],
  },
  {
    id: '4',
    label: t('REDUCE_PROVOCATIONS'),
    sub: [
      {
        id: '16',
        label: t('REDUCE_FRUSTRATIONS', 'TITLE'),
        desc: t('REDUCE_FRUSTRATIONS', 'DESC'),
      },
      {
        id: '17',
        label: t('AVOID_DISPUTES', 'TITLE'),
        desc: t('AVOID_DISPUTES', 'DESC'),
      },
      {
        id: '18',
        label: t('REDUCE_TEMPTATION', 'TITLE'),
        desc: t('REDUCE_TEMPTATION', 'DESC'),
      },
      {
        id: '19',
        label: t('NEUTRALIZE_PRESSURE', 'TITLE'),
        desc: t('NEUTRALIZE_PRESSURE', 'DESC'),
      },
      {
        id: '20',
        label: t('DISCOURAGE_IMITATION', 'TITLE'),
        desc: t('DISCOURAGE_IMITATION', 'DESC'),
      },
    ],
  },
  {
    id: '5',
    label: t('REMOVE_EXCUSES'),
    sub: [
      {
        id: '21',
        label: t('SET_RULES', 'TITLE'),
        desc: t('SET_RULES', 'DESC'),
      },
      {
        id: '22',
        label: t('POST_INSTRUCTIONS', 'TITLE'),
        desc: t('POST_INSTRUCTIONS', 'DESC'),
      },
      {
        id: '23',
        label: t('ALERT_CONSCIENCE', 'TITLE'),
        desc: t('ALERT_CONSCIENCE', 'DESC'),
      },
      {
        id: '24',
        label: t('ASSIST_COMPLIANCE', 'TITLE'),
        desc: t('ASSIST_COMPLIANCE', 'DESC'),
      },
      {
        id: '25',
        label: t('CONTROL_DRUGS', 'TITLE'),
        desc: t('CONTROL_DRUGS', 'DESC'),
      },
    ],
  },
];
