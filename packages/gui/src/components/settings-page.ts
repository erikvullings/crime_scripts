import m, { FactoryComponent } from 'mithril';
import {
  Cast,
  CastType,
  CrimeScript,
  CrimeScriptAttributes,
  ID,
  Pages,
  SearchResult,
  attributeTypeToIconMap,
  Act,
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
      if (model.cast) {
        model.cast.sort((a, b) => a.label?.localeCompare(b.label || ''));
      }
      if (model.attributes) {
        model.attributes.sort((a, b) => a.label?.localeCompare(b.label || ''));
      }

      setPage(Pages.SETTINGS);
    },
    view: ({ attrs: { state, actions } }) => {
      const { model, role } = state;
      const { cast = [], acts = [], crimeScripts = [], attributes = [] } = model;

      const isAdmin = role === 'admin';

      return m(
        '#settings-page.settings.page',
        isAdmin && [
          m(FlatButton, {
            label: edit ? 'Stop edit' : 'Edit',
            iconName: edit ? 'save' : 'edit',
            className: 'right small',
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
                : m(CastView, { cast, acts, crimeScripts: crimeScripts, setLocation: actions.setLocation }),
            },
            {
              title: 'Attributes',
              vnode: edit
                ? m(LayoutForm, {
                    form: attributesForm,
                    obj: model,
                    onchange: () => actions.saveModel(model),
                  } as FormAttributes<{ attributes: CrimeScriptAttributes[] }>)
                : m(AttributesView, { attributes, acts, crimeScripts: crimeScripts, setLocation: actions.setLocation }),
            },
          ],
        })
      );
    },
  };
};

const CastView: FactoryComponent<{
  cast: Cast[];
  acts: Act[];
  crimeScripts: CrimeScript[];
  setLocation: (currentCrimeScriptId: ID, actIdx: number, phaseIdx: number) => void;
}> = () => {
  return {
    view: ({ attrs: { cast, acts, crimeScripts, setLocation } }) => {
      return m(
        '.cast',
        m(Collapsible, {
          items: cast.map((c) => {
            const searchResults = crimeScripts.reduce((acc, cs, crimeScriptIdx) => {
              cs.stages?.forEach(({ ids }) => {
                ids.forEach((actId) => {
                  const actIdx = acts.findIndex((a) => a.id === actId);
                  if (actIdx < 0) return;
                  const act = acts[actIdx];
                  [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((phase, phaseIdx) => {
                    phase.activities?.forEach((activity, activityIdx) => {
                      const { label, cast = [] } = activity;
                      if (cast.includes(c.id)) {
                        acc.push({
                          crimeScriptIdx,
                          actIdx,
                          phaseIdx,
                          activityIdx,
                          conditionIdx: -1,
                          type: 'cast',
                          resultMd: label,
                        });
                      }
                    });
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
                  searchResults.map(({ crimeScriptIdx, actIdx, phaseIdx, resultMd, type }) =>
                    m('li', [
                      m(
                        'a.truncate',
                        {
                          style: { cursor: 'pointer' },
                          href: routingSvc.href(Pages.HOME, `id=${crimeScripts[crimeScriptIdx].id}`),
                          onclick: () => {
                            setLocation(crimeScripts[crimeScriptIdx].id, actIdx, phaseIdx);
                          },
                        },
                        `${crimeScripts[crimeScriptIdx].label} > ${type}`
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
  acts: Act[];
  attributes: CrimeScriptAttributes[];
  crimeScripts: CrimeScript[];
  setLocation: (currentCrimeScriptId: ID, actIdx: number, phaseIdx: number) => void;
}> = () => {
  return {
    view: ({ attrs: { attributes, acts, crimeScripts, setLocation } }) => {
      return m(
        '.cast',
        m(Collapsible, {
          items: attributes.map((attr) => {
            const searchResults = crimeScripts.reduce((acc, cs, crimeScriptIdx) => {
              cs.stages?.forEach(({ ids }) => {
                ids.forEach((actId) => {
                  const actIdx = acts.findIndex((a) => a.id === actId);
                  if (actIdx < 0) return;
                  const act = acts[actIdx];
                  [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((phase, phaseIdx) => {
                    phase.activities?.forEach((activity, activityIdx) => {
                      const { label, attributes = [] } = activity;
                      if (attributes.includes(attr.id)) {
                        acc.push({
                          crimeScriptIdx,
                          actIdx,
                          phaseIdx,
                          activityIdx,
                          conditionIdx: -1,
                          type: 'attribute',
                          resultMd: label,
                        });
                      }
                    });
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
                  searchResults.map(({ crimeScriptIdx, actIdx, phaseIdx, resultMd, type }) =>
                    m('li', [
                      m(
                        'a.truncate',
                        {
                          style: { cursor: 'pointer' },
                          href: routingSvc.href(Pages.HOME, `id=${crimeScripts[crimeScriptIdx].id}`),
                          onclick: () => {
                            setLocation(crimeScripts[crimeScriptIdx].id, actIdx, phaseIdx);
                          },
                        },
                        `${crimeScripts[crimeScriptIdx].label} > ${type}`
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
