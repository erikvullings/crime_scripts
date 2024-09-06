import m, { FactoryComponent } from 'mithril';
import { Act, Cast, CrimeScript, ID, Pages, scriptIcon } from '../models';
import { MeiosisComponent, routingSvc } from '../services';
import { FlatButton, uniqueId, Icon } from 'mithril-materialized';
import { t } from '../services/translations';

export const HomePage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.HOME);
    },
    view: ({ attrs: { state, actions } }) => {
      const { model, role } = state;
      const { crimeScripts = [] } = model;
      const isAdmin = role === 'admin';

      return m('#home-page.row.home.page', [
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
            ...crimeScripts.map(({ url = scriptIcon, label, description, id }) => {
              const onclick = () => {
                actions.changePage(Pages.CRIME_SCRIPT, { id });
                actions.update({ currentCrimeScriptId: id });
              };
              return m('li.collection-item.avatar.cursor-pointer', { onclick }, [
                m('img.circle', { src: url, alt: 'Avatar' }),
                m('span.title', label),
                m('p', description),
                m(
                  'a.secondary-content',
                  { href: routingSvc.href(Pages.CRIME_SCRIPT, `id=${id}`) },
                  m(Icon, { iconName: 'more_horiz' })
                ),
              ]);
            }),
          ])
          // crimeScripts.map((crimeScript) =>
          //   m(CrimeScriptCard, { crimeScript, cast, acts, changePage: actions.changePage })
          // )
        ),
      ]);
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
