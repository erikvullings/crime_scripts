import type {
  ContentLanguage,
  CrimeScript,
  CrimeScriptFilter,
  DataModel,
  Hierarchical,
  ID,
  Labelled,
  ScriptMode,
} from './data-model.ts';
import { scriptsForMode } from './script-classification.ts';

export type CaseMatchField =
  | 'script'
  | 'scene'
  | 'variant'
  | 'activity'
  | 'condition'
  | 'indicator'
  | 'opportunity'
  | 'barrier'
  | 'product'
  | 'geographic-location'
  | 'location'
  | 'role'
  | 'attribute'
  | 'transport'
  | 'partner';

export type CaseEvidenceItem = {
  id: string;
  label: string;
  source: 'text' | 'structured';
};

export type CaseMatchLocation = {
  field: CaseMatchField;
  label: string;
  sceneId?: ID;
  sceneLabel?: string;
  variantId?: ID;
  variantLabel?: string;
};

export type CaseEvidenceMatch = {
  evidence: CaseEvidenceItem;
  strength: number;
  locations: CaseMatchLocation[];
  matchedTerms?: string[];
  unmatchedTerms?: string[];
  termCoverage?: number;
};

export type CaseSceneMatch = {
  sceneId: ID;
  sceneLabel: string;
  variantId?: ID;
  variantLabel?: string;
  matchedEvidenceIds: string[];
  strength: number;
};

export type CaseMatchResult = {
  scriptId: ID;
  scriptFamilyId: ID;
  score: number;
  coverage: number;
  specificity: number;
  matchedEvidence: CaseEvidenceMatch[];
  unmatchedEvidence: CaseEvidenceItem[];
  scenes: CaseSceneMatch[];
};

export type CaseTokenizer = (text: string, language: ContentLanguage) => string[];

export type CaseMatchRequest = {
  model: DataModel;
  scriptMode: ScriptMode;
  text?: string;
  filters?: Partial<CrimeScriptFilter>;
  tokenize: CaseTokenizer;
};

export type CaseComparisonCandidate = {
  scriptId: ID;
  distinguishingEvidence: CaseEvidenceMatch[];
  scenes: CaseSceneMatch[];
};

export type CaseFollowUpPrompt = {
  id: string;
  field: 'condition' | 'indicator';
  label: string;
  scriptIds: ID[];
};

export type CaseHypothesisComparison = {
  sharedEvidence: CaseEvidenceItem[];
  candidates: CaseComparisonCandidate[];
  unexplainedEvidence: CaseEvidenceItem[];
  followUpPrompts: CaseFollowUpPrompt[];
};

export type CaseComparisonRequest = {
  model: DataModel;
  results: CaseMatchResult[];
  promptLimit?: number;
};

type FilterKey = keyof CrimeScriptFilter;

type SearchRecord = CaseMatchLocation & {
  strength: number;
  tokens: Set<string>;
};

type StructuredOccurrence = CaseMatchLocation & {
  id: ID;
};

type ScriptEvidenceIndex = {
  records: SearchRecord[];
  structured: Record<FilterKey, StructuredOccurrence[]>;
};

const FILTER_KEYS: FilterKey[] = [
  'productIds',
  'geoLocationIds',
  'locationIds',
  'roleIds',
  'attributeIds',
  'transportIds',
];

const FIELD_BY_FILTER: Record<FilterKey, CaseMatchField> = {
  productIds: 'product',
  geoLocationIds: 'geographic-location',
  locationIds: 'location',
  roleIds: 'role',
  attributeIds: 'attribute',
  transportIds: 'transport',
};

const unique = <T>(values: T[]) => [...new Set(values)];

const rawTerms = (text: string) => text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];

const normalizeComparisonLabel = (label: string) =>
  label
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const comparisonEvidenceKey = ({ id, label, source }: CaseEvidenceItem) =>
  source === 'structured'
    ? id
    : `text:${normalizeComparisonLabel(label)}`;

