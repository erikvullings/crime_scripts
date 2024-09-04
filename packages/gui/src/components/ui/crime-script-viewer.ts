import m, { FactoryComponent } from 'mithril';
import { Act, Cast, CrimeScript, CrimeScriptAttributes, ICONS, ID, IconOpts, Stage, missingIcon } from '../../models';
import { State } from '../../services';
import { ITabItem, Tabs, Icon } from 'mithril-materialized';
import { render, SlimdownView } from 'mithril-ui-form';
import { Patch } from 'meiosis-setup/types';
import { ReferenceListComponent } from '../ui/reference';
import { lookupCrimeMeasure } from '../../models/situational-crime-prevention';
import { t } from '../../services/translations';

export const CrimeScriptViewer: FactoryComponent<{
  crimeScript: CrimeScript;
  cast: Cast[];
  acts: Act[];
  attributes: CrimeScriptAttributes[];
  curActIdx?: number;
  curPhaseIdx?: number;
  update: (patch: Patch<State>) => void;
}> = () => {
  const findCrimeMeasure = lookupCrimeMeasure();

  return {
    view: ({ attrs: { crimeScript, cast, acts, attributes, curActIdx = 0, curPhaseIdx = 0, update } }) => {
      const { label = '...', description, literature, stages: actVariants = [] } = crimeScript;
      const [allCastIds, allAttrIds] = actVariants.reduce(
        (acc, variant) => {
          const act = acts.find((a) => a.id === variant.id);
          if (act) {
            [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((phase) =>
              phase.activities.forEach((activity) => {
                activity.cast?.forEach((id) => acc[0].add(id));
                activity.attributes?.forEach((id) => acc[1].add(id));
              })
            );
          }
          return acc;
        },
        [new Set<ID>(), new Set<ID>()] as [cast: Set<ID>, attr: Set<ID>]
      );
      const allStages = actVariants.reduce((acc, cur, index) => {
        cur.ids.forEach((id, idx) => {
          const act = acts.find((a) => a.id === id);
          if (act) {
            const counter = `${index + 1}${cur.ids.length === 1 ? '' : String.fromCharCode(97 + idx)}`;
            const title = `${counter}. ${act.label}`;
            const selectedVariant = cur.ids.length > 1 && id === cur.id;
            acc.push({ stage: cur, stageIdx: index, title, act, selectedVariant });
          }
        });
        return acc;
      }, [] as Array<{ stage: Stage; stageIdx: number; title: string; act: Act; selectedVariant: boolean }>);

      const selectedActContent = actVariants
        .filter((_, index) => curActIdx === index)
        .map((variant) => {
          return acts.find((a) => a.id === variant.id) || ({} as Act);
        })
        .map(({ label = '...', preparation, preactivity, activity, postactivity, measures = [] } = {} as Act) => {
          preparation.label = t('PREPARATION_PHASE');
          preactivity.label = t('PRE_ACTIVITY_PHASE');
          activity.label = t('ACTIVITY_PHASE');
          postactivity.label = t('POST_ACTIVITY_PHASE');
          const contentTabs = [preparation, preactivity, activity, postactivity].map(
            ({ label, activities = [], conditions }) => {
              const castIds = Array.from(
                activities.reduce((acc, { cast: curCast }) => {
                  if (curCast) curCast.forEach((id) => acc.add(id));
                  return acc;
                }, new Set<ID>())
              );
              const attrIds = Array.from(
                activities.reduce((acc, { attributes: curAttr }) => {
                  if (curAttr) curAttr.forEach((id) => acc.add(id));
                  return acc;
                }, new Set<ID>())
              );
              const md = `##### ${t('ACTIVITIES')}

${activities.map((act) => '- ' + act.label).join('\n')}

${castIds.length > 0 ? `##### ${t('CAST')}` : ''}

${castIds.map((id) => '- ' + cast.find((cast) => cast.id === id)?.label).join('\n')}

${conditions.length > 0 ? `##### ${t('CONDITIONS')}` : ''}

${conditions.map((cond) => '- ' + cond.label).join('\n')}

${attrIds.length > 0 ? `##### ${t('ATTRIBUTES')}` : ''}

${attrIds.map((id) => '- ' + attributes.find((attr) => attr.id === id)?.label).join('\n')}
`;
              return {
                title: label,
                md,
              };
            }
          );
          if (measures.length > 0) {
            contentTabs.push({
              title: t('MEASURES'),
              md: `##### ${t('MEASURES')}
                
${measures.map((measure) => `- ${findCrimeMeasure(measure.cat)?.label}: ${measure.label}`).join('\n')}
                `,
            });
          }
          const tabItem: ITabItem = {
            title: label,
            vnode: contentTabs.length
              ? m(Tabs, {
                  tabs: contentTabs.map(
                    ({ title, md }, index) =>
                      ({
                        title,
                        active: index === curPhaseIdx,
                        vnode: m(SlimdownView, { md }),
                      } as ITabItem)
                  ),
                })
              : m('div'),
          };
          return tabItem;
        })
        .shift();

      return m('.col.s12', [
        m('h4', label),
        description && m('p', description),
        m('.row', [
          m('.col.s6', [
            allCastIds.size > 0 && [
              m('h5', t('CAST')),
              m(
                'ol',
                Array.from(allCastIds).map((id) => m('li', cast.find((c) => c.id === id)?.label))
              ),
            ],
          ]),
          m('.col.s6', [
            allAttrIds.size > 0 && [
              m('h5', t('ATTRIBUTES')),
              m(
                'ol',
                Array.from(allAttrIds).map((id) => m('li', attributes.find((c) => c.id === id)?.label))
              ),
            ],
          ]),
        ]),
        literature &&
          literature.length > 0 && [m('h5', t('REFERENCES')), m(ReferenceListComponent, { references: literature })],
        m(
          'ul.collection.with-header',
          m('li.collection-header', m('h4', t('STAGES'))),
          allStages.map(({ stage, stageIdx, selectedVariant, title, act }) => {
            const { id, label = '...', icon, url, description = '' } = act;
            const imgSrc = (icon === ICONS.OTHER ? url : IconOpts.find((i) => i.id === icon)?.img) || missingIcon;
            return m(
              'li.collection-item.avatar',
              { class: curActIdx === stageIdx && id === actVariants[curActIdx].id ? 'active' : undefined },
              [
                m('img.circle', { src: imgSrc, alt: label }),
                m('span.title', title, selectedVariant ? m('sup', '*') : undefined),
                m('p.markdown', m.trust(render(description, true))),
                m(
                  'a.secondary-content',
                  { href: window.location.href },
                  m(Icon, {
                    iconName: 'more_horiz',
                    onclick: () => {
                      stage.id = id;
                      update({ curActIdx: stageIdx });
                    },
                  })
                ),
              ]
            );
          })
        ),
        selectedActContent && [m('h4', selectedActContent.title), selectedActContent.vnode],
      ]);
    },
  };
};
