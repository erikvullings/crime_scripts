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
        ),
      ]);
    },
  };
};
