import m, { FactoryComponent } from 'mithril';
import {
  Act,
  Activity,
  ActivityTypeOptions,
  Cast,
  Condition,
  CrimeScene,
  CrimeSceneAttributes,
  ICONS,
  ID,
  IconOpts,
  Pages,
} from '../models';
import { MeiosisComponent, routingSvc } from '../services';
import { FlatButton, ITabItem, Tabs, uniqueId, ModalPanel } from 'mithril-materialized';
import { FormAttributes, LayoutForm, SlimdownView, UIForm } from 'mithril-ui-form';
import { labelForm } from '../models/forms';

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
      update({ currentCrimeSceneId: id });
      setPage(Pages.HOME);
    },
    view: ({ attrs: { state, actions } }) => {
      id = m.route.param('id') || '';
      const { model, role } = state;
      const { crimeScenes = [], cast = [], attributes = [] } = model;
      const crimeScene = crimeScenes.find((c) => c.id === id);

      const isAdmin = role === 'admin';
      const isEditor = role === 'admin' || role === 'editor';

      return m(
        '#home-page.row.home.page',
        id
          ? [
              isEditor &&
                m(
                  '.right-align',
                  edit
                    ? m(FlatButton, {
                        label: 'Save script',
                        iconName: 'save',
                        className: 'small',
                        onclick: () => {
                          edit = false;
                          if (crimeScene) {
                            model.crimeScenes = model.crimeScenes.map((c) => (c.id === id ? crimeScene : c));
                            actions.saveModel(model);
                          }
                        },
                      })
                    : [
                        m(FlatButton, {
                          label: 'Edit script',
                          iconName: 'edit',
                          className: 'small',
                          onclick: () => {
                            edit = true;
                          },
                        }),
                        m(FlatButton, {
                          label: 'Delete script',
                          iconName: 'delete',
                          className: 'small',
                          modalId: 'deleteScript',
                        }),
                      ]
                ),
              crimeScene &&
                m('.crime-scene', m(edit ? CrimeSceneEditor : CrimeSceneView, { crimeScene, cast, attributes })),
            ]
          : [
              isAdmin &&
                m(
                  '.right-align',
                  m(FlatButton, {
                    label: 'Nieuw script',
                    iconName: 'add',
                    className: 'small',
                    onclick: () => {
                      const newCrimeScene = { id: uniqueId() } as CrimeScene;
                      model.crimeScenes.push(newCrimeScene);
                      actions.saveModel(model);
                      actions.changePage(Pages.HOME, { id: newCrimeScene.id });
                    },
                  })
                ),
              m(
                '.crime-scenes',
                crimeScenes.map((crimeScene) => m(CrimeSceneCard, { crimeScene, cast, changePage: actions.changePage }))
              ),
            ],
        m(ModalPanel, {
          id: 'deleteScript',
          title: 'Delete script',
          description: `Are you sure you want to delete ${crimeScene?.label}?`,
          buttons: [
            { label: 'Cancel', iconName: 'cancel' },
            {
              label: 'Delete',
              iconName: 'delete',
              onclick: () => {
                if (crimeScene) {
                  model.crimeScenes = model.crimeScenes.filter((c) => c.id !== id);
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

export const CrimeSceneCard: FactoryComponent<{
  crimeScene: CrimeScene;
  cast: Cast[];
  changePage: (
    page: Pages,
    params?: Record<string, string | number | undefined>,
    query?: Record<string, string | number | undefined>
  ) => void;
}> = () => {
  return {
    view: ({ attrs: { crimeScene, cast = [], changePage } }) => {
      const { id, url, label: name, acts = [], description } = crimeScene;

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

      return m(
        '.col.s12.m6.l4',
        m(
          '.card.medium.cursor-pointer',
          {
            onclick: () => {
              changePage(Pages.HOME, { id });
            },
          },
          [
            url &&
              m('.card-image', [
                m(
                  'a',
                  {
                    href: routingSvc.href(Pages.HOME, `?id=${id}`),
                  },
                  [
                    m('img', { src: url, alt: name }),
                    m(
                      'span.card-title.bold.sharpen',
                      // { className: isBookmarked ? 'amber-text' : 'black-text' },
                      name || 'DEFAULT'
                    ),
                  ]
                ),
              ]),
            m('.card-content', [
              !url &&
                m(
                  'span.card-title.bold.sharpen',
                  // { className: isBookmarked ? 'amber-text' : 'black-text' },
                  name || 'DEFAULT'
                ),
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
                m('p', m('span.bold', 'Cast: '), allCast.map(({ label }) => label).join(', ')),
            ]),
          ]
        )
      );
    },
  };
};

export const CrimeSceneView: FactoryComponent<{
  crimeScene: CrimeScene;
  cast: Cast[];
  attributes: CrimeSceneAttributes[];
}> = () => {
  let selectedActId = 0;

  return {
    view: ({ attrs: { crimeScene, cast, attributes } }) => {
      const { label = '...', acts = [] } = crimeScene;
      const selectedActContent = acts
        .filter((_, index) => selectedActId === index)
        .map(({ label = '...', preparation, preactivity, activity, postactivity }) => {
          preparation.label = 'Preparation phase';
          preactivity.label = 'Preactivity phase';
          activity.label = 'Activity phase';
          postactivity.label = 'Postactivity phase';
          const contentTabs = [preparation, preactivity, activity, postactivity]
            .filter((ap) => ap && ((ap.activities && ap.activities.length) || (ap.conditions && ap.conditions.length)))
            .map(({ label, activities = [], conditions }) => {
              const castIds = Array.from(
                activities.reduce((acc, { cast: curCast }) => {
                  if (curCast) curCast.forEach((id) => acc.add(id));
                  return acc;
                }, new Set<ID>())
              );
              const md = `##### Activities

${activities.map((act) => '- ' + act.label).join('\n')}

##### Cast

${castIds.map((id) => '- ' + cast.find((cast) => cast.id === id)?.label).join('\n')}

##### Conditions

${conditions.map((cond) => '- ' + cond.label).join('\n')}
`;
              return {
                title: label,
                md,
              };
            });
          const tabItem: ITabItem = {
            title: label,
            vnode: contentTabs.length
              ? m(Tabs, {
                  tabs: contentTabs.map(
                    ({ title, md }) =>
                      ({
                        title,
                        vnode: m(SlimdownView, { md }),
                      } as ITabItem)
                  ),
                })
              : m('div'),
          };
          return tabItem;
        })
        .pop();

      return m('.col.s12', [
        m('h4', label),
        m(
          '.card-container',
          acts.map(({ label = '...', icon, url, description }, index) => {
            const imgSrc = icon === ICONS.OTHER ? url : IconOpts.find((i) => i.id === icon)?.img;
            return m('.card.large', [
              m('.card-image', [
                imgSrc &&
                  m('img', {
                    alt: label,
                    src: imgSrc,
                    style: {
                      width: 'auto',
                      margin: 'auto',
                      'padding-top': '10px',
                      'padding-bottom': '2.8rem',
                      'max-height': '200px',
                    },
                  }),
                m(
                  'span.card-title.white.black-text',
                  { style: { padding: '5px 10px', 'border-radius': '10px' } },
                  `${index + 1}. ${label}`
                ),
              ]),
              m('.card-content', m(SlimdownView, { md: description })),
              m('.card-action', m(FlatButton, { label: 'MORE', onclick: () => (selectedActId = index) })),
            ]);
          })
        ),
        selectedActContent && [m('h4', selectedActContent.title), selectedActContent.vnode],
      ]);
    },
  };
};

export const CrimeSceneEditor: FactoryComponent<{
  crimeScene: CrimeScene;
  cast: Cast[];
  attributes: CrimeSceneAttributes[];
}> = () => {
  return {
    view: ({ attrs: { crimeScene, cast, attributes } }) => {
      // const { cast } = crimeScene;

      const activityForm: UIForm<any> = [
        {
          id: 'activities',
          repeat: true,
          type: [
            { id: 'id', type: 'autogenerate', autogenerate: 'id' },
            { id: 'label', type: 'textarea', className: 'col s8 m9 xl10', label: 'Activity' },
            {
              id: 'type',
              type: 'options',
              className: 'col s4 m3 xl2',
              label: 'Specify',
              options: ActivityTypeOptions,
              checkboxClass: 'col s6',
            },
            {
              id: 'cast',
              show: ['type=1', 'type=4'],
              type: 'select',
              className: 'col s12 m6',
              multiple: true,
              options: cast,
              label: 'Cast',
            },
            {
              id: 'attributes',
              show: ['type=2', 'type=4'],
              type: 'select',
              className: 'col s12 m6',
              multiple: true,
              options: attributes,
              label: 'Attributes',
            },
          ] as UIForm<Activity>,
          className: 'col s12',
          label: 'Activities',
        },
        {
          id: 'conditions',
          repeat: true,
          type: [
            { id: 'id', type: 'autogenerate', autogenerate: 'id' },
            { id: 'label', type: 'textarea', className: 'col s12', label: 'Condition' },
          ] as UIForm<Condition>,
          className: 'col s12',
          label: 'Conditions',
        },
      ];
      // console.log(activityForm);

      const actsForm: UIForm<any> = [
        // ...castForm,
        {
          id: 'acts',
          repeat: true,
          pageSize: 1,
          label: 'Acts',
          type: [
            { id: 'label', type: 'text', className: 'col s6 m6', label: 'Name' },
            { id: 'icon', type: 'select', className: 'col s6 m3', label: 'Image', options: IconOpts },
            { id: 'url', type: 'base64', className: 'col s12 m3', label: 'Image', show: ['icon=1'] },
            { id: 'description', type: 'textarea', className: 'col s12', label: 'Summary' },
            { id: 'preparation', type: activityForm, className: 'col s12 section', label: 'Preparation' },
            { id: 'preactivity', type: activityForm, className: 'col s12 section', label: 'Pre-activity' },
            { id: 'activity', type: activityForm, className: 'col s12 section', label: 'Activity' },
            { id: 'postactivity', type: activityForm, className: 'col s12 section', label: 'Post-activity' },
          ] as UIForm<Partial<Act>>,
        },
      ];
      return m('.col.s12', [
        m(LayoutForm, {
          form: [...labelForm, ...actsForm],
          obj: crimeScene,
          onchange: () => {},
        } as FormAttributes<Partial<CrimeScene>>),
        // m(Tabs, {
        //   tabs: [
        //     {
        //       title: 'Acts',
        //       vnode: m('.acts', [
        //         m(LayoutForm, {
        //           form: actsForm,
        //           obj: crimeScene,
        //           onchange: () => {},
        //         } as FormAttributes<Partial<CrimeScene>>),
        //         // m(Tabs, {
        //         //   tabs: [
        //         //     {
        //         //       title: 'Preparation',
        //         //       vnode: m(LayoutForm, {
        //         //         form: actForm,
        //         //         obj: crimeScene,
        //         //         section: 'preparation',
        //         //         onchange: () => {},
        //         //       } as FormAttributes<Partial<CrimeScene>>),
        //         //     },
        //         //   ],
        //         // }),
        //       ]),
        //     },
        //     {
        //       title: 'Cast',
        //       vnode: m(LayoutForm, {
        //         form: castForm,
        //         obj: crimeScene,
        //         onchange: () => {},
        //       } as FormAttributes<Partial<CrimeScene>>),
        //     },
        //   ],
        // }),
      ]);
    },
  };
};