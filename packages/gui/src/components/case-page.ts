import m from 'mithril';
import { Button, FlatButton, Icon } from 'mithril-materialized';
import { type FormAttributes, LayoutForm, type UIForm } from 'mithril-ui-form';
import {
  type CaseEvidenceMatch,
  type CaseMatchResult,
  type CrimeScript,
  type CrimeScriptFilter,
  Pages,
  compareCaseHypotheses,
  matchCaseEvidence,
} from '../models';
import { attributeFilterFormFactory, crimeScriptFilterFormFactory } from '../models/forms';
import { I18N, type MeiosisComponent, routingSvc, t, tokenizeForLanguage } from '../services';

const emptyFilters = (): CrimeScriptFilter => ({
  productIds: [],
  geoLocationIds: [],
  locationIds: [],
  roleIds: [],
  attributeIds: [],
  transportIds: [],
});

const hasSelectedFilters = (filters: CrimeScriptFilter) =>
  Object.values(filters).some((ids) => ids.length > 0);

const fitLabel = (score: number) =>
  score >= 85
    ? t('CASE_FIT_BROAD')
    : score >= 60
      ? t('CASE_FIT_PARTIAL')
      : t('CASE_FIT_LIMITED');

const matchContext = ({ evidence, locations }: CaseEvidenceMatch) => {
  const labels = [...new Set(
    locations
      .map(({ variantLabel, sceneLabel, label }) => variantLabel || sceneLabel || label)
      .filter((label) => label && label !== evidence.label)
  )];
  return labels.slice(0, 2).join(' · ');
};

const reviewedScript = (script: CrimeScript) => script.status >= 4 && script.unreviewed !== true;