export const compareCaseHypotheses = ({
  model,
  results,
  promptLimit = 5,
}: CaseComparisonRequest): CaseHypothesisComparison => {
  const evidenceByKey = new Map<string, CaseEvidenceItem>();
  const matchedScriptsByKey = new Map<string, Set<ID>>();

  results.forEach((result) => {
    [...result.matchedEvidence.map(({ evidence }) => evidence), ...result.unmatchedEvidence]
      .forEach((evidence) => evidenceByKey.set(comparisonEvidenceKey(evidence), evidence));
    result.matchedEvidence.forEach(({ evidence }) => {
      const key = comparisonEvidenceKey(evidence);
      const scriptIds = matchedScriptsByKey.get(key) || new Set<ID>();
      scriptIds.add(result.scriptId);
      matchedScriptsByKey.set(key, scriptIds);
    });
  });

  const selectedScriptIds = results.map(({ scriptId }) => scriptId);
  const factors = new Map<string, CaseFollowUpPrompt & { scriptIdSet: Set<ID> }>();
  if (results.length > 1) {
    model.crimeScripts
      .filter(({ id }) => selectedScriptIds.includes(id))
      .forEach((script) => {
        script.stages.forEach((scene) => {
          scene.variants.forEach((variant) => {
            ([
              ['indicator', variant.indicators || []],
              ['condition', variant.conditions || []],
            ] as const).forEach(([field, items]) => {
              items.forEach(({ label }) => {
                const normalizedLabel = normalizeComparisonLabel(label);
                if (!normalizedLabel) return;
                const existing = factors.get(normalizedLabel);
                if (existing) {
                  existing.scriptIdSet.add(script.id);
                  return;
                }
                factors.set(normalizedLabel, {
                  id: `${field}:${normalizedLabel}`,
                  field,
                  label,
                  scriptIds: [],
                  scriptIdSet: new Set([script.id]),
                });
              });
            });
          });
        });
      });
  }

  const factorRank = (
    left: CaseFollowUpPrompt & { scriptIdSet: Set<ID> },
    right: CaseFollowUpPrompt & { scriptIdSet: Set<ID> }
  ) =>
    left.scriptIdSet.size - right.scriptIdSet.size ||
    Number(left.field === 'condition') - Number(right.field === 'condition') ||
    left.label.localeCompare(right.label);
  const remainingFactors = [...factors.values()]
    .filter(({ scriptIdSet }) => scriptIdSet.size < results.length)
    .sort(factorRank);
  const promptCountByScript = new Map(selectedScriptIds.map((scriptId) => [scriptId, 0]));
  const selectedFactors = [];
  while (selectedFactors.length < Math.max(0, promptLimit) && remainingFactors.length > 0) {
    remainingFactors.sort((left, right) => {
      const leftCount = Math.min(
        ...[...left.scriptIdSet].map((scriptId) => promptCountByScript.get(scriptId) || 0)
      );
      const rightCount = Math.min(
        ...[...right.scriptIdSet].map((scriptId) => promptCountByScript.get(scriptId) || 0)
      );
      return leftCount - rightCount || factorRank(left, right);
    });
    const next = remainingFactors.shift();
    if (!next) break;
    selectedFactors.push(next);
    next.scriptIdSet.forEach((scriptId) =>
      promptCountByScript.set(scriptId, (promptCountByScript.get(scriptId) || 0) + 1)
    );
  }
  const followUpPrompts = selectedFactors
    .map(({ scriptIdSet, ...prompt }) => ({
      ...prompt,
      scriptIds: selectedScriptIds.filter((scriptId) => scriptIdSet.has(scriptId)),
    }));

  return {
    sharedEvidence: [...evidenceByKey]
      .filter(([key]) => matchedScriptsByKey.get(key)?.size === results.length)
      .map(([, evidence]) => evidence),
    candidates: results.map((result) => ({
      scriptId: result.scriptId,
      distinguishingEvidence: result.matchedEvidence.filter(({ evidence }) =>
        (matchedScriptsByKey.get(comparisonEvidenceKey(evidence))?.size || 0) < results.length
      ),
      scenes: result.scenes,
    })),
    unexplainedEvidence: [...evidenceByKey]
      .filter(([key]) => !matchedScriptsByKey.has(key))
      .map(([, evidence]) => evidence),
    followUpPrompts,
  };
};

