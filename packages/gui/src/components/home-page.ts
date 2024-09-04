import m, { FactoryComponent } from 'mithril';
import {
  Act,
  Activity,
  ActivityPhase,
  ActivityTypeOptions,
  Cast,
  CastType,
  Condition,
  CrimeScript,
  CrimeScriptAttributes,
  ICONS,
  ID,
  IconOpts,
  Pages,
  attributeTypeToIconMap,
  Stage,
  Measure,
  scriptIcon,
  missingIcon,
} from '../models';
import { MeiosisComponent, State, routingSvc } from '../services';
import { FlatButton, ITabItem, Tabs, uniqueId, ModalPanel, Select, ISelectOptions, Icon } from 'mithril-materialized';
import { FormAttributes, LayoutForm, render, SlimdownView, UIForm } from 'mithril-ui-form';
import { labelForm, literatureForm } from '../models/forms';
import { Patch } from 'meiosis-setup/types';
import { ReferenceListComponent } from './ui/reference';
import { MultiSelectDropdown } from './ui/multi-select';
import { crimeMeasureOptions, lookupCrimeMeasure } from '../models/situational-crime-prevention';
import { t } from '../services/translations';
import { toWord } from '../utils/word';
import { formatDate } from '../utils';

export const HomePage: MeiosisComponent = () => {
  let id = '';
  let edit = false;

  return {
    oninit: ({
      attrs: {
        actions: { setPage, update },
      },
    }) => {
      id = m.route.param('id') || '';
      update({ currentCrimeScriptId: id });
      setPage(Pages.HOME);
    },
    view: ({ attrs: { state, actions } }) => {
      id = m.route.param('id') || '';
      const { model, role, curActIdx, curPhaseIdx } = state;
      const { crimeScripts = [], cast = [], acts = [], attributes = [] } = model;
      const crimeScript = crimeScripts.find((c) => c.id === id);

      const isAdmin = role === 'admin';
      const isEditor = role === 'admin' || role === 'editor';

      const filename = `${formatDate(Date.now(), '')}_${crimeScript?.label}_v${model.version}.docx`;

      return m(
        '#home-page.row.home.page',
        id
          ? [
              isEditor &&
                m(
                  '.right-align',
                  edit
                    ? m(FlatButton, {
                        label: t('SAVE_SCRIPT'),
                        iconName: 'save',
                        className: 'small',
                        onclick: () => {
                          edit = false;
                          if (crimeScript) {
                            model.crimeScripts = model.crimeScripts.map((c) => (c.id === id ? crimeScript : c));
                            actions.saveModel(model);
                          }
                        },
                      })
                    : [
                        m(FlatButton, {
                          label: t('EDIT_SCRIPT'),
                          iconName: 'edit',
                          className: 'small',
                          onclick: () => {
                            edit = true;
                          },
                        }),
                        m(FlatButton, {
                          label: t('DELETE_SCRIPT'),
                          iconName: 'delete',
                          className: 'small',
                          modalId: 'deleteScript',
                        }),
                        crimeScript &&
                          m(FlatButton, {
                            title: 'Export to Word',
                            label: t('EXPORT_TO_WORD'),
                            className: 'small',
                            iconName: 'download',
                            onclick: () => toWord(filename, crimeScript, model),
                          }),
                      ]
                ),
              crimeScript &&
                m(
                  '.crime-scene',
                  edit
                    ? m(CrimeScriptEditor, { crimeScript: crimeScript, cast, acts, attributes })
                    : m(CrimeScriptView, {
                        crimeScript: crimeScript,
                        cast,
                        acts,
                        attributes,
                        curActIdx,
                        curPhaseIdx,
                        update: actions.update,
                      })
                ),
            ]
          : [
              isAdmin &&
                m(
                  '.right-align',
                  m(FlatButton, {
                    label: t('NEW_SCRIPT'),
                    iconName: 'add',
                    className: 'small',
                    onclick: () => {
                      const newCrimeScript = { id: uniqueId() } as CrimeScript;
                      model.crimeScripts.push(newCrimeScript);
                      actions.saveModel(model);
                      actions.changePage(Pages.HOME, { id: newCrimeScript.id });
                    },
                  })
                ),
              m(
                '.crime-scenes',
                m('ul.collection.with-header', [
                  m('li.collection-header', m('h4', 'Crime Scripts')),
                  ...crimeScripts.map(({ url = scriptIcon, label, description, id }) =>
                    m('li.collection-item.avatar', [
                      m('img.circle', { src: url, alt: 'Avatar' }),
                      m('span.title', label),
                      m('p', description),
                      m(
                        'a.secondary-content',
                        { href: routingSvc.href(Pages.HOME, `id=${id}`) },
                        m(Icon, { iconName: 'more_horiz' })
                      ),
                    ])
                  ),
                ])
                // crimeScripts.map((crimeScript) =>
                //   m(CrimeScriptCard, { crimeScript, cast, acts, changePage: actions.changePage })
                // )
              ),
            ],
        m(ModalPanel, {
          id: 'deleteScript',
          title: t('DELETE_SCRIPT'),
          description: t('DELETE_SCRIPT_CONFIRM', { name: crimeScript?.label }),
          buttons: [
            { label: t('CANCEL'), iconName: 'cancel' },
            {
              label: t('DELETE'),
              iconName: 'delete',
              onclick: () => {
                if (crimeScript) {
                  model.crimeScripts = model.crimeScripts.filter((c) => c.id !== id);
                  actions.saveModel(model);
                  actions.changePage(Pages.HOME);
                }
              },
            },
          ],
        })
      );
    },
  };
};

