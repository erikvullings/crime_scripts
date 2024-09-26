import { meiosisSetup } from 'meiosis-setup';
import { MeiosisCell, MeiosisConfig, Patch, Service } from 'meiosis-setup/types';
import m, { FactoryComponent } from 'mithril';
import { routingSvc, t } from '.';
import { DataModel, ID, Pages, SearchResult, Settings } from '../models';
import { User, UserRole } from './login-service';
import { scrollToTop } from '../utils';
import { flexSearchLookupUpdater, FlexSearchResult } from './flex-search';

// const settingsSvc = restServiceFactory<Settings>('settings');
const MODEL_KEY = 'CSS_MODEL';
const USER_ROLE = 'USER_ROLE';
export const APP_TITLE = 'PAX - Crime Scripting';

export type CrimeScriptFilter = {
  productIds: ID[];
  geoLocationIds: ID[];
  locationIds: ID[];
  attributeIds: ID[];
  roleIds: ID[];
};

export interface State {
  page: Pages;
  model: DataModel;
  locale: string;
  loggedInUser?: User;
  role: UserRole;
  settings: Settings;
  currentCrimeScriptId?: ID;
  curActIdx?: number;
  curPhaseIdx?: number;
  searchFilter: string;
  attributeFilter: string;
  searchResults: SearchResult[];
  caseTags: string[];
  caseResults: SearchResult[];
  crimeScriptFilter: CrimeScriptFilter;
  /** For finding search results */
  lookup: Map<string, FlexSearchResult[]>;
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
  setAttributeFilter: (searchFilter?: string) => Promise<void>;
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
  setAttributeFilter: async (attributeFilter?: string) => {
    if (attributeFilter) {
      update({ attributeFilter });
    } else {
      update({ attributeFilter: undefined });
    }
  },
  setLocation: (currentCrimeScriptId, curActIdx, curPhaseIdx) => {
    update({ currentCrimeScriptId, curActIdx, curPhaseIdx });
  },
});

const aggregateFlexSearchResults = (results: FlexSearchResult[]): SearchResult[] => {
  // Step 1: Aggregate by crimeScriptIdx
  const crimeScriptMap = new Map<number, SearchResult>();

  for (const [crimeScriptIdx, actIdx, phaseIdx, score] of results) {
    if (!crimeScriptMap.has(crimeScriptIdx)) {
      crimeScriptMap.set(crimeScriptIdx, {
        crimeScriptIdx,
        totalScore: 0,
        acts: [],
      });
    }

    const crimeScript = crimeScriptMap.get(crimeScriptIdx)!;
    crimeScript.totalScore += score;

    const existingAct = crimeScript.acts.find((act) => act.actIdx === actIdx);
    if (existingAct) {
      existingAct.score += score;
    } else {
      crimeScript.acts.push({ actIdx, phaseIdx, score });
    }
  }

  // Step 2: Sort the results
  const sortedResults = Array.from(crimeScriptMap.values()).sort((a, b) => {
    // Sort by total score of crimeScript
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    // If total scores are equal, sort by the highest scoring act
    const maxScoreA = Math.max(...a.acts.map((act) => act.score));
    const maxScoreB = Math.max(...b.acts.map((act) => act.score));
    return maxScoreB - maxScoreA;
  });

  // Sort acts within each crimeScript
  sortedResults.forEach((crimeScript) => {
    crimeScript.acts.sort((a, b) => b.score - a.score);
  });

  return sortedResults;
};
export const setSearchResults: Service<State> = {
  onchange: (state) => state.searchFilter,
  run: (cell) => {
    const state = cell.getState();
    const { lookup, searchFilter } = state;
    const allFlexResults: FlexSearchResult[] = [];
    if (state.searchFilter) {
      const searchWords = searchFilter.trim().toLowerCase().split(/\s+/);
      searchWords
        .map((word) => lookup.get(word))
        .filter((results) => typeof results !== 'undefined')
        .forEach((results) => {
          results.forEach((res) => allFlexResults.push(res));
        });
    }
    const searchResults = aggregateFlexSearchResults(allFlexResults);

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
    services: [setSearchResults, flexSearchLookupUpdater],
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
