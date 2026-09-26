import m from 'mithril';
import { Button, FlatButton, Icon } from 'mithril-materialized';
import {
  type DataModel,
  type ID,
  type LearningComparison,
  type LearningExercise,
  type LearningQuestion,
  Pages,
  type ScriptMode,
  compareLearningAnswer,
  generateLearningExercise,
  isLearningExerciseAvailable,
  learningScripts,
  scriptsForMode,
} from '../models';
import { fetchStarterBundle, type MeiosisComponent, t } from '../services';

const questionTitle = (kind: LearningQuestion['kind']) => {
  switch (kind) {
    case 'scene-selection': return t('LEARNING_SCENE_SELECTION_TITLE');
    case 'scene-order': return t('LEARNING_SCENE_ORDER_TITLE');
    case 'activity-selection': return t('LEARNING_ACTIVITY_TITLE');
    case 'role-selection': return t('LEARNING_ROLE_TITLE');
    case 'indicator-selection': return t('LEARNING_INDICATOR_TITLE');
    case 'measure-selection': return t('LEARNING_MEASURE_TITLE');
  }
};

const questionInstruction = (kind: LearningQuestion['kind']) => {
  switch (kind) {
    case 'scene-selection': return t('LEARNING_SCENE_SELECTION_INSTRUCTION');
    case 'scene-order': return t('LEARNING_SCENE_ORDER_INSTRUCTION');
    case 'activity-selection': return t('LEARNING_ACTIVITY_INSTRUCTION');
    case 'role-selection': return t('LEARNING_ROLE_INSTRUCTION');
    case 'indicator-selection': return t('LEARNING_INDICATOR_INSTRUCTION');
    case 'measure-selection': return t('LEARNING_MEASURE_INSTRUCTION');
  }
};

const itemLabels = (question: LearningQuestion, ids: readonly ID[]) => {
  const byId = new Map(question.candidates.map((candidate) => [candidate.id, candidate.label]));
  return ids.map((id) => byId.get(id)).filter((label): label is string => Boolean(label));
};

const uniqueById = <T extends { id: ID }>(items: readonly T[]) =>
  [...new Map(items.map((item) => [item.id, item])).values()];

