import m, { FactoryComponent } from 'mithril';
import { MeiosisComponent } from '../../services';

export const SideNav: MeiosisComponent = () => {
  return {
    view: (/* { attrs: { state, actions } } */) =>
      m('#slide-out.sidenav', {
        oncreate: ({ dom }) => {
          M.Sidenav.init(dom);
        },
      }),
  };
};

export const SideNavTrigger: FactoryComponent<{}> = () => {
  return {
    view: () =>
      m(
        'a',
        {
          href: '#',
          'data-target': 'slide-out',
          class: 'sidenav-trigger',
          style: 'position: absolute;margin-left: 10px;top: 70px;',
        },
        [m('i.material-icons', 'menu')]
      ),
  };
};
