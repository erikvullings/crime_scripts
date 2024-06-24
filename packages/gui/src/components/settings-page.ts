import m, { FactoryComponent } from 'mithril';
import {
  Cast,
  CastType,
  CrimeScene,
  CrimeSceneAttributes,
  ID,
  Pages,
  SearchResult,
  attributeTypeToIconMap,
} from '../models';
import { MeiosisComponent, routingSvc } from '../services';
import { FormAttributes, LayoutForm, SlimdownView } from 'mithril-ui-form';
import { Collapsible, FlatButton, Tabs } from 'mithril-materialized';
import { attributesForm, castForm } from '../models/forms';

export const SettingsPage: MeiosisComponent = () => {
  let edit = false;

  return {
    oninit: ({
      attrs: {
        state: { model },
        actions: { setPage },
      },
    }) => {
      if (model.attributes) {
        model.attributes.sort((a, b) => {
          // Ensure type is always defined
          const typeA = a.type !== undefined ? a.type : Infinity;
          const typeB = b.type !== undefined ? b.type : Infinity;

          // First, sort by type
          if (typeA < typeB) return -1;
          if (typeA > typeB) return 1;

          // If types are equal, sort by label
          return a.label.localeCompare(b.label);
        });
      }
      setPage(Pages.SETTINGS);
    },
    view: ({ attrs: { state, actions } }) => {
      const { model, role } = state;
      const { cast = [], crimeScenes = [], attributes = [] } = model;

      const isAdmin = role === 'admin';
      cast.sort((a, b) => a.label?.localeCompare(b.label || ''));
      // const cast = model.crimeScenes
      //   .filter((c) => c.cast)
      //   .reduce((acc, cur) => {
      //     acc = [...acc, ...cur.cast];
      //     return acc;
      //   }, [] as Cast[]);
      // const obj = { cast };

      return m(
        '#settings-page.settings.page',
        isAdmin && [
          m(FlatButton, {
            label: edit ? 'Stop edit' : 'Edit',
            iconName: edit ? 'save' : 'edit',
            className: 'small',
            onclick: () => {
              edit = !edit;
            },
          }),
        ],
        m(Tabs, {
          tabs: [
            {
              title: 'Cast',
              vnode: edit
                ? m(LayoutForm, {
                    form: castForm,
                    obj: model,
                    onchange: () => actions.saveModel(model),
                  } as FormAttributes<{ cast: Cast[] }>)
                : m(CastView, { cast, crimeScenes, setLocation: actions.setLocation }),
            },
            {
              title: 'Attributes',
              vnode: edit
                ? m(LayoutForm, {
                    form: attributesForm,
                    obj: model,
                    onchange: () => actions.saveModel(model),
                  } as FormAttributes<{ attributes: CrimeSceneAttributes[] }>)
                : m(AttributesView, { attributes, crimeScenes, setLocation: actions.setLocation }),
            },
          ],
        })
      );
    },
  };
};

const CastView: FactoryComponent<{
  cast: Cast[];
  crimeScenes: CrimeScene[];
  setLocation: (currentCrimeSceneId: ID, actIdx: number, phaseIdx: number) => void;
}> = () => {
  return {
    view: ({ attrs: { cast, crimeScenes, setLocation } }) => {
      return m(
        '.cast',
        m(Collapsible, {
          items: cast.map((c) => {
            const searchResults = crimeScenes.reduce((acc, cs, crimeSceneIdx) => {
              cs.acts?.forEach(({ preparation, preactivity, activity, postactivity }, actIdx) => {
                [preparation, preactivity, activity, postactivity].forEach((p, phaseIdx) => {
                  p.activities?.forEach((a, activityIdx) => {
                    if (a.cast?.includes(c.id)) {
                      acc.push({
                        crimeSceneIdx,
                        actIdx,
                        phaseIdx,
                        activityIdx,
                        conditionIdx: -1,
                        type: 'cast',
                        resultMd: a.label,
                      } as SearchResult);
                    }
                  });
                });
              });
              return acc;
            }, [] as SearchResult[]);

            return {
              header: `${c.label} (${searchResults.length})`,
              iconName: c.type === CastType.Individual ? 'person' : 'group',
              body: m(
                '.cast-content',
                m(
                  'ol',
                  searchResults.map(({ crimeSceneIdx, actIdx, phaseIdx, resultMd, type }) =>
                    m('li', [
                      m(
                        'a.truncate',
                        {
                          style: { cursor: 'pointer' },
                          href: routingSvc.href(Pages.HOME, `id=${crimeScenes[crimeSceneIdx].id}`),
                          onclick: () => {
                            setLocation(crimeScenes[crimeSceneIdx].id, actIdx, phaseIdx);
                          },
                        },
                        `${crimeScenes[crimeSceneIdx].label} > ${type}`
                      ),
                      m(SlimdownView, { md: resultMd, removeParagraphs: true }),
                    ])
                  )
                )
              ),
            };
          }),
        })
      );
    },
  };
};

const AttributesView: FactoryComponent<{
  attributes: CrimeSceneAttributes[];
  crimeScenes: CrimeScene[];
  setLocation: (currentCrimeSceneId: ID, actIdx: number, phaseIdx: number) => void;
}> = () => {
  return {
    view: ({ attrs: { attributes: cast, crimeScenes, setLocation } }) => {
      return m(
        '.cast',
        m(Collapsible, {
          items: cast.map((attr) => {
            const searchResults = crimeScenes.reduce((acc, cs, crimeSceneIdx) => {
              cs.acts?.forEach(({ preparation, preactivity, activity, postactivity }, actIdx) => {
                [preparation, preactivity, activity, postactivity].forEach((p, phaseIdx) => {
                  p.activities?.forEach((a, activityIdx) => {
                    if (a.attributes?.includes(attr.id)) {
                      acc.push({
                        crimeSceneIdx,
                        actIdx,
                        phaseIdx,
                        activityIdx,
                        conditionIdx: -1,
                        type: 'cast',
                        resultMd: a.label,
                      } as SearchResult);
                    }
                  });
                });
              });
              return acc;
            }, [] as SearchResult[]);

            return {
              header: `${attr.label} (${searchResults.length})`,
              iconName: (attr.type && attributeTypeToIconMap.get(attr.type)) || 'help_outline',
              body: m(
                '.cast-content',
                m(
                  'ol',
                  searchResults.map(({ crimeSceneIdx, actIdx, phaseIdx, resultMd, type }) =>
                    m('li', [
                      m(
                        'a.truncate',
                        {
                          style: { cursor: 'pointer' },
                          href: routingSvc.href(Pages.HOME, `id=${crimeScenes[crimeSceneIdx].id}`),
                          onclick: () => {
                            setLocation(crimeScenes[crimeSceneIdx].id, actIdx, phaseIdx);
                          },
                        },
                        `${crimeScenes[crimeSceneIdx].label} > ${type}`
                      ),
                      m(SlimdownView, { md: resultMd, removeParagraphs: true }),
                    ])
                  )
                )
              ),
            };
          }),
        })
      );
    },
  };
};
