import m from 'mithril';
import { Pages } from '../models';
import { MeiosisComponent, t } from '../services';
import { Chips } from 'mithril-materialized';
import { ChipData } from 'materialize-css';

export const CasePage: MeiosisComponent = () => {
  const tags: string[] = [];

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.CASE);
    },
    view: ({ attrs: { state, actions } }) => {
      const { caseTags = [], caseResults = [] } = state;
      const { update } = actions;
      const data: ChipData[] = caseTags.map((tag) => ({ tag }));

      return m('#case-page.row.case.page.markdown', [
        m('.col.s12', [
          m(Chips, {
            data,
            label: 'Aangetroffen zaken',
            className: 'center-align',
            onchange: (tags) => {
              const caseTags = tags.map((tag) => tag.tag);
              update({ caseTags });
            },
          }),
        ]),
        // caseResults.length > 0 &&
        caseTags.length > 0 && m('.col.s12', m('h4', 'Meest waarschijnlijke acts')),
        caseTags.map((tag) => {
          return m('.col.s12', m('h5', tag));
        }),
      ]);
    },
  };
};