const textEvidence = (
  text: string,
  language: ContentLanguage,
  tokenize: CaseTokenizer
): Array<{
  evidence: CaseEvidenceItem;
  terms: Array<{ token: string; label: string }>;
  anchorToken: string;
}> =>
  text
    .split(/[\n,;]+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean)
    .flatMap((phrase, index) => {
      const terms = new Map<string, string>();
      rawTerms(phrase).forEach((term) => {
        tokenize(term, language).forEach((token) => {
          if (!terms.has(token)) terms.set(token, term);
        });
      });
      const tokenTerms = [...terms].map(([token, label]) => ({ token, label }));
      const anchorToken = tokenTerms[tokenTerms.length - 1]?.token;
      if (!anchorToken) return [];
      return [{
        evidence: {
          id: `text:${index}:${normalizeComparisonLabel(phrase)}`,
          label: phrase,
          source: 'text' as const,
        },
        terms: tokenTerms,
        anchorToken,
      }];
    });

const taxonomyByFilter = (
  model: DataModel
): Record<FilterKey, Array<Labelled & Hierarchical>> => ({
  productIds: model.products || [],
  geoLocationIds: model.geoLocations || [],
  locationIds: model.locations || [],
  roleIds: model.cast || [],
  attributeIds: model.attributes || [],
  transportIds: model.transports || [],
});

const structuredEvidence = (
  model: DataModel,
  filters: Partial<CrimeScriptFilter>
): Array<CaseEvidenceItem & { filter: FilterKey; selectedId: ID }> => {
  const taxonomies = taxonomyByFilter(model);
  return FILTER_KEYS.flatMap((filter) => {
    const labels = new Map(taxonomies[filter].map((item) => [item.id, item.label]));
    return (filters[filter] || []).map((selectedId) => ({
      id: `filter:${filter}:${selectedId}`,
      label: labels.get(selectedId) || selectedId,
      source: 'structured' as const,
      filter,
      selectedId,
    }));
  });
};

const hasAncestor = (
  itemId: ID,
  ancestorId: ID,
  items: Map<ID, Labelled & Hierarchical>,
  visited = new Set<ID>()
): boolean => {
  if (itemId === ancestorId) return true;
  if (visited.has(itemId)) return false;
  visited.add(itemId);
  return (items.get(itemId)?.parents || []).some(
    (parentId) => parentId === ancestorId || hasAncestor(parentId, ancestorId, items, visited)
  );
};

