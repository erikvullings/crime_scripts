import { meiosisSetup } from 'meiosis-setup';
import { MeiosisCell, MeiosisConfig, Patch, Service } from 'meiosis-setup/types';
import m, { FactoryComponent } from 'mithril';
import { routingSvc, t } from '.';
import { Cast, CrimeScriptAttributes, DataModel, ID, Pages, SearchResult, Settings } from '../models';
import { User, UserRole } from './login-service';
import { scrollToTop } from '../utils';

// const settingsSvc = restServiceFactory<Settings>('settings');
const MODEL_KEY = 'CSS_MODEL';
const USER_ROLE = 'USER_ROLE';
export const APP_TITLE = 'Crime Scripting';

export interface State {
  page: Pages;
  model: DataModel;
  loggedInUser?: User;
  role: UserRole;
  settings: Settings;
  currentCrimeScriptId?: ID;
  curActIdx?: number;
  curPhaseIdx?: number;
  searchFilter: string;
  searchResults: SearchResult[];
}

export interface Actions {
  setPage: (page: Pages, info?: string) => void;
  changePage: (
    page: Pages,
    params?: Record<string, string | number | undefined>,
    query?: Record<string, string | number | undefined>
  ) => void;
  saveModel: (ds: DataModel) => void;
  saveSettings: (settings: Settings) => Promise<void>;
  setRole: (role: UserRole) => void;
  login: () => void;
  update: (patch: Patch<State>) => void;
  setSearchFilter: (searchFilter?: string) => Promise<void>;
  setLocation: (currentCrimeScriptId: ID, actIdx: number, phaseIdx: number) => void;
}

export type MeiosisComponent<T extends { [key: string]: any } = {}> = FactoryComponent<{
  state: State;
  actions: Actions;
  options?: T;
}>;

export const appActions: (cell: MeiosisCell<State>) => Actions = ({ update /* states */ }) => ({
  // addDucks: (cell, amount) => {
  //   cell.update({ ducks: (value) => value + amount });
  // },
  setPage: (page, info) => {
    document.title = `${APP_TITLE} | ${t(page as any, 'TITLE').replace('_', ' ')}${info ? ` | ${info}` : ''}`;
    // const curPage = states().page;
    // if (curPage === page) return;
    update({
      page: () => {
        scrollToTop();
        return page;
      },
    });
  },
  changePage: (page, params, query) => {
    routingSvc && routingSvc.switchTo(page, params, query);
    document.title = `${APP_TITLE} | ${page.replace('_', ' ')}`;
    update({ page });
  },
  saveModel: (model) => {
    model.lastUpdate = Date.now();
    model.version = model.version ? model.version++ : 1;
    localStorage.setItem(MODEL_KEY, JSON.stringify(model));
    console.log(JSON.stringify(model, null, 2));
    update({ model: () => model });
  },
  saveSettings: async (settings: Settings) => {
    // await settingsSvc.save(settings);
    update({
      settings: () => settings,
    });
  },
  setRole: (role) => {
    localStorage.setItem(USER_ROLE, role);
    update({ role });
  },
  login: () => {},
  update: (state) => update(state),
  setSearchFilter: async (searchFilter?: string) => {
    if (searchFilter) {
      // localStorage.setItem(SEARCH_FILTER_KEY, searchFilter);
      update({ searchFilter });
    } else {
      update({ searchFilter: undefined });
    }
  },
  setLocation: (currentCrimeScriptId, curActIdx, curPhaseIdx) => {
    update({ currentCrimeScriptId, curActIdx, curPhaseIdx });
  },
});

