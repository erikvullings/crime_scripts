import m, { FactoryComponent } from 'mithril';
import { Act, Cast, CrimeScript, ID, Pages, scriptIcon } from '../models';
import { MeiosisComponent, routingSvc } from '../services';
import { FlatButton, uniqueId, ModalPanel, Icon } from 'mithril-materialized';
import { t } from '../services/translations';
import { toWord } from '../utils/word';
import { formatDate } from '../utils';
import { CrimeScriptEditor } from './ui/crime-script-editor';
import { CrimeScriptViewer } from './ui/crime-script-viewer';

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
                    : m(CrimeScriptViewer, {
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
