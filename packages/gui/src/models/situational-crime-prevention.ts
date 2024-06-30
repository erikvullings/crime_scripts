import { t } from '../services';

export const crimePreventionStrategies = () => [
  {
    id: '1',
    label: t('INCREASE_EFFORT'),
    icon: 'fitness_center',
    sub: [
      {
        id: '1.1',
        label: t('TARGET_HARDEN', 'TITLE'),
        desc: t('TARGET_HARDEN', 'DESC'),
      },
      {
        id: '1.2',
        label: t('CONTROL_ACCESS', 'TITLE'),
        desc: t('CONTROL_ACCESS', 'DESC'),
      },
      {
        id: '1.3',
        label: t('SCREEN_EXITS', 'TITLE'),
        desc: t('SCREEN_EXITS', 'DESC'),
      },
      {
        id: '1.4',
        label: t('DEFLECT_OFFENDERS', 'TITLE'),
        desc: t('DEFLECT_OFFENDERS', 'DESC'),
      },
      {
        id: '1.5',
        label: t('CONTROL_TOOLS', 'TITLE'),
        desc: t('CONTROL_TOOLS', 'DESC'),
      },
    ],
  },
  {
    id: '2',
    label: t('INCREASE_RISKS'),
    icon: 'warning',
    sub: [
      {
        id: '2.1',
        label: t('EXTEND_GUARDIANSHIP', 'TITLE'),
        desc: t('EXTEND_GUARDIANSHIP', 'DESC'),
      },
      {
        id: '2.2',
        label: t('ASSIST_SURVEILLANCE', 'TITLE'),
        desc: t('ASSIST_SURVEILLANCE', 'DESC'),
      },
      {
        id: '2.3',
        label: t('REDUCE_ANONYMITY', 'TITLE'),
        desc: t('REDUCE_ANONYMITY', 'DESC'),
      },
      {
        id: '2.4',
        label: t('USE_PLACE_MANAGERS', 'TITLE'),
        desc: t('USE_PLACE_MANAGERS', 'DESC'),
      },
      {
        id: '2.5',
        label: t('STRENGTHEN_SURVEILLANCE', 'TITLE'),
        desc: t('STRENGTHEN_SURVEILLANCE', 'DESC'),
      },
    ],
  },
  {
    id: '3',
    label: t('REDUCE_REWARDS'),
    icon: 'do_not_disturb',
    sub: [
      {
        id: '3.1',
        label: t('CONCEAL_TARGETS', 'TITLE'),
        desc: t('CONCEAL_TARGETS', 'DESC'),
      },
      {
        id: '3.2',
        label: t('REMOVE_TARGETS', 'TITLE'),
        desc: t('REMOVE_TARGETS', 'DESC'),
      },
      {
        id: '3.3',
        label: t('IDENTIFY_PROPERTY', 'TITLE'),
        desc: t('IDENTIFY_PROPERTY', 'DESC'),
      },
      {
        id: '3.4',
        label: t('DISRUPT_MARKETS', 'TITLE'),
        desc: t('DISRUPT_MARKETS', 'DESC'),
      },
      {
        id: '3.5',
        label: t('DENY_BENEFITS', 'TITLE'),
        desc: t('DENY_BENEFITS', 'DESC'),
      },
    ],
  },
  {
    id: '4',
    label: t('REDUCE_PROVOCATIONS'),
    icon: 'peace',
    sub: [
      {
        id: '4.1',
        label: t('REDUCE_FRUSTRATIONS', 'TITLE'),
        desc: t('REDUCE_FRUSTRATIONS', 'DESC'),
      },
      {
        id: '4.2',
        label: t('AVOID_DISPUTES', 'TITLE'),
        desc: t('AVOID_DISPUTES', 'DESC'),
      },
      {
        id: '4.3',
        label: t('REDUCE_TEMPTATION', 'TITLE'),
        desc: t('REDUCE_TEMPTATION', 'DESC'),
      },
      {
        id: '4.4',
        label: t('NEUTRALIZE_PRESSURE', 'TITLE'),
        desc: t('NEUTRALIZE_PRESSURE', 'DESC'),
      },
      {
        id: '4.5',
        label: t('DISCOURAGE_IMITATION', 'TITLE'),
        desc: t('DISCOURAGE_IMITATION', 'DESC'),
      },
    ],
  },
  {
    id: '5',
    label: t('REMOVE_EXCUSES'),
    icon: 'delete',
    sub: [
      {
        id: '5.1',
        label: t('SET_RULES', 'TITLE'),
        desc: t('SET_RULES', 'DESC'),
      },
      {
        id: '5.2',
        label: t('POST_INSTRUCTIONS', 'TITLE'),
        desc: t('POST_INSTRUCTIONS', 'DESC'),
      },
      {
        id: '5.3',
        label: t('ALERT_CONSCIENCE', 'TITLE'),
        desc: t('ALERT_CONSCIENCE', 'DESC'),
      },
      {
        id: '5.4',
        label: t('ASSIST_COMPLIANCE', 'TITLE'),
        desc: t('ASSIST_COMPLIANCE', 'DESC'),
      },
      {
        id: '5.5',
        label: t('CONTROL_DRUGS', 'TITLE'),
        desc: t('CONTROL_DRUGS', 'DESC'),
      },
    ],
  },
];

export const crimeMeasureOptions = (useGroupInLabel = false) => {
  const misc = t('MISC');
  const createLabel = (label: string, group: string) => (useGroupInLabel ? `${group}: ${label}` : label);

  return crimePreventionStrategies().reduce(
    (acc, cur) => {
      const group = cur.label;
      cur.sub.forEach(({ id, label }) => acc.push({ id, label: createLabel(label, group), group }));
      // acc.push({ id: cur.id, label: `${group}: ${misc}`, group });
      return acc;
    },
    [{ id: '0.0', label: createLabel(misc, misc), group: misc, icon: 'more_horiz' }] as Array<{
      id: string;
      icon?: string;
      label: string;
      group: string;
    }>
  );
};