const buildScriptEvidenceIndex = (
  script: CrimeScript,
  model: DataModel,
  tokenize: CaseTokenizer
): ScriptEvidenceIndex => {
  const records: SearchRecord[] = [];
  const structured: Record<FilterKey, StructuredOccurrence[]> = {
    productIds: [],
    geoLocationIds: [],
    locationIds: [],
    roleIds: [],
    attributeIds: [],
    transportIds: [],
  };
  const taxonomies = taxonomyByFilter(model);
  const taxonomyMaps = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, new Map(taxonomies[key].map((item) => [item.id, item]))])
  ) as Record<FilterKey, Map<ID, Labelled & Hierarchical>>;
  const partnerMap = new Map((model.partners || []).map((partner) => [partner.id, partner]));

  const addText = (
    text: string | undefined,
    field: CaseMatchField,
    label: string,
    strength: number,
    location: Omit<CaseMatchLocation, 'field' | 'label'> = {}
  ) => {
    if (!text) return;
    const tokens = unique(tokenize(text, script.language));
    if (tokens.length === 0) return;
    records.push({ field, label, strength, tokens: new Set(tokens), ...location });
  };

  const addLabelled = (
    item: Labelled & Partial<Hierarchical>,
    field: CaseMatchField,
    location: Omit<CaseMatchLocation, 'field' | 'label'> = {}
  ) => {
    addText(item.label, field, item.label, 3, location);
    item.synonyms?.forEach((synonym) => addText(synonym, field, item.label, 3, location));
    addText(item.description, field, item.label, 1, location);
  };

  const addTaxonomy = (
    ids: ID[] | undefined,
    filter: FilterKey,
    location: Omit<CaseMatchLocation, 'field' | 'label'> = {}
  ) => {
    const field = FIELD_BY_FILTER[filter];
    const items = taxonomyMaps[filter];
    (ids || []).forEach((id) => {
      const item = items.get(id);
      const label = item?.label || id;
      structured[filter].push({ id, field, label, ...location });
      if (!item) return;
      addLabelled(item, field, location);
      const visited = new Set<ID>();
      const addParents = (parentIds: ID[] | undefined) => {
        (parentIds || []).forEach((parentId) => {
          if (visited.has(parentId)) return;
          visited.add(parentId);
          const parent = items.get(parentId);
          if (!parent) return;
          addText(parent.label, field, parent.label, 2, location);
          parent.synonyms?.forEach((synonym) => addText(synonym, field, parent.label, 2, location));
          addParents(parent.parents);
        });
      };
      addParents(item.parents);
    });
  };

  addLabelled(script, 'script');
  addTaxonomy(script.productIds, 'productIds');
  addTaxonomy(script.geoLocationIds, 'geoLocationIds');

  (script.stages || []).forEach((scene) => {
    const sceneLocation = { sceneId: scene.id, sceneLabel: scene.label };
    addLabelled(scene, 'scene', sceneLocation);
    (scene.variants || []).forEach((variant) => {
      const variantLocation = {
        ...sceneLocation,
        variantId: variant.id,
        variantLabel: variant.label,
      };
      addLabelled(variant, 'variant', variantLocation);
      addTaxonomy(variant.locationIds, 'locationIds', variantLocation);
      (variant.activities || []).forEach((activity) => {
        addLabelled(activity, 'activity', variantLocation);
        addTaxonomy(activity.cast, 'roleIds', variantLocation);
        addTaxonomy(activity.attributes, 'attributeIds', variantLocation);
        addTaxonomy(activity.transports, 'transportIds', variantLocation);
      });
      (variant.conditions || []).forEach((condition) =>
        addLabelled(condition, 'condition', variantLocation)
      );
      (variant.indicators || []).forEach((indicator) =>
        addLabelled(indicator, 'indicator', variantLocation)
      );
      (variant.opportunities || []).forEach((opportunity) =>
        addLabelled(opportunity, 'opportunity', variantLocation)
      );
      (variant.measures || []).forEach((measure) => {
        addLabelled(measure, 'barrier', variantLocation);
        (measure.partners || []).forEach((partnerId) => {
          const partner = partnerMap.get(partnerId);
          if (partner) addLabelled(partner, 'partner', variantLocation);
        });
      });
    });
  });

  return { records, structured };
};

