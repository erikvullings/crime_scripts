import m from 'mithril';
import lz from 'lz-string';
import { Button, Icon, padLeft } from 'mithril-materialized';
import background from '../assets/background.jpg';
import { MeiosisComponent, routingSvc } from '../services';
import { DataModel, Pages } from '../models';
import { formatDate } from '../utils';

const readerAvailable = window.File && window.FileReader && window.FileList && window.Blob;

export const LandingPage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.LANDING);
    },
    view: ({}) => [
      m('.center', { style: 'position: relative;' }, [
        // m(
        //   '.overlay.center',
        //   {
        //     style: 'position: absolute; width: 100%',
        //   },
        //   [
        //     m('h3.indigo-text.text-darken-4.bold.hide-on-med-and-down', 'Introduction'),
        //   ]
        // ),
        m('img.responsive-img', { src: background }),
        m(
          '.section.white',
          m('.row.container.center', [
            m('.row', [
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'handshake' })),
                  m('h5.center', 'TODO'),
                  m('p.light', 'TODO'),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'front_hand' })),
                  m('h5.center', 'TODO'),
                  m('p.light', `TODO`),
                ])
              ),
              m(
                '.col.s12.m4',
                m('.intro-block', [
                  m('.center', m(Icon, { iconName: 'map' })),
                  m('h5.center', 'TODO'),
                  m('p.light', 'TODO'),
                ])
              ),
            ]),
          ])
        ),
      ]),
    ],
  };
};
