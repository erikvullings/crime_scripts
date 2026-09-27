import m from 'mithril';
import { TextInput } from 'mithril-materialized';
import { type FormAttributes, LayoutForm, type UIForm } from 'mithril-ui-form';
import { type CrimeScriptFilter, Pages, scriptsForMode } from '../models';
import { attributeFilterFormFactory, crimeScriptFilterFormFactory } from '../models/forms';
import { I18N, type MeiosisComponent, routingSvc, t } from '../services';

export const CasePage: MeiosisComponent = () => {
  let crimeScriptFilterForm: UIForm<CrimeScriptFilter>;

  return {
    oninit: ({
      attrs: {
        state: { model },
        actions: { setPage },
      },
    }) => {
      const { products = [], geoLocations = [], locations = [], cast = [], attributes = [], transports = [] } = model;
      crimeScriptFilterForm = [
        ...crimeScriptFilterFormFactory(products, locations, geoLocations, 'search'),
        ...attributeFilterFormFactory(cast, attributes, transports, 'search'),
      ] as UIForm<CrimeScriptFilter>;
      setPage(Pages.CASE);
    },
    view: ({ attrs: { state, actions } }) => {
      const { caseResults = [], caseFilter, crimeScriptFilter = {} as CrimeScriptFilter, model, scriptMode } = state;
      const visibleScriptIds = new Set(scriptsForMode(model.crimeScripts, scriptMode).map(({ id }) => id));
      const visibleCaseResults = caseResults.filter(({ scriptId }) => visibleScriptIds.has(scriptId));
      const { update } = actions;

      return m('#case-page.row.case.page', [
        m(LayoutForm, {
          form: crimeScriptFilterForm,
          obj: crimeScriptFilter,
          onchange: () => {
            actions.update({ crimeScriptFilter });
          },
          i18n: I18N,
        } as FormAttributes<CrimeScriptFilter>),
        m('.col.s12', [
          m(TextInput, {
            label: t('FOUND_ITEMS'),
            iconName: 'search',
            className: 'center-align',
            defaultValue: caseFilter,
            onchange: (v) => {
              // const caseTags = tags.map((tag) => tag.tag);
              update({ caseFilter: v });
            },
          }),
        ]),
        visibleCaseResults &&
          m('.col.s12', [
            m('p', t('HITS', visibleCaseResults.length)),
            visibleCaseResults.length > 0 && [
              m(
                'ol',
                visibleCaseResults.map(({ scriptId, score, scenes }) => {
                  const script = model.crimeScripts.find(({ id }) => id === scriptId);
                  return script && m(
                    'li',
                    `${script.label} (score ${score})`,
                    scenes.length > 0 && m(
                      'ul.browser-default',
                      scenes.map((scene) =>
                        m(
                          'li',
                          m(
                            'a.truncate',
                            {
                              style: { cursor: 'pointer' },
                              href: routingSvc.href(Pages.CRIME_SCRIPT, `id=${script.id}`),
                              onclick: () => {
                                if (scene.variantId) {
                                  actions.setLocation(script.id, scene.variantId, scene.sceneId);
                                }
                              },
                            },
                            `${scene.variantLabel || scene.sceneLabel} (score: ${scene.strength})`
                          )
                        )
                      )
                    )
                  );
                })
              ),
            ],
          ]),
      ]);
    },
  };
};