const uniqueLocations = (locations: CaseMatchLocation[]) => {
  const seen = new Set<string>();
  return locations.filter((location) => {
    const key = [
      location.field,
      location.label,
      location.sceneId || '',
      location.variantId || '',
    ].join(':');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const recordContextKey = ({ field, label, sceneId, variantId }: SearchRecord) =>
  variantId
    ? `variant:${variantId}`
    : sceneId
      ? `scene:${sceneId}`
      : `record:${field}:${label}`;

const sceneMatches = (matches: CaseEvidenceMatch[]): CaseSceneMatch[] => {
  const scenes = new Map<string, CaseSceneMatch>();
  matches.forEach(({ evidence, strength, locations }) => {
    locations.forEach((location) => {
      if (!location.sceneId || !location.sceneLabel) return;
      const key = `${location.sceneId}:${location.variantId || ''}`;
      const existing = scenes.get(key) || {
        sceneId: location.sceneId,
        sceneLabel: location.sceneLabel,
        variantId: location.variantId,
        variantLabel: location.variantLabel,
        matchedEvidenceIds: [],
        strength: 0,
      };
      if (!existing.matchedEvidenceIds.includes(evidence.id)) {
        existing.matchedEvidenceIds.push(evidence.id);
        existing.strength += strength;
      }
      scenes.set(key, existing);
    });
  });
  return [...scenes.values()].sort(
    (left, right) =>
      right.strength - left.strength ||
      left.sceneLabel.localeCompare(right.sceneLabel)
  );
};

export const matchCaseEvidence = ({
  model,
  scriptMode,
  text = '',
  filters = {},
  tokenize,
}: CaseMatchRequest): CaseMatchResult[] => {
  const selectedEvidence = structuredEvidence(model, filters);
  if (!text.trim() && selectedEvidence.length === 0) return [];

  const taxonomyMaps = taxonomyByFilter(model);
  const filterMaps = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, new Map(taxonomyMaps[key].map((item) => [item.id, item]))])
  ) as Record<FilterKey, Map<ID, Labelled & Hierarchical>>;

  return scriptsForMode(model.crimeScripts || [], scriptMode)
    .map((script): CaseMatchResult | undefined => {
      const index = buildScriptEvidenceIndex(script, model, tokenize);
      const queryEvidence = textEvidence(text, script.language, tokenize);
      const matchedEvidence: CaseEvidenceMatch[] = [];
      const unmatchedEvidence: CaseEvidenceItem[] = [];

      for (const evidence of selectedEvidence) {
        const occurrences = index.structured[evidence.filter].filter((occurrence) =>
          hasAncestor(occurrence.id, evidence.selectedId, filterMaps[evidence.filter])
        );
        if (occurrences.length === 0) return undefined;
        const exact = occurrences.some((occurrence) => occurrence.id === evidence.selectedId);
        matchedEvidence.push({
          evidence,
          strength: exact ? 4 : 3,
          locations: uniqueLocations(occurrences),
        });
      }

      queryEvidence.forEach(({ evidence, terms, anchorToken }) => {
        const recordsByToken = new Map(
          terms.map(({ token }) => [
            token,
            index.records.filter((record) => record.tokens.has(token)),
          ])
        );
        if ((recordsByToken.get(anchorToken) || []).length === 0) {
          unmatchedEvidence.push(evidence);
          return;
        }

        const matchedTerms = terms.filter(({ token }) =>
          (recordsByToken.get(token) || []).length > 0
        );
        const strongestRecords = matchedTerms.flatMap(({ token }) => {
          const records = recordsByToken.get(token) || [];
          const strength = Math.max(...records.map((record) => record.strength));
          return records.filter((record) => record.strength === strength);
        });
        const sharedContexts = matchedTerms.reduce<Set<string> | undefined>((shared, { token }) => {
          const contexts = new Set(
            (recordsByToken.get(token) || []).map(recordContextKey)
          );
          return shared === undefined
            ? contexts
            : new Set([...shared].filter((context) => contexts.has(context)));
        }, undefined);
        const termCoverage = matchedTerms.length / terms.length;
        const cohesive = matchedTerms.length < terms.length || (sharedContexts?.size || 0) > 0;
        const strength =
          matchedTerms.reduce((total, { token }) => {
            const records = recordsByToken.get(token) || [];
            return total + Math.max(...records.map((record) => record.strength));
          }, 0) /
          terms.length *
          (cohesive ? 1 : 0.85);

        matchedEvidence.push({
          evidence,
          strength,
          termCoverage,
          matchedTerms: unique(matchedTerms.map(({ label }) => label)),
          unmatchedTerms: unique(
            terms
              .filter(({ token }) => (recordsByToken.get(token) || []).length === 0)
              .map(({ label }) => label)
          ),
          locations: uniqueLocations(strongestRecords.map(
            ({ tokens: _tokens, strength: _strength, ...location }) => location
          )),
        });
      });

      if (matchedEvidence.length === 0) return undefined;
      const evidenceCount = selectedEvidence.length + queryEvidence.length;
      const coverage =
        evidenceCount === 0
          ? 0
          : matchedEvidence.reduce(
            (total, match) => total + (match.termCoverage ?? 1),
            0
          ) / evidenceCount;
      const specificity =
        matchedEvidence.reduce((total, match) => total + match.strength / 4, 0) /
        matchedEvidence.length;

      return {
        scriptId: script.id,
        scriptFamilyId: script.scriptFamilyId,
        score: Math.round((coverage * 0.6 + specificity * 0.4) * 100),
        coverage,
        specificity,
        matchedEvidence,
        unmatchedEvidence,
        scenes: sceneMatches(matchedEvidence),
      };
    })
    .filter((result): result is CaseMatchResult => typeof result !== 'undefined')
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.coverage - left.coverage ||
        left.scriptId.localeCompare(right.scriptId)
    );
};
