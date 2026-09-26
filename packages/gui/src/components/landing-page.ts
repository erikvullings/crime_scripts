import m from 'mithril';
import { Button, Icon } from 'mithril-materialized';
import guidePoster from '../../../../documentation/assets/user-guide/02-script-view.png';
import guideVideo from '../../../../documentation/assets/user-guide/pax-handleiding.webm';
import restrictedCliVideo from '../../../../documentation/assets/restricted-cli/restricted-witwassen-cli.webm';
import background from '../assets/background.webp';
import { Pages } from '../models';
import { APP_TITLE, type MeiosisComponent, t } from '../services';

// const readerAvailable = window.File && window.FileReader && window.FileList && window.Blob;

const USER_GUIDE_URL =
  'https://github.com/TNO/crime_scripts/blob/main/documentation/handleiding.nl.md';
const RESTRICTED_CLI_GUIDE_URL =
  'https://github.com/TNO/crime_scripts/blob/main/documentation/restricted-witwassen-cli.nl.md';

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
            m('a.landing-guide-action', {
              href: USER_GUIDE_URL,
              target: '_blank',
              rel: 'noopener noreferrer',
            }, [
              m('i.material-icons[aria-hidden=true]', 'menu_book'),
              m('span', t('LANDING_GUIDE_OPEN')),
              m('i.material-icons.landing-guide-action-trailing[aria-hidden=true]', 'open_in_new'),
            ]),
            m('details.landing-guide-advanced', [
              m('summary', [
                m('i.material-icons[aria-hidden=true]', 'shield'),
                m('span', t('LANDING_GUIDE_ADVANCED_TITLE')),
              ]),
              m('.landing-guide-advanced-content', [
                m('p', t('LANDING_GUIDE_ADVANCED_DESCRIPTION')),
                m('.landing-guide-advanced-actions', [
                  m('a', {
                    href: RESTRICTED_CLI_GUIDE_URL,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }, [
                    m('i.material-icons[aria-hidden=true]', 'terminal'),
                    m('span', t('LANDING_GUIDE_CLI_OPEN')),
                  ]),
                  m('a', {
                    href: restrictedCliVideo,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }, [
                    m('i.material-icons[aria-hidden=true]', 'play_circle'),
                    m('span', t('LANDING_GUIDE_CLI_VIDEO')),
                  ]),
                ]),
              ]),
            ]),
          ]),
          m('figure.landing-guide-preview', [
            m('video[controls][playsinline][preload=metadata][width=1440][height=900]', {
              poster: guidePoster,
              'aria-label': t('LANDING_GUIDE_VIDEO_LABEL'),
            }, m('source', { src: guideVideo, type: 'video/webm' })),
            m('figcaption', t('LANDING_GUIDE_VIDEO_CAPTION')),
          ]),
        ]),
      ]),
    ],
  };
};
