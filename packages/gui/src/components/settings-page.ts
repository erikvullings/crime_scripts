import m from 'mithril';
import { Cast, CrimeSceneAttributes, Pages } from '../models';
import { MeiosisComponent } from '../services';
import { FormAttributes, LayoutForm } from 'mithril-ui-form';
import { Tabs } from 'mithril-materialized';
import { attributesForm, castForm } from '../models/forms';

export const SettingsPage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        state: { model },
        actions: { setPage },
      },
    }) => {
      if (model.attributes) {
        model.attributes.sort((a, b) => {
          // Ensure type is always defined
          const typeA = a.type !== undefined ? a.type : Infinity;
          const typeB = b.type !== undefined ? b.type : Infinity;

          // First, sort by type
          if (typeA < typeB) return -1;
          if (typeA > typeB) return 1;

          // If types are equal, sort by label
          return a.label.localeCompare(b.label);
        });
      }
      setPage(Pages.SETTINGS);
    },
    view: ({ attrs: { state, actions } }) => {
      const { model } = state;
      // const cast = model.crimeScenes
      //   .filter((c) => c.cast)
      //   .reduce((acc, cur) => {
      //     acc = [...acc, ...cur.cast];
      //     return acc;
      //   }, [] as Cast[]);
      // const obj = { cast };

      return m(
        '#settings-page.settings.page',
        m(Tabs, {
          tabs: [
            {
              title: 'Cast',
              vnode: m(LayoutForm, {
                form: castForm,
                obj: model,
                onchange: () => actions.saveModel(model),
              } as FormAttributes<{ cast: Cast[] }>),
            },
            {
              title: 'Attributes',
              vnode: m(LayoutForm, {
                form: attributesForm,
                obj: model,
                onchange: () => actions.saveModel(model),
              } as FormAttributes<{ attributes: CrimeSceneAttributes[] }>),
            },
          ],
        })
      );
    },
  };
};
