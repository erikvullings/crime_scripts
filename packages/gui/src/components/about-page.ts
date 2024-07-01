import m from 'mithril';
import { ISelectOptions, Select } from 'mithril-materialized';
import { Pages } from '../models';
import { Languages, MeiosisComponent, UserRole, i18n, t } from '../services';
import { SlimdownView } from 'mithril-ui-form';
import { LanguageSwitcher } from './ui/language-switcher';

export const AboutPage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.ABOUT);
    },
    view: ({
      attrs: {
        state: { role },
        actions: { setRole },
      },
    }) => {
      const roleIcon = role === 'user' ? 'person' : role === 'editor' ? 'edit' : 'manage_accounts';

      return m('#about-page.row.about.page', [
        m(Select, {
          checkedId: role,
          label: t('ROLE'),
          iconName: roleIcon,
          className: 'col s6',
          options: [
            { id: 'user', label: t('USER') },
            { id: 'editor', label: t('EDITOR') },
            { id: 'admin', label: t('ADMIN') },
          ],
          onchange: (role) => {
            setRole(role[0]);
          },
        } as ISelectOptions<UserRole>),
        m(LanguageSwitcher, {
          className: 'col s6',
          onLanguageChange: async (language: Languages) => {
            await i18n.loadAndSetLocale(language as Languages);
          },
          currentLanguage: i18n.currentLocale,
        }),
        m('.col.s12', [m('h4', t('ABOUT', 'TITLE')), m(SlimdownView, { md: t('ABOUT', 'TEXT') })]),
      ]);
    },
  };
};
