import m, { FactoryComponent } from 'mithril';
import { CrimeScript, ID, Pages, SearchResult, Act, Hierarchical, Labeled, SearchType, DataModel } from '../models';
import { MeiosisComponent, routingSvc, t } from '../services';
import { deepCopy, FormAttributes, LayoutForm, SlimdownView } from 'mithril-ui-form';
import { Collapsible, FlatButton, Tabs } from 'mithril-materialized';
import { attrForm, AttributeType } from '../models/forms';
import { TextInputWithClear } from './ui/text-input-with-clear';

export const SettingsPage: MeiosisComponent = () => {
  let edit = false;
  let storedModel: DataModel;

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
      const { model, role, attributeFilter } = state;
      const {
        cast = [],
        acts = [],
        crimeScripts = [],
        attributes = [],
        products = [],
        transports = [],
        locations = [],
        geoLocations = [],
      } = model;

      const labelFilter = attributeFilter ? attributeFilter.toLowerCase() : undefined;

      const isAdmin = role === 'admin';

      const tabs = [
        [
          'cast',
          t('CAST'),
          'cast',
          'person',
          cast.filter((a) => !labelFilter || (a.label && a.label.toLowerCase().includes(labelFilter))),
        ],
        [
          'attributes',
          t('ATTRIBUTES'),
          'attribute',
          'build',
          attributes.filter((a) => !labelFilter || (a.label && a.label.toLowerCase().includes(labelFilter))),
        ],
        [
          'products',
          t('PRODUCTS'),
          'product',
          'shopping_bag',
          products.filter((a) => !labelFilter || (a.label && a.label.toLowerCase().includes(labelFilter))),
        ],
        [
          'transports',
          t('TRANSPORTS'),
          'transport',
          'directions_car',
          transports.filter((a) => !labelFilter || (a.label && a.label.toLowerCase().includes(labelFilter))),
        ],
        [
          'locations',
          t('LOCATIONS'),
          'location',
          'warehouse',
          locations.filter((a) => !labelFilter || (a.label && a.label.toLowerCase().includes(labelFilter))),
        ],
        [
          'geoLocations',
          t('GEOLOCATIONS'),
          'geolocation',
          'location_on',
          geoLocations.filter((a) => !labelFilter || (a.label && a.label.toLowerCase().includes(labelFilter))),
        ],
      ] as Array<
        [id: AttributeType, label: string, type: SearchType, iconName: string, attrs: Array<Hierarchical & Labeled>]
      >;

      return m(
        '#settings-page.settings.page.row',
        m(TextInputWithClear, {
          id: 'search',
          className: 'col s6',
          style: 'height: 50px',
          label: t('SEARCH'),
          onchange: () => {},
          iconName: 'filter_alt',
          initialValue: attributeFilter,
          oninput: (v) => {
            actions.setAttributeFilter(v);
          },
        }),
        isAdmin && [
          m(FlatButton, {
            label: edit ? t('SAVE_BUTTON', 'LABEL') : t('EDIT_BUTTON', 'LABEL'),
            iconName: edit ? 'save' : 'edit',
            className: 'right small',
            onclick: () => {
              edit = !edit;
              if (edit) {
                storedModel = deepCopy(model);
              } else {
                actions.saveModel(model);
              }
            },
          }),
          edit &&
            m(FlatButton, {
              label: t('CANCEL'),
              iconName: 'cancel',
              className: 'right small',
              onclick: () => {
                edit = false;
                actions.saveModel(storedModel);
              },
            }),
        ],
        m(Tabs, {
          tabs: tabs.map(([id, label, type, iconName, attr]) => {
            return {
              id: label,
              title: `${label} (${attr.length})`,
              vnode: edit
                ? m(LayoutForm, {
                    form: attrForm(id, label, attr),
                    obj: model,
                  } as FormAttributes<any>)
                : m(AttrView, {
                    attr,
                    type,
                    iconName,
                    acts,
                    crimeScripts,
                    setLocation: actions.setLocation,
                  }),
            };
          }),
        })
      );
    },
  };
};

const AttrView: FactoryComponent<{
  attr: Array<Hierarchical & Labeled>;
  type: SearchType;
  iconName?: string;
  acts: Act[];
  crimeScripts: CrimeScript[];
  setLocation: (currentCrimeScriptId: ID, actIdx: number, phaseIdx: number) => void;
}> = () => {
  return {
    view: ({ attrs: { attr, type, iconName, acts, crimeScripts, setLocation } }) => {
      return m(
        '.attr',
        m(Collapsible, {
          items: attr
            .sort((a, b) => a.label?.localeCompare(b.label))
            .map((c) => {
              const searchResults = crimeScripts.reduce((acc, cs, crimeScriptIdx) => {
                cs.stages?.forEach(({ ids }) => {
                  ids.forEach((actId) => {
                    const actIdx = acts.findIndex((a) => a.id === actId);
                    if (actIdx < 0) return;
                    const act = acts[actIdx];
                    [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((phase, phaseIdx) => {
                      if (type === 'location') {
                        if (phase.locationIds) {
                          acc.push({
                            crimeScriptIdx,
                            actIdx,
                            phaseIdx,
                            activityIdx: -1,
                            conditionIdx: -1,
                            type,
                            resultMd: phase.label,
                          });
                        }
                      } else {
                        phase.activities?.forEach((activity, activityIdx) => {
                          if (type === 'cast') {
                            const { label, cast = [] } = activity;
                            if (cast.includes(c.id)) {
                              acc.push({
                                crimeScriptIdx,
                                actIdx,
                                phaseIdx,
                                activityIdx,
                                conditionIdx: -1,
                                type,
                                resultMd: label,
                              });
                            }
                          } else if (type === 'attribute') {
                            const { label, attributes = [] } = activity;
                            if (attributes.includes(c.id)) {
                              acc.push({
                                crimeScriptIdx,
                                actIdx,
                                phaseIdx,
                                activityIdx,
                                conditionIdx: -1,
                                type,
                                resultMd: label,
                              });
                            }
                          }
                        });
                      }
                    });
                  });
                });
                return acc;
              }, [] as SearchResult[]);

              return {
                header: m.trust(
                  `${c.label}${c.synonyms ? ` (${c.synonyms.join(', ')})` : ''}, hits: ${searchResults.length}${
                    c.parents
                      ? `<br>${attr
                          .filter((a) => c.parents!.includes(a.id))
                          .map((a) => a.label)
                          .join(', ')}`
                      : ''
                  }`
                ),
                iconName,
                body: m(
                  '.cast-content',
                  m(
                    'ol',
                    searchResults.map(({ crimeScriptIdx, actIdx, phaseIdx, resultMd }) => {
                      const crimeScript = crimeScripts[crimeScriptIdx];
                      const act = actIdx >= 0 ? acts[actIdx] : undefined;
                      const actLabel = act ? act.label : '...';

                      return m('li', [
                        m(
                          'a.truncate',
                          {
                            style: { cursor: 'pointer' },
                            href: routingSvc.href(Pages.CRIME_SCRIPT, `id=${crimeScript.id}`),
                            onclick: () => {
                              setLocation(crimeScript.id, actIdx, phaseIdx);
                            },
                          },
                          `${crimeScript.label} > ${actLabel}`
                        ),
                        m(SlimdownView, { md: resultMd, removeParagraphs: true }),
                      ]);
                    })
                  )
                ),
              };
            }),
        })
      );
    },
  };
};
