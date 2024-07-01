import m from 'mithril';
import { Icon } from 'mithril-materialized';
import logo from '../assets/logo.svg';
import { Pages, Page } from '../models';
import { routingSvc } from '../services/routing-service';
import { APP_TITLE, MeiosisComponent } from '../services';
import { SideNav, SideNavTrigger } from './ui/sidenav';
import { TextInputWithClear } from './ui/text-input-with-clear';
import { SlimdownView } from 'mithril-ui-form';

export const Layout: MeiosisComponent = () => {
  const style = 'font-size: 2.2rem; width: 4rem;';
  let searchDialog: M.Modal;
  let textInput: HTMLInputElement;

  document.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key !== '/' || searchDialog?.isOpen) return;
    ev.preventDefault(); // Prevent the slash key from being inputted into input fields
    searchDialog.open();
    textInput.focus();
  });

  return {
    view: ({ children, attrs: { state, actions } }) => {
      const { page, searchFilter, searchResults, model } = state;
      const { changePage, setSearchFilter } = actions;
      const curPage = routingSvc
        .getList()
        .filter((p) => p.id === page)
        .shift();
      const isActive = (d: Page) => (page === d.id ? 'active' : undefined);

      return [
        m('.main', { style: 'overflow-x: hidden' }, [
          m(
            '.navbar-fixed',
            { style: 'z-index: 1001' },
            m(
              'nav',
              m('.nav-wrapper', [
                m(
                  'a.brand-logo.hide-on-med-and-down',
                  {
                    title: APP_TITLE,
                    style: 'margin-left: 20px; color: black; height: 64px',
                    href: routingSvc.href(Pages.LANDING),
                  },
                  [
                    m(`img[width=50][height=50][src=${logo}][alt=logo]`, {
                      style: 'margin-bottom: 6px; margin-left: -6px;',
                    }),
                    m('span', { style: 'margin-left: 20px; vertical-align: top;' }, APP_TITLE),
                    m('.tooltip', [
                      m(Icon, {
                        iconName: 'search',
                        style: {
                          'margin-left': '10px',
                          'font-size': '2rem',
                        },
                        onclick: (e: MouseEvent) => {
                          e.preventDefault();
                          searchDialog && !searchDialog.isOpen && searchDialog.open();
                        },
                      }),
                      m('span.tooltiptext', { style: { 'font-size': '1rem' } }, 'Type / to search'),
                    ]),
                  ]
                ),

                m('ul.right.hide-on-med-and-down', [
                  ...routingSvc
                    .getList()
                    .filter(
                      (d) =>
                        d.id !== Pages.LANDING &&
                        ((typeof d.visible === 'boolean' ? d.visible : d.visible(state)) || isActive(d))
                    )
                    .map((d: Page) =>
                      m('li', { style: 'text-align:center', class: isActive(d) }, [
                        m(
                          'a.primary-text',
                          {
                            title: d.title,
                            href: routingSvc.href(d.id),
                            onclick: () => changePage(d.id),
                          },
                          m(Icon, {
                            className: d.iconClass ? ` ${d.iconClass}` : '',
                            style,
                            iconName: typeof d.icon === 'string' ? d.icon : d.icon ? d.icon() : '',
                          })
                        ),
                      ])
                    ),
                ]),
              ])
            )
          ),
          curPage && curPage.hasSidebar && [m(SideNavTrigger, { state, actions }), m(SideNav, { state, actions })],
          m(
            '#searchDialog.modal',
            {
              oncreate: ({ dom }) => {
                searchDialog = M.Modal.init(dom);
              },
            },
            [
              m('.modal-content', [
                m(TextInputWithClear, {
                  label: 'Search...',
                  onchange: () => {},
                  iconName: 'search',
                  initialValue: searchFilter,
                  oninput: (v) => {
                    setSearchFilter(v);
                  },
                  oncreate: ({ dom }) => (textInput = dom.querySelector('input') as HTMLInputElement),
                }),
                searchDialog &&
                  searchDialog.isOpen &&
                  searchFilter &&
                  searchResults && [
                    searchResults.length === 0 && [m('p', 'No results found')],
                    searchResults.length === 1 && [m('p', '1 result found')],
                    searchResults.length > 1 && [m('p', `${searchResults.length} results found`)],
                    searchResults.length > 0 && [
                      m(
                        'ol',
                        searchResults.map(({ crimeScriptIdx, actIdx, phaseIdx, resultMd, type }) =>
                          m('li', [
                            m(
                              'a.truncate',
                              {
                                style: { cursor: 'pointer' },
                                href: routingSvc.href(Pages.HOME, `id=${model.crimeScripts[crimeScriptIdx].id}`),
                                onclick: () => {
                                  searchDialog.close();
                                  actions.setLocation(model.crimeScripts[crimeScriptIdx].id, actIdx, phaseIdx);
                                },
                              },
                              `${model.crimeScripts[crimeScriptIdx].label} > ${type}`
                            ),
                            m(SlimdownView, { md: resultMd, removeParagraphs: true }),
                          ])
                        )
                      ),
                    ],
                  ],
              ]),
            ]
          ),
          m('.container', { style: 'padding-top: 5px' }, children),
        ]),
      ];
    },
  };
};