export const CrimeScriptCard: FactoryComponent<{
  crimeScript: CrimeScript;
  cast: Cast[];
  acts: Act[];
  changePage: (
    page: Pages,
    params?: Record<string, string | number | undefined>,
    query?: Record<string, string | number | undefined>
  ) => void;
}> = () => {
  return {
    view: ({ attrs: { crimeScript, cast = [], acts: allActs = [], changePage } }) => {
      const { id, url = scriptIcon, label: name = t('NEW_ACT'), stages: actVariants = [], description } = crimeScript;

      const acts = actVariants.map((variant) => allActs.find((a) => a.id === variant.id) || ({} as Act));
      const allCast = Array.from(
        acts.reduce((acc, { preparation, preactivity, activity, postactivity }) => {
          [preparation, preactivity, activity, postactivity].forEach((ap) => {
            if (ap.activities) ap.activities.filter((a) => a.cast).forEach((a) => a.cast.forEach((id) => acc.add(id)));
          });
          return acc;
        }, new Set<ID>())
      )
        .map((id) => cast.find((cast) => cast.id === id))
        .filter((c) => c) as Cast[];

      console.log(url);
      return m(
        '.col.s12.m6.l4',
        m(
          '.card.large.cursor-pointer',
          {
            onclick: () => {
              changePage(Pages.HOME, { id });
            },
          },
          [
            m('.card-image', [
              m(
                'a',
                {
                  href: routingSvc.href(Pages.HOME, `?id=${id}`),
                },
                [m('img', { src: url, alt: name }), m('span.card-title.bold.sharpen', name)]
              ),
            ]),
            m('.card-content', [
              !url && m('span.card-title.bold.sharpen', { style: { 'white-space': 'wrap' } }, name),
              description && m('p', description),
              acts &&
                m(
                  'p',
                  m(
                    'ol',
                    acts.map((act) => m('li', act.label))
                  )
                ),
              allCast &&
                allCast.length > 0 &&
                m('p', m('span.bold', `${t('CAST')}: `), allCast.map(({ label }) => label).join(', ')),
            ]),
          ]
        )
      );
    },
  };
};

