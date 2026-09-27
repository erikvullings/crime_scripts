import m from 'mithril';
import { Button, Icon } from 'mithril-materialized';
import background from '../assets/background.webp';
import { Pages } from '../models';
import { APP_TITLE, type MeiosisComponent, t } from '../services';
import { routingSvc } from '../services/routing-service';

// const readerAvailable = window.File && window.FileReader && window.FileList && window.Blob;

export const LandingPage: MeiosisComponent = () => {
  let starterLoading = false;

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.LANDING);
    },
    view: ({ attrs: { actions } }) => [
      m('.center', [
        m('.landing-hero', [
          m('img.landing-hero-image[width=1408][height=704]', { src: background, alt: '' }),
          m('.landing-hero-content', [
            m('h1', APP_TITLE),
            m('p', t('LANDING_CTA_DESCRIPTION')),
            m('.landing-hero-actions', [
              m(Button, {
                className: 'landing-hero-cta',
                label: starterLoading ? t('LOADING_STARTER') : t('USE_STARTER'),
                iconName: 'library_books',
                disabled: starterLoading,
                onclick: async () => {
                  starterLoading = true;
                  const imported = await actions.importStarterLibrary();
                  starterLoading = false;
                  if (imported) actions.changePage(Pages.HOME);
                },
              }),
              m(Button, {
                className: 'landing-hero-cta landing-hero-cta--secondary',
                label: t('GO_TO_HOME'),
                iconName: 'home',
                onclick: () => actions.changePage(Pages.HOME),
              }),
            ]),
          ]),
        ]),
        m('section.landing-learning.container[aria-labelledby=landing-learning-title]', [
          m('.landing-learning-icon[aria-hidden=true]', m(Icon, { iconName: 'school' })),
          m('.landing-learning-copy', [
            m('h2#landing-learning-title', t('LANDING_LEARNING_TITLE')),
            m('p', t('LANDING_LEARNING_DESCRIPTION')),
          ]),
          m(Button, {
            className: 'landing-learning-action',
            label: t('LANDING_LEARNING_ACTION'),
            iconName: 'arrow_forward',
            onclick: () => actions.changePage(Pages.LEARNING),
          }),
        ]),
        m(
          '.section',
          m('.row.container.center', [
            m('.row', [
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'cases' })),
                  m('h5.center', t('LANDING_CASES', 'TITLE')),
                  m('p.light', t('LANDING_CASES', 'DESC')),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'handshake' })),
                  m('h5.center', t('LANDING_HAND', 'TITLE')),
                  m('p.light', t('LANDING_HAND', 'DESC')),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'security' })),
                  m('h5.center', t('LANDING_SECURITY', 'TITLE')),
                  m('p.light', t('LANDING_SECURITY', 'DESC')),
                ])
              ),
            ]),
          ])
        ),
        m('section.landing-guide.container[aria-labelledby=landing-guide-title]', [
          m('.landing-guide-copy', [
            m('h2#landing-guide-title', t('LANDING_GUIDE_TITLE')),
            m('p', t('LANDING_GUIDE_DESCRIPTION')),
          ]),
          m('a.landing-guide-action', { href: routingSvc.href(Pages.GUIDE) }, [
            m('i.material-icons[aria-hidden=true]', 'menu_book'),
            m('span', t('LANDING_GUIDE_OPEN')),
            m('i.material-icons.landing-guide-action-trailing[aria-hidden=true]', 'arrow_forward'),
          ]),
        ]),
      ]),
    ],
  };
};