export const setSearchResults: Service<State> = {
  onchange: (state) => state.searchFilter,
  run: (cell) => {
    const state = cell.getState();
    const { model = {} as DataModel } = state;
    const { crimeScripts = [], cast = [], attributes = [], acts = [] } = model;
    const searchResults: SearchResult[] = [];
    if (state.searchFilter) {
      const searchFilter = state.searchFilter.toLowerCase();
      const highlighter = (text: string) => {
        return text.replace(new RegExp(searchFilter, 'gi'), (match) => `**${match}**`);
      };
      const matchingCast = cast
        .filter((role) => role.label?.toLowerCase().includes(searchFilter))
        .reduce((acc, cur) => acc.set(cur.id, cur), new Map<ID, Cast>());
      const matchingAttr = attributes
        .filter((attr) => attr.label?.toLowerCase().includes(searchFilter))
        .reduce((acc, cur) => acc.set(cur.id, cur), new Map<ID, CrimeScriptAttributes>());
      crimeScripts.forEach((crimeScript, crimeScriptIdx) => {
        const { label, description, stages: actVariants = [] } = crimeScript;
        if (label.toLowerCase().includes(searchFilter) || description?.toLowerCase().includes(searchFilter)) {
          searchResults.push({
            crimeScriptIdx,
            actIdx: -1,
            phaseIdx: -1,
            activityIdx: -1,
            conditionIdx: -1,
            type: 'crimeScript',
            resultMd: highlighter(label.toLowerCase().includes(searchFilter) ? label : description!),
          });
        }
        actVariants.forEach(({ ids }) => {
          ids.forEach((actId) => {
            const actIdx = acts.findIndex((a) => a.id === actId);
            if (actIdx < 0) return;
            const act = acts[actIdx];
            [act.preparation, act.preactivity, act.activity, act.postactivity].forEach((phase, phaseIdx) => {
              phase.activities?.forEach((activity, activityIdx) => {
                const { label, description, conditions = [], cast = [], attributes = [] } = activity;
                cast.forEach((id) => {
                  const include = matchingCast.get(id);
                  if (include) {
                    searchResults.push({
                      crimeScriptIdx: crimeScriptIdx,
                      actIdx,
                      phaseIdx,
                      activityIdx,
                      conditionIdx: -1,
                      type: 'cast',
                      resultMd: highlighter(include.label),
                    });
                  }
                });
                attributes.forEach((id) => {
                  const include = matchingAttr.get(id);
                  if (include) {
                    searchResults.push({
                      crimeScriptIdx: crimeScriptIdx,
                      actIdx,
                      phaseIdx,
                      activityIdx,
                      conditionIdx: -1,
                      type: 'attribute',
                      resultMd: highlighter(include.label),
                    });
                  }
                });
                if (label.toLowerCase().includes(searchFilter) || description?.toLowerCase().includes(searchFilter)) {
                  searchResults.push({
                    crimeScriptIdx: crimeScriptIdx,
                    actIdx,
                    phaseIdx,
                    activityIdx,
                    conditionIdx: -1,
                    type: 'activity',
                    resultMd: highlighter(label.toLowerCase().includes(searchFilter) ? label : description!),
                  });
                }
                conditions?.forEach((condition, conditionIdx) => {
                  const { label } = condition;
                  if (label?.toLowerCase().includes(searchFilter)) {
                    searchResults.push({
                      crimeScriptIdx: crimeScriptIdx,
                      actIdx,
                      phaseIdx,
                      activityIdx,
                      conditionIdx,
                      type: 'condition',
                      resultMd: highlighter(label),
                    });
                  }
                });
              });
            });
          });
        });
      });
    }
    searchResults.sort((a, b) => {
      // Compare by crimeScriptIdx
      if (a.crimeScriptIdx !== b.crimeScriptIdx) {
        return a.crimeScriptIdx - b.crimeScriptIdx;
      }
      // Compare by actIdx
      if (a.actIdx !== b.actIdx) {
        return a.actIdx - b.actIdx;
      }
      // Compare by type (lexicographically)
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      // If all compared fields are equal, return 0
      return 0;
    });
    console.log('CALLED');
    cell.update({ searchResults });
  },
};

const config: MeiosisConfig<State> = {
  app: {
    initial: {
      page: Pages.HOME,
      loggedInUser: undefined,
      role: 'user',
      settings: {} as Settings,
      model: {} as DataModel,
    } as State,
    services: [setSearchResults],
  },
};
export const cells = meiosisSetup<State>(config);

cells.map(() => {
  // console.log('...redrawing');
  m.redraw();
});

const loadData = async () => {
  const ds = localStorage.getItem(MODEL_KEY);
  const model: DataModel = ds ? JSON.parse(ds) : { crimeScripts: [] };
  const role = (localStorage.getItem(USER_ROLE) || 'user') as UserRole;
  // const settings = (await settingsSvc.loadList()).shift() || ({} as Settings);

  cells().update({
    role,
    model: () => model,
    // settings: () => settings,
  });
};
loadData();
