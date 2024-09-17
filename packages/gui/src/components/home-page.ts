import m, { FactoryComponent } from 'mithril';
import { Act, Cast, CrimeScript, Hierarchical, ID, Labeled, Pages, scriptIcon } from '../models';
import { CrimeScriptFilter, MeiosisComponent, routingSvc } from '../services';
import { FlatButton, uniqueId, Icon } from 'mithril-materialized';
import { I18N, t } from '../services/translations';
import { toCommaSeparatedList, toOptions } from '../utils';
import { FormAttributes, LayoutForm, UIForm } from 'mithril-ui-form';

export const HomePage: MeiosisComponent = () => {
  const actLocations = (cs: CrimeScript, acts: Act[]) => {
    const csActs = cs.stages
      .map((stage) => acts.find((a) => a.id === stage.id))
      .filter((a) => typeof a !== 'undefined');
    return csActs.reduce((acc, act) => {
      if (act.preparation && act.preparation.locationIds) {
        acc.push(...act.preparation.locationIds);
      }
      if (act.preactivity && act.preactivity.locationIds) {
        acc.push(...act.preactivity.locationIds);
      }
      if (act.activity && act.activity.locationIds) {
        acc.push(...act.activity.locationIds);
      }
      if (act.postactivity && act.postactivity.locationIds) {
        acc.push(...act.postactivity.locationIds);
      }
      return acc;
    }, [] as ID[]);
  };

  const includeChildren = (arr: Array<Hierarchical & Labeled>, ids: ID[]) => {
    const included = arr.filter((a) => ids.includes(a.id)).map((a) => a.id);
    const children = arr.filter((a) => a.parents?.some((p) => ids.includes(p))).map((a) => a.id);
    const grandchildren = arr.filter((a) => a.parents?.some((p) => children.includes(p))).map((a) => a.id);
    return [...included, ...children, ...grandchildren];
  };

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => {
      setPage(Pages.HOME);
    },
    view: ({ attrs: { state, actions } }) => {
      const { model, role, crimeScriptFilter = {} as CrimeScriptFilter } = state;
      const { crimeScripts = [], products = [], geoLocations = [], locations = [], acts = [] } = model;
      const isAdmin = role === 'admin';

      const csFilter =
        crimeScriptFilter.productIds?.length > 0 ||
        crimeScriptFilter.geoLocationIds?.length > 0 ||
        crimeScriptFilter.locationIds?.length > 0
          ? (cs: CrimeScript, _idx: number, _arr: CrimeScript[]) => {
              const { productIds = [], locationIds = [], geoLocationIds = [] } = crimeScriptFilter;
              const allProductIds = includeChildren(products, productIds);
              const allGeoIds = includeChildren(geoLocations, geoLocationIds);
              const allLocIds = includeChildren(locations, locationIds);
              return (
                (allProductIds.length === 0 || cs.productIds?.some((id) => allProductIds.includes(id))) &&
                (allGeoIds?.length === 0 || cs.geoLocationIds?.some((id) => allGeoIds?.includes(id))) &&
                (allLocIds?.length === 0 || actLocations(cs, acts).some((id) => allLocIds?.includes(id)))
              );
            }
          : (_cs: CrimeScript, _idx: number, _arr: CrimeScript[]) => true;

      const crimeScriptFilterForm = [
        {
          id: 'productIds',
          label: t('PRODUCTS', 2),
          icon: 'filter_alt',
          type: 'select',
          multiple: true,
          options: toOptions(products),
          className: 'col s4',
        },
        {
          id: 'locationIds',
          label: t('LOCATIONS', 2),
          icon: 'filter_alt',
          type: 'select',
          multiple: true,
          options: toOptions(locations),
          className: 'col s4',
        },
        {
          id: 'geoLocationIds',
          label: t('GEOLOCATIONS', 2),
          icon: 'filter_alt',
          type: 'select',
          multiple: true,
          options: toOptions(geoLocations),
          className: 'col s4',
        },
      ] as UIForm<CrimeScriptFilter>;

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
          '.col.s12.filters',
          m(LayoutForm, {
            form: crimeScriptFilterForm,
            obj: crimeScriptFilter,
            onchange: () => {
              actions.update({ crimeScriptFilter });
            },
            i18n: I18N,
          } as FormAttributes<CrimeScriptFilter>)
        ),
        m(
          '.crime-scenes',
          m('ul.collection.with-header', [
            m('li.collection-header', m('h4', 'Crime Scripts')),
            crimeScripts
              .filter(csFilter)
              .map(({ url = scriptIcon, label, description, id, productIds = [], geoLocationIds = [] }) => {
                const onclick = () => {
                  actions.changePage(Pages.CRIME_SCRIPT, { id });
                  actions.update({ currentCrimeScriptId: id });
                };
                return m('li.collection-item.avatar.cursor-pointer', { onclick }, [
                  m('img.circle', { src: url, alt: 'Avatar' }),
                  m(
                    'span.title',
                    `${label}${
                      productIds.length > 0
                        ? ` (${t('PRODUCTS', productIds.length).toLowerCase()}: ${toCommaSeparatedList(
                            products,
                            productIds
                          )})`
                        : ''
                    }`
                  ),
                  geoLocationIds.length > 0 &&
                    m(
                      'p',
                      m(
                        'i',
                        `${t('GEOLOCATIONS', geoLocationIds.length)}: ${toCommaSeparatedList(
                          geoLocations,
                          geoLocationIds
                        )}`
                      )
                    ),
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