export const CasePage: MeiosisComponent = () => {
  let crimeScriptFilterForm: UIForm<CrimeScriptFilter>;
  let evidenceText = '';
  let filters = emptyFilters();
  let results: CaseMatchResult[] = [];
  let hasSearched = false;
  let inputError = false;
  let formVersion = 0;
  let resultContext = '';
  let selectedScriptIds = new Set<string>();
  let analystNotes = new Map<string, string>();

  const focusAfterRender = (selector: string) => {
    requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  };

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
      const { model, scriptMode } = state;
      const currentContext = `${model.lastUpdate}:${scriptMode}`;
      const runSearch = () => {
        if (!evidenceText.trim() && !hasSelectedFilters(filters)) {
          inputError = true;
          focusAfterRender('#case-observations');
          return;
        }
        inputError = false;
        hasSearched = true;
        resultContext = currentContext;
        results = matchCaseEvidence({
          model,
          scriptMode,
          text: evidenceText,
          filters,
          tokenize: tokenizeForLanguage,
        });
        selectedScriptIds = new Set(
          [...selectedScriptIds].filter((scriptId) =>
            results.some((result) => result.scriptId === scriptId)
          )
        );
        focusAfterRender('.case-results-heading');
      };
      const clearSearch = () => {
        evidenceText = '';
        filters = emptyFilters();
        results = [];
        hasSearched = false;
        inputError = false;
        formVersion += 1;
        selectedScriptIds = new Set();
        analystNotes = new Map();
        focusAfterRender('#case-observations');
      };
      if (hasSearched && resultContext !== currentContext) runSearch();

      const scriptsById = new Map(model.crimeScripts.map((script) => [script.id, script]));
      const selectedResults = results.filter(({ scriptId }) => selectedScriptIds.has(scriptId));
      const comparison = compareCaseHypotheses({ model, results: selectedResults });
      const comparisonReady = selectedResults.length >= 2;

      return m('main#case-page.case-page', [
        m('header.case-intro', [
          m('h1', t('CASE_HEADING')),
          m('p', t('CASE_INTRO')),
          m('.case-privacy-note', [
            m(Icon, { iconName: 'lock_outline' }),
            m('span', t('CASE_PRIVACY')),
          ]),
        ]),
        m('section.case-evidence-workspace[aria-labelledby=case-evidence-heading]', [
          m('.case-evidence-copy', [
            m('h2#case-evidence-heading', t('CASE_EVIDENCE_HEADING')),
            m('p', t('CASE_OBSERVATIONS_HINT')),
            m('label.case-evidence-label[for=case-observations]', t('CASE_OBSERVATIONS_LABEL')),
            m('textarea#case-observations', {
              value: evidenceText,
              rows: 6,
              'aria-describedby': inputError ? 'case-input-error' : undefined,
              'aria-invalid': inputError ? 'true' : undefined,
              oninput: (event: InputEvent) => {
                evidenceText = (event.target as HTMLTextAreaElement).value;
                inputError = false;
              },
            }),
            inputError && m('p#case-input-error.case-input-error[role=alert]', t('CASE_INPUT_REQUIRED')),
          ]),
          m('.case-filter-panel', [
            m('h2', { key: 'heading' }, t('CASE_FILTERS_HEADING')),
            m('p', { key: 'hint' }, t('CASE_FILTERS_HINT')),
            m('.case-filter-fields.row', { key: `filters-${formVersion}` }, m(LayoutForm, {
              form: crimeScriptFilterForm,
              obj: filters,
              onchange: () => {
                inputError = false;
              },
              i18n: I18N,
            } as FormAttributes<CrimeScriptFilter>)),
          ]),
          m('.case-actions', [
            m(Button, {
              type: 'button',
              label: t('CASE_SEARCH_ACTION'),
              iconName: 'manage_search',
              onclick: runSearch,
            }),
            m(FlatButton, {
              type: 'button',
              label: t('CASE_CLEAR_ACTION'),
              iconName: 'restart_alt',
              disabled: !evidenceText && !hasSelectedFilters(filters) && !hasSearched,
              onclick: clearSearch,
            }),
          ]),
        ]),
        !hasSearched && m('section.case-empty-state[aria-labelledby=case-initial-heading]', [
          m(Icon, { iconName: 'travel_explore' }),
          m('div', [
            m('h2#case-initial-heading', t('CASE_INITIAL_HEADING')),
            m('p', t('CASE_INITIAL_BODY')),
          ]),
        ]),
        hasSearched && m('section.case-results[aria-live=polite]', [
          m('.case-results-heading[tabindex=-1]', [
            m('div', [
              m('h2', t('CASE_RESULTS_HEADING')),
              m('p', t('CASE_RESULTS_SUMMARY', results.length)),
            ]),
            m('.case-hypothesis-note', [
              m(Icon, { iconName: 'info_outline' }),
              m('span', t('CASE_HYPOTHESIS_NOTICE')),
            ]),
          ]),
          results.length === 0
            ? m('.case-no-results', [
              m(Icon, { iconName: 'search_off' }),
              m('div', [
                m('h3', t('CASE_NO_MATCHES_TITLE')),
                m('p', t('CASE_NO_MATCHES_BODY')),
              ]),
            ])
            : m('.case-result-list', results.map((result, index) => {
              const script = scriptsById.get(result.scriptId);
              if (!script) return null;
              const selected = selectedScriptIds.has(result.scriptId);
              const selectionLimitReached = !selected && selectedScriptIds.size >= 3;
              const hasPartialEvidence = result.matchedEvidence.some(
                ({ termCoverage }) => termCoverage !== undefined && termCoverage < 1
              );
              const coverageLabel = t(
                hasPartialEvidence
                  ? 'CASE_EVIDENCE_COVERAGE_PARTIAL'
                  : 'CASE_EVIDENCE_COVERAGE',
                {
                  matched: result.matchedEvidence.length,
                  total: result.matchedEvidence.length + result.unmatchedEvidence.length,
                }
              );
              return m('article.case-result', { key: result.scriptId }, [
                m('.case-result-header', [
                  m('.case-result-rank[aria-hidden=true]', index + 1),
                  m('.case-result-title', [
                    m('h3', script.label),
                    m('.case-result-meta', [
                      m('span', script.language.toUpperCase()),
                      m('span', t(script.classification === 'restricted' ? 'RESTRICTED' : 'PUBLIC')),
                      m('span', t(reviewedScript(script) ? 'REVIEWED' : 'UNREVIEWED')),
                    ]),
                    results.length > 1 && m('label.case-compare-choice', [
                      m('input[type=checkbox]', {
                        checked: selected,
                        disabled: selectionLimitReached,
                        onchange: (event: InputEvent) => {
                          const checked = (event.target as HTMLInputElement).checked;
                          if (checked && selectedScriptIds.size < 3) {
                            selectedScriptIds.add(result.scriptId);
                          } else if (!checked) {
                            selectedScriptIds.delete(result.scriptId);
                          }
                        },
                      }),
                      m('span', t('CASE_COMPARE_INCLUDE')),
                    ]),
                  ]),
                  m('.case-fit', [
                    m('strong', fitLabel(result.score)),
                    m('span', coverageLabel),
                    m('meter', {
                      min: 0,
                      max: 1,
                      value: result.coverage,
                      'aria-label': coverageLabel,
                    }),
                  ]),
                ]),
                m('.case-result-detail', {
                  class: result.unmatchedEvidence.length === 0 ? 'is-single' : '',
                }, [
                  m('section', [
                    m('h4', t('CASE_MATCHED_HEADING')),
                    m('ul.case-evidence-list', result.matchedEvidence.map((match) => {
                      const context = matchContext(match);
                      const partial =
                        match.termCoverage !== undefined && match.termCoverage < 1;
                      return m('li', { class: partial ? 'case-evidence-partial' : '' }, [
                        m(Icon, { iconName: partial ? 'adjust' : 'check_circle' }),
                        m('span', [
                          m('strong', match.evidence.label),
                          m('small.case-evidence-completeness',
                            t(partial ? 'CASE_PARTIAL_MATCH' : 'CASE_FULL_MATCH')
                          ),
                          context && m('small', context),
                          partial && m('small.case-evidence-parts', [
                            m('span', t('CASE_MATCHED_PARTS', {
                              terms: match.matchedTerms?.join(', ') || '',
                            })),
                            m('span', t('CASE_MISSING_PARTS', {
                              terms: match.unmatchedTerms?.join(', ') || '',
                            })),
                          ]),
                        ]),
                      ]);
                    })),
                  ]),
                  result.unmatchedEvidence.length > 0 && m('section', [
                    m('h4', t('CASE_UNMATCHED_HEADING')),
                    m('ul.case-evidence-list.case-evidence-list--unmatched',
                      result.unmatchedEvidence.map(({ id, label }) =>
                        m('li', { key: id }, [
                          m(Icon, { iconName: 'help_outline' }),
                          m('span', label),
                        ])
                      ),
                    ),
                  ]),
                ]),
                result.scenes.length > 0 && m('section.case-scenes', [
                  m('h4', t('CASE_RELEVANT_SCENES')),
                  m('ul', result.scenes.slice(0, 3).map((scene) =>
                    m('li', [
                      m('a', {
                        href: routingSvc.href(Pages.CRIME_SCRIPT, `id=${script.id}`),
                        onclick: () => {
                          if (scene.variantId) {
                            actions.setLocation(script.id, scene.variantId, scene.sceneId);
                          }
                        },
                      }, scene.variantLabel
                        && scene.variantLabel !== scene.sceneLabel
                        ? `${scene.sceneLabel} — ${scene.variantLabel}`
                        : scene.sceneLabel),
                      m('span', t('CASE_SCENE_MATCHES', scene.matchedEvidenceIds.length)),
                    ])
                  )),
                ]),
                m('.case-result-actions', [
                  m('a.btn-flat', {
                    href: routingSvc.href(Pages.CRIME_SCRIPT, `id=${script.id}`),
                  }, [
                    m(Icon, { iconName: 'menu_book' }),
                    t('CASE_OPEN_SCRIPT'),
                  ]),
                ]),
              ]);
            })),
          results.length > 0 && m('section.case-compare-toolbar[aria-labelledby=case-compare-heading]', [
            m('div', [
              m('h3#case-compare-heading', t('CASE_COMPARE_HEADING')),
              m('p', results.length === 1
                ? t('CASE_COMPARE_SINGLE')
                : t('CASE_COMPARE_INTRO')),
            ]),
            results.length > 1 && m('.case-compare-toolbar-actions', [
              m('p[aria-live=polite]', t('CASE_COMPARE_SELECTION_COUNT', selectedScriptIds.size)),
              selectedScriptIds.size >= 3 && m('small', t('CASE_COMPARE_LIMIT')),
              comparisonReady && m(Button, {
                type: 'button',
                label: t('CASE_COMPARE_VIEW'),
                iconName: 'compare_arrows',
                onclick: () => focusAfterRender('#case-comparison'),
              }),
            ]),
          ]),
          comparisonReady && m('section#case-comparison.case-comparison[tabindex=-1][aria-labelledby=case-comparison-heading]', [
            m('.case-comparison-header', [
              m('div', [
                m('h3#case-comparison-heading', t('CASE_COMPARISON_HEADING', selectedResults.length)),
                m('p', t('CASE_COMPARISON_NOTICE')),
              ]),
              m(Icon, { iconName: 'difference' }),
            ]),
            m('.case-comparison-summary', [
              m('section', [
                m('h4', t('CASE_SHARED_HEADING')),
                comparison.sharedEvidence.length > 0
                  ? m('ul.case-comparison-evidence', comparison.sharedEvidence.map(({ id, label }) =>
                    m('li', { key: id }, label)
                  ))
                  : m('p', t('CASE_SHARED_EMPTY')),
              ]),
              m('section', [
                m('h4', t('CASE_UNEXPLAINED_COMPARISON_HEADING')),
                comparison.unexplainedEvidence.length > 0
                  ? m('ul.case-comparison-evidence.case-comparison-evidence--unexplained',
                    comparison.unexplainedEvidence.map(({ id, label }) =>
                      m('li', { key: id }, label)
                    )
                  )
                  : m('p', t('CASE_UNEXPLAINED_EMPTY')),
              ]),
            ]),
            m('.case-comparison-grid', comparison.candidates.map((candidate) => {
              const script = scriptsById.get(candidate.scriptId);
              if (!script) return null;
              return m('article.case-comparison-candidate', { key: candidate.scriptId }, [
                m('h4', script.label),
                m('section', [
                  m('h5', t('CASE_DISTINGUISHING_HEADING')),
                  candidate.distinguishingEvidence.length > 0
                    ? m('ul.case-comparison-evidence',
                      candidate.distinguishingEvidence.map(({ evidence }) =>
                        m('li', { key: evidence.id }, evidence.label)
                      )
                    )
                    : m('p', t('CASE_DISTINGUISHING_EMPTY')),
                ]),
                candidate.scenes.length > 0 && m('section.case-comparison-scenes', [
                  m('h5', t('CASE_COMPARE_SCENES')),
                  m('ul', candidate.scenes.slice(0, 3).map((scene) =>
                    m('li', { key: `${scene.sceneId}:${scene.variantId || ''}` }, [
                      m('a', {
                        href: routingSvc.href(Pages.CRIME_SCRIPT, `id=${script.id}`),
                        onclick: () => {
                          if (scene.variantId) {
                            actions.setLocation(script.id, scene.variantId, scene.sceneId);
                          }
                        },
                      }, scene.variantLabel
                        && scene.variantLabel !== scene.sceneLabel
                        ? `${scene.sceneLabel} — ${scene.variantLabel}`
                        : scene.sceneLabel),
                    ])
                  )),
                ]),
                m('label.case-analyst-note', [
                  m('span', t('CASE_ANALYST_NOTE')),
                  m('textarea', {
                    rows: 4,
                    value: analystNotes.get(candidate.scriptId) || '',
                    placeholder: t('CASE_ANALYST_NOTE_PLACEHOLDER'),
                    oninput: (event: InputEvent) => {
                      analystNotes.set(
                        candidate.scriptId,
                        (event.target as HTMLTextAreaElement).value
                      );
                    },
                  }),
                ]),
              ]);
            })),
            m('section.case-follow-up[aria-labelledby=case-follow-up-heading]', [
              m('.case-follow-up-heading', [
                m(Icon, { iconName: 'fact_check' }),
                m('div', [
                  m('h4#case-follow-up-heading', t('CASE_FOLLOW_UP_HEADING')),
                  m('p', t('CASE_FOLLOW_UP_NOTICE')),
                ]),
              ]),
              comparison.followUpPrompts.length > 0
                ? m('ol', comparison.followUpPrompts.map((prompt) => {
                  const labels = prompt.scriptIds
                    .map((scriptId) => scriptsById.get(scriptId)?.label)
                    .filter((label): label is string => Boolean(label));
                  return m('li', { key: prompt.id }, [
                    m('strong', t('CASE_FOLLOW_UP_QUESTION', { label: prompt.label })),
                    m('span', t('CASE_APPEARS_IN', { scripts: labels.join(', ') })),
                  ]);
                }))
                : m('p', t('CASE_FOLLOW_UP_EMPTY')),
            ]),
          ]),
        ]),
      ]);
    },
  };
};