export const CrimeScriptView: FactoryComponent<{
  crimeScript: CrimeScript;
  cast: Cast[];
  acts: Act[];
  attributes: CrimeScriptAttributes[];
  curActIdx?: number;
  curPhaseIdx?: number;
  update: (patch: Patch<State>) => void;
}> = () => {
  const findCrimeMeasure = lookupCrimeMeasure();

  return {
    view: ({ attrs: { crimeScript, cast, acts, attributes, curActIdx = 0, curPhaseIdx = 0, update } }) => {
      const { label = '...', description, literature, stages: actVariants = [] } = crimeScript;
      const [allCastIds, allAttrIds] = actVariants.reduce(
        (acc, variant) => {
          const act = acts.find((a) => a.id === variant.id);
          if (act) {
            [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((phase) =>
              phase.activities.forEach((activity) => {
                activity.cast?.forEach((id) => acc[0].add(id));
                activity.attributes?.forEach((id) => acc[1].add(id));
              })
            );
          }
          return acc;
        },
        [new Set<ID>(), new Set<ID>()] as [cast: Set<ID>, attr: Set<ID>]
      );
      const allStages = actVariants.reduce((acc, cur, index) => {
        cur.ids.forEach((id, idx) => {
          const act = acts.find((a) => a.id === id);
          if (act) {
            const counter = `${index + 1}${cur.ids.length === 1 ? '' : String.fromCharCode(97 + idx)}`;
            const title = `${counter}. ${act.label}`;
            const selectedVariant = cur.ids.length > 1 && id === cur.id;
            acc.push({ stage: cur, stageIdx: index, title, act, selectedVariant });
          }
        });
        return acc;
      }, [] as Array<{ stage: Stage; stageIdx: number; title: string; act: Act; selectedVariant: boolean }>);

      const selectedActContent = actVariants
        .filter((_, index) => curActIdx === index)
        .map((variant) => {
          return acts.find((a) => a.id === variant.id) || ({} as Act);
        })
        .map(({ label = '...', preparation, preactivity, activity, postactivity, measures = [] } = {} as Act) => {
          preparation.label = t('PREPARATION_PHASE');
          preactivity.label = t('PRE_ACTIVITY_PHASE');
          activity.label = t('ACTIVITY_PHASE');
          postactivity.label = t('POST_ACTIVITY_PHASE');
          const contentTabs = [preparation, preactivity, activity, postactivity].map(
            ({ label, activities = [], conditions }) => {
              const castIds = Array.from(
                activities.reduce((acc, { cast: curCast }) => {
                  if (curCast) curCast.forEach((id) => acc.add(id));
                  return acc;
                }, new Set<ID>())
              );
              const attrIds = Array.from(
                activities.reduce((acc, { attributes: curAttr }) => {
                  if (curAttr) curAttr.forEach((id) => acc.add(id));
                  return acc;
                }, new Set<ID>())
              );
              const md = `##### ${t('ACTIVITIES')}

${activities.map((act) => '- ' + act.label).join('\n')}

${castIds.length > 0 ? `##### ${t('CAST')}` : ''}

${castIds.map((id) => '- ' + cast.find((cast) => cast.id === id)?.label).join('\n')}

${conditions.length > 0 ? `##### ${t('CONDITIONS')}` : ''}

${conditions.map((cond) => '- ' + cond.label).join('\n')}

${attrIds.length > 0 ? `##### ${t('ATTRIBUTES')}` : ''}

${attrIds.map((id) => '- ' + attributes.find((attr) => attr.id === id)?.label).join('\n')}
`;
              return {
                title: label,
                md,
              };
            }
          );
          if (measures.length > 0) {
            contentTabs.push({
              title: t('MEASURES'),
              md: `##### ${t('MEASURES')}
                
${measures.map((measure) => `- ${findCrimeMeasure(measure.cat)?.label}: ${measure.label}`).join('\n')}
                `,
            });
          }
          const tabItem: ITabItem = {
            title: label,
            vnode: contentTabs.length
              ? m(Tabs, {
                  tabs: contentTabs.map(
                    ({ title, md }, index) =>
                      ({
                        title,
                        active: index === curPhaseIdx,
                        vnode: m(SlimdownView, { md }),
                      } as ITabItem)
                  ),
                })
              : m('div'),
          };
          return tabItem;
        })
        .shift();

      return m('.col.s12', [
        m('h4', label),
        description && m('p', description),
        m('.row', [
          m('.col.s6', [
            allCastIds.size > 0 && [
              m('h5', t('CAST')),
              m(
                'ol',
                Array.from(allCastIds).map((id) => m('li', cast.find((c) => c.id === id)?.label))
              ),
            ],
          ]),
          m('.col.s6', [
            allAttrIds.size > 0 && [
              m('h5', t('ATTRIBUTES')),
              m(
                'ol',
                Array.from(allAttrIds).map((id) => m('li', attributes.find((c) => c.id === id)?.label))
              ),
            ],
          ]),
        ]),
        literature &&
          literature.length > 0 && [m('h5', t('REFERENCES')), m(ReferenceListComponent, { references: literature })],
        m(
          'ul.collection.with-header',
          m('li.collection-header', m('h4', t('STAGES'))),
          allStages.map(({ stage, stageIdx, selectedVariant, title, act }) => {
            const { id, label = '...', icon, url, description = '' } = act;
            const imgSrc = (icon === ICONS.OTHER ? url : IconOpts.find((i) => i.id === icon)?.img) || missingIcon;
            return m(
              'li.collection-item.avatar',
              { class: curActIdx === stageIdx && id === actVariants[curActIdx].id ? 'active' : undefined },
              [
                m('img.circle', { src: imgSrc, alt: label }),
                m('span.title', title, selectedVariant ? m('sup', '*') : undefined),
                m('p.markdown', m.trust(render(description, true))),
                m(
                  'a.secondary-content',
                  { href: window.location.href },
                  m(Icon, {
                    iconName: 'more_horiz',
                    onclick: () => {
                      stage.id = id;
                      update({ curActIdx: stageIdx });
                    },
                  })
                ),
              ]
            );
          })
        ),
        selectedActContent && [m('h4', selectedActContent.title), selectedActContent.vnode],
      ]);
    },
  };
};

export const CrimeScriptEditor: FactoryComponent<{
  crimeScript: CrimeScript;
  cast: Cast[];
  acts: Act[];
  attributes: CrimeScriptAttributes[];
}> = () => {
  type InputOptions = {
    id: string;
    label?: string;
    group?: string;
    icon?: string;
  };

  const actsForm: UIForm<any> = [
    {
      id: 'stages',
      repeat: true,
      pageSize: 1,
      label: t('STAGES'),
      type: [] as UIForm<Partial<Stage>>,
    },
  ];

  let castOptions: Array<InputOptions> = [];
  let attrOptions: Array<InputOptions> = [];
  let measuresForm: UIForm<any> = [];

  return {
    oninit: ({ attrs: { cast, attributes } }) => {
      castOptions = cast.map(({ id, label, type }) => ({
        id,
        label,
        group: type === CastType.Individual ? 'person' : 'group',
      }));
      attrOptions = attributes.map(({ id, label, type }) => ({ id, label, group: attributeTypeToIconMap.get(type) }));
      const measOptions = crimeMeasureOptions();

      const measureForm: UIForm<Measure> = [
        { id: 'id', type: 'autogenerate', autogenerate: 'id' },
        { id: 'cat', type: 'select', options: measOptions, className: 'col s12 m5 l4', label: t('CATEGORY') },
        { id: 'label', type: 'text', className: 'col s12 m7 l8', label: t('NAME') },
        // { id: 'description', type: 'textarea', className: 'col s12', label: t('DESCRIPTION') },
      ];

      measuresForm = [{ id: 'measures', type: measureForm, repeat: true, label: t('MEASURES') }];
    },
    view: ({ attrs: { acts, crimeScript } }) => {
      const activityForm: UIForm<any> = [
        {
          id: 'activities',
          repeat: true,
          type: [
            { id: 'id', type: 'autogenerate', autogenerate: 'id' },
            { id: 'label', type: 'textarea', className: 'col s8 m9 xl10', label: t('ACTIVITY') },
            {
              id: 'type',
              type: 'options',
              className: 'col s4 m3 xl2',
              label: t('SPECIFY'),
              options: ActivityTypeOptions,
              checkboxClass: 'col s6',
            },
            {
              id: 'cast',
              show: ['type=1', 'type=4'],
              type: 'select',
              className: 'col s12 m6',
              multiple: true,
              options: castOptions,
              label: t('CAST'),
            },
            {
              id: 'attributes',
              show: ['type=2', 'type=4'],
              type: 'select',
              className: 'col s12 m6',
              multiple: true,
              options: attrOptions,
              label: t('ATTRIBUTES'),
            },
          ] as UIForm<Activity>,
          className: 'col s12',
          label: t('ACTIVITIES'),
        },
        {
          id: 'conditions',
          repeat: true,
          type: [
            { id: 'id', type: 'autogenerate', autogenerate: 'id' },
            { id: 'label', type: 'textarea', className: 'col s12', label: t('CONDITION') },
          ] as UIForm<Condition>,
          className: 'col s12',
          label: t('CONDITIONS'),
        },
      ];

      const curActIdx = +(m.route.param('stages') || 1) - 1;
      const curActIds = crimeScript.stages && curActIdx < crimeScript.stages.length && crimeScript.stages[curActIdx];
      const curActId = curActIds && curActIds.id;
      const curAct = curActId && acts.find((a) => a.id === curActId);
      if (curAct) {
        if (!curAct.preparation) curAct.preparation = {} as ActivityPhase;
        if (!curAct.preactivity) curAct.preactivity = {} as ActivityPhase;
        if (!curAct.activity) curAct.activity = {} as ActivityPhase;
        if (!curAct.postactivity) curAct.postactivity = {} as ActivityPhase;
        if (!curAct.measures) curAct.measures = [];
      }

      return m('.col.s12', [
        m(LayoutForm, {
          form: [
            ...labelForm(),
            { id: 'literature', type: literatureForm(), repeat: true, label: t('REFERENCES') },
            ...actsForm,
          ],
          obj: crimeScript,
          onchange: () => {},
        } as FormAttributes<Partial<CrimeScript>>),

        curActIds &&
          m(
            '.col.s12',
            m('.row', [
              m(
                '.col.s12',
                m(MultiSelectDropdown, {
                  items: acts,
                  selectedIds: curActIds.ids,
                  label: t('SELECT_ACT_N'),
                  max: 5,
                  search: true,
                  selectAll: false,
                  listAll: true,
                  onchange: (selectedIds) => {
                    crimeScript.stages[curActIdx] = {
                      id: selectedIds.length > 0 ? selectedIds[0] : '',
                      ids: selectedIds,
                    };
                    m.redraw();
                  },
                })
              ),
              curActIds.ids &&
                curActIds.ids.length > 0 && [
                  m(Select, {
                    key: curAct ? curAct.label : curActIds.id,
                    label: t('SELECT_ACT'),
                    className: 'col s6',
                    initialValue: curActIds.id,
                    // disabled: curActIds.ids.length === 1,
                    options: acts.filter((a) => curActIds.ids.includes(a.id)),
                    onchange: (id) => {
                      crimeScript.stages[curActIdx].id = id[0];
                    },
                  } as ISelectOptions<ID>),
                ],
              m(FlatButton, {
                label: t('ACT'),
                className: 'col s6',
                iconName: 'add',
                onclick: () => {
                  const id = uniqueId();
                  const newAct = {
                    id,
                    label: t('ACT'),
                    activity: {},
                    preparation: {},
                    preactivity: {},
                    postactivity: {},
                  } as Act;
                  acts.push(newAct);
                  crimeScript.stages[curActIdx].id = id;
                  if (crimeScript.stages[curActIdx].ids) {
                    crimeScript.stages[curActIdx].ids.push(id);
                  } else {
                    crimeScript.stages[curActIdx].ids = [id];
                  }
                },
              }),
            ])
          ),

        curAct && [
          m('.cur-act', { key: curAct.id }, [
            m(LayoutForm, {
              form: [
                { id: 'label', type: 'text', className: 'col s6 m6', label: t('NAME') },
                { id: 'icon', type: 'select', className: 'col s6 m3', label: t('IMAGE'), options: IconOpts },
                { id: 'url', type: 'base64', className: 'col s12 m3', label: t('IMAGE'), show: ['icon=1'] },
                { id: 'description', type: 'textarea', className: 'col s12', label: t('SUMMARY') },
              ],
              obj: curAct,
              onchange: () => {},
            } as FormAttributes<Partial<Act>>),
            m(Tabs, {
              tabs: [
                {
                  title: t('PREPARATION_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.preparation,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('PRE_ACTIVITY_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.preactivity,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('ACTIVITY_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.activity,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('POST_ACTIVITY_PHASE'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: activityForm,
                      obj: curAct.postactivity,
                      onchange: () => {},
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
                {
                  title: t('MEASURES'),
                  vnode: m('.acts', [
                    m(LayoutForm, {
                      form: measuresForm,
                      obj: curAct,
                      onchange: () => {
                        console.log(curAct);
                      },
                    } as FormAttributes<Partial<ActivityPhase>>),
                  ]),
                },
              ],
            }),
          ]),
        ],
      ]);
    },
  };
};