export const LearningPage: MeiosisComponent = () => {
  let starterModel: DataModel | undefined;
  let starterLoading = false;
  let starterError = false;
  let selectedScriptId: ID | undefined;
  let reviewedOnly = false;
  let exercise: LearningExercise | undefined;
  let questionIndex = 0;
  let answers: Record<ID, ID[]> = {};
  let comparisons: Record<ID, LearningComparison> = {};
  let reflections: Record<ID, string> = {};

  const focusAfterRender = (selector: string) => {
    requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  };

  const clearExercise = () => {
    exercise = undefined;
    questionIndex = 0;
    answers = {};
    comparisons = {};
    reflections = {};
  };

  const loadStarter = async (scriptMode: ScriptMode) => {
    if (starterLoading || starterModel) return;
    starterLoading = true;
    starterError = false;
    try {
      starterModel = await fetchStarterBundle();
      selectedScriptId = scriptsForMode(starterModel.crimeScripts, scriptMode)
        .find(({ stages }) => stages.length > 0)?.id;
    } catch {
      starterError = true;
    } finally {
      starterLoading = false;
      m.redraw();
    }
  };

  const beginExercise = (
    scriptId: ID,
    scripts: ReturnType<typeof learningScripts>,
    cast: DataModel['cast']
  ) => {
    const script = scripts.find(({ id }) => id === scriptId);
    if (!script) return;
    const generated = generateLearningExercise(script, scripts, cast, Date.now() & 0x7fffffff);
    exercise = generated;
    questionIndex = 0;
    comparisons = {};
    reflections = {};
    answers = Object.fromEntries(generated.questions.map((question) => [
      question.id,
      question.kind === 'scene-order' ? question.candidates.map(({ id }) => id) : [],
    ]));
    focusAfterRender('.learning-question-heading h2');
  };

  const moveAnswer = (question: LearningQuestion, index: number, offset: -1 | 1) => {
    const current = [...(answers[question.id] || [])];
    const target = index + offset;
    if (target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    answers[question.id] = current;
  };

  const toggleAnswer = (question: LearningQuestion, id: ID) => {
    const current = new Set(answers[question.id] || []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    answers[question.id] = question.candidates
      .map(({ id: candidateId }) => candidateId)
      .filter((candidateId) => current.has(candidateId));
  };

  return {
    oninit: async ({ attrs: { state, actions } }) => {
      actions.setPage(Pages.LEARNING);
      const workspaceScripts = scriptsForMode(state.model.crimeScripts || [], state.scriptMode)
        .filter(({ stages }) => stages.length > 0);
      const requestedId = m.route.param('id') || state.currentCrimeScriptId;
      if (requestedId && workspaceScripts.some(({ id }) => id === requestedId)) {
        selectedScriptId = requestedId;
        return;
      }
      const starterScript = workspaceScripts.find(({ starterOrigin }) => starterOrigin);
      if (starterScript) {
        selectedScriptId = starterScript.id;
        return;
      }
      await loadStarter(state.scriptMode);
    },
    view: ({ attrs: { state } }) => {
      const workspaceScripts = scriptsForMode(state.model.crimeScripts || [], state.scriptMode);
      const starterScripts = starterModel
        ? scriptsForMode(starterModel.crimeScripts, state.scriptMode)
        : [];
      const allScripts = uniqueById([...workspaceScripts, ...starterScripts])
        .filter(({ stages }) => stages.length > 0);
      const availableScripts = learningScripts(allScripts, reviewedOnly);
      const cast = uniqueById([...(state.model.cast || []), ...(starterModel?.cast || [])]);
      if (exercise && !isLearningExerciseAvailable(exercise, allScripts)) {
        clearExercise();
        selectedScriptId = undefined;
        focusAfterRender('.learning-intro h1');
      }
      if (!exercise && allScripts.length === 0 && !starterLoading && !starterModel && !starterError) {
        void loadStarter(state.scriptMode);
      }
      const selectedScript = availableScripts.find(({ id }) => id === selectedScriptId);
      if (!selectedScript && availableScripts.length > 0) selectedScriptId = availableScripts[0].id;

      if (starterLoading) {
        return m('main.learning-page.learning-status[aria-live=polite]', [
          m(Icon, { iconName: 'hourglass_top' }),
          m('h1[tabindex=-1]', t('LEARNING', 'TITLE')),
          m('p', t('LEARNING_LOADING_STARTER')),
        ]);
      }

      if (starterError && allScripts.length === 0) {
        return m('main.learning-page.learning-status[role=alert]', [
          m(Icon, { iconName: 'error_outline' }),
          m('h1', t('LEARNING', 'TITLE')),
          m('p', t('LEARNING_LOAD_FAILED')),
        ]);
      }

      if (!exercise) {
        const currentScript = availableScripts.find(({ id }) => id === selectedScriptId);
        return m('main.learning-page', [
          m('header.learning-intro', [
            m('.learning-intro-icon[aria-hidden=true]', m(Icon, { iconName: 'school' })),
            m('.learning-intro-copy', [
              m('h1', t('LEARNING', 'TITLE')),
              m('p', t('LEARNING_INTRO')),
              starterModel && m('p.learning-starter-note', [
                m(Icon, { iconName: 'library_books' }),
                t('LEARNING_STARTER_FALLBACK'),
              ]),
            ]),
          ]),
          m('.learning-setup', [
            m('.learning-setup-copy', [
              m('h2', t('LEARNING_CHOOSE_SOURCE')),
              m('p', t('LEARNING_SOURCE_HELP')),
              m('p.learning-reference-note', [
                m(Icon, { iconName: 'compare_arrows' }),
                m('span', t('LEARNING_REFERENCE_NOTE')),
              ]),
            ]),
            m('form.learning-setup-form', [
              m('label.learning-field', [
                m('span', t('LEARNING_SOURCE')),
                m('select.browser-default', {
                  value: selectedScriptId || '',
                  onchange: (event: Event) => {
                    selectedScriptId = (event.currentTarget as HTMLSelectElement).value;
                  },
                }, availableScripts.map(({ id, label }) => m('option', { value: id }, label))),
              ]),
              m('label.learning-toggle', [
                m('input[type=checkbox]', {
                  checked: reviewedOnly,
                  onchange: (event: Event) => {
                    reviewedOnly = (event.currentTarget as HTMLInputElement).checked;
                    exercise = undefined;
                  },
                }),
                m('span', t('LEARNING_REVIEWED_ONLY')),
              ]),
              availableScripts.length === 0
                ? m('p.learning-empty[role=status]', t('LEARNING_NO_REVIEWED'))
                : [
                    currentScript && (currentScript.unreviewed || currentScript.status < 4) &&
                      m('p.learning-source-warning', [
                        m(Icon, { iconName: 'info_outline' }),
                        m('span', t('LEARNING_UNREVIEWED_REFERENCE')),
                      ]),
                    m(Button, {
                      type: 'button',
                      className: 'learning-start',
                      label: t('LEARNING_START'),
                      iconName: 'play_arrow',
                      onclick: () => {
                        if (selectedScriptId) beginExercise(selectedScriptId, availableScripts, cast);
                      },
                    }),
                  ],
            ]),
          ]),
        ]);
      }

      if (questionIndex >= exercise.questions.length) {
        const differenceCount = Object.values(comparisons).filter(({ matchesReference }) => !matchesReference).length;
        return m('main.learning-page', [
          m('section.learning-complete[aria-live=polite]', [
            m(Icon, { iconName: 'task_alt' }),
            m('h1[tabindex=-1]', t('LEARNING_COMPLETE_TITLE')),
            m('p', t('LEARNING_COMPLETE_DESCRIPTION', {
              count: exercise.questions.length,
              differences: differenceCount,
            })),
            m('p', t('LEARNING_COMPLETE_NOTE')),
            m(Button, {
              label: t('LEARNING_NEW_EXERCISE'),
              iconName: 'refresh',
              onclick: () => {
                clearExercise();
                focusAfterRender('.learning-intro h1');
              },
            }),
          ]),
        ]);
      }

      const question = exercise.questions[questionIndex];
      const answer = answers[question.id] || [];
      const comparison = comparisons[question.id];
      const referenceLabels = itemLabels(question, question.referenceIds);
      const matchedLabels = comparison ? itemLabels(question, comparison.matchedIds) : [];
      const missingLabels = comparison ? itemLabels(question, comparison.missingIds) : [];
      const additionalLabels = comparison ? itemLabels(question, comparison.additionalIds) : [];
      const answerCandidates = question.kind === 'scene-order'
        ? answer.flatMap((id) => {
            const candidate = question.candidates.find((item) => item.id === id);
            return candidate ? [candidate] : [];
          })
        : question.candidates;

      return m('main.learning-page', [
        m('header.learning-exercise-header', [
          m('.learning-exercise-heading', [
            m(FlatButton, {
              label: t('LEARNING_EXIT'),
              iconName: 'arrow_back',
              onclick: () => {
                clearExercise();
                focusAfterRender('.learning-intro h1');
              },
            }),
            m('div', [
              m('h1', exercise.scriptLabel),
              m('p', t('LEARNING_PROGRESS', {
                current: questionIndex + 1,
                total: exercise.questions.length,
              })),
            ]),
          ]),
          m('progress.learning-progress', {
            value: questionIndex + 1,
            max: exercise.questions.length,
          }),
        ]),
        m('section.learning-question', [
          m('.learning-question-heading', [
            m('h2[tabindex=-1]', questionTitle(question.kind)),
            m('p.learning-context', question.context),
            m('p', questionInstruction(question.kind)),
          ]),
          question.kind === 'scene-order'
            ? m('ol.learning-order-list', answerCandidates.map((candidate, index) =>
                m('li.learning-order-item', [
                  m('span.learning-order-number', index + 1),
                  m('span.learning-candidate-copy', [
                    m('strong', candidate.label),
                    candidate.description && m('small', candidate.description),
                  ]),
                  m('.learning-order-actions', [
                    m('button[type=button].learning-icon-button', {
                      disabled: Boolean(comparison) || index === 0,
                      title: t('LEARNING_MOVE_UP'),
                      onclick: () => moveAnswer(question, index, -1),
                    }, m(Icon, { iconName: 'arrow_upward' })),
                    m('button[type=button].learning-icon-button', {
                      disabled: Boolean(comparison) || index === answerCandidates.length - 1,
                      title: t('LEARNING_MOVE_DOWN'),
                      onclick: () => moveAnswer(question, index, 1),
                    }, m(Icon, { iconName: 'arrow_downward' })),
                  ]),
                ])
              ))
            : m('.learning-choice-list', answerCandidates.map((candidate) =>
                m('label.learning-choice', {
                  class: answer.includes(candidate.id) ? 'learning-choice--selected' : '',
                }, [
                  m('input[type=checkbox]', {
                    checked: answer.includes(candidate.id),
                    disabled: Boolean(comparison),
                    onchange: () => toggleAnswer(question, candidate.id),
                  }),
                  m('span.learning-candidate-copy', [
                    m('strong', candidate.label),
                    candidate.description && m('small', candidate.description),
                  ]),
                ])
              )),
          !comparison && m(Button, {
            className: 'learning-check',
            label: t('LEARNING_CHECK'),
            iconName: 'compare',
            onclick: () => {
              comparisons[question.id] = compareLearningAnswer(question, answer);
              focusAfterRender('.learning-feedback');
            },
          }),
          comparison && m('section.learning-feedback[aria-live=polite][tabindex=-1]', {
            class: comparison.matchesReference ? 'learning-feedback--match' : 'learning-feedback--difference',
          }, [
            m('.learning-feedback-heading', [
              m(Icon, { iconName: comparison.matchesReference ? 'check_circle' : 'difference' }),
              m('div', [
                m('h3', t(comparison.matchesReference ? 'LEARNING_MATCH_TITLE' : 'LEARNING_DIFF_TITLE')),
                m('p', t(comparison.matchesReference ? 'LEARNING_MATCH_DESCRIPTION' : 'LEARNING_DIFF_DESCRIPTION')),
              ]),
            ]),
            question.kind === 'scene-order'
              ? m('.learning-order-feedback', [
                  m('p', t('LEARNING_ORDER_PAIRS', {
                    matches: comparison.matchingOrderPairs || 0,
                    total: comparison.referenceOrderPairs || 0,
                  })),
                  m('h4', t('LEARNING_REFERENCE_ORDER')),
                  m('ol', referenceLabels.map((label) => m('li', label))),
                ])
              : m('.learning-comparison-columns', [
                  m('.learning-comparison-group', [
                    m('h4', t('LEARNING_MATCHED')),
                    matchedLabels.length
                      ? m('ul', matchedLabels.map((label) => m('li', label)))
                      : m('p', t('LEARNING_NONE')),
                  ]),
                  m('.learning-comparison-group', [
                    m('h4', t('LEARNING_MISSING')),
                    missingLabels.length
                      ? m('ul', missingLabels.map((label) => m('li', label)))
                      : m('p', t('LEARNING_NONE')),
                  ]),
                  m('.learning-comparison-group', [
                    m('h4', t('LEARNING_ADDITIONAL')),
                    additionalLabels.length
                      ? m('ul', additionalLabels.map((label) => m('li', label)))
                      : m('p', t('LEARNING_NONE')),
                  ]),
                ]),
            !comparison.matchesReference && m('label.learning-reflection', [
              m('span', t('LEARNING_REFLECTION_LABEL')),
              m('small', t('LEARNING_REFLECTION_PROMPT')),
              m('textarea', {
                value: reflections[question.id] || '',
                oninput: (event: InputEvent) => {
                  reflections[question.id] = (event.currentTarget as HTMLTextAreaElement).value;
                },
              }),
            ]),
            m(Button, {
              className: 'learning-next',
              label: questionIndex === exercise.questions.length - 1
                ? t('LEARNING_FINISH')
                : t('LEARNING_NEXT'),
              iconName: questionIndex === exercise.questions.length - 1 ? 'task_alt' : 'arrow_forward',
              onclick: () => {
                questionIndex += 1;
                focusAfterRender('.learning-question-heading h2, .learning-complete h1');
              },
            }),
          ]),
        ]),
      ]);
    },
  };
};
