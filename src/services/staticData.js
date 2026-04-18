const BASE_URL = '/data';

async function fetchJSON(filename) {
  try {
    const response = await fetch(`${BASE_URL}/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    throw error;
  }
}

export async function getPollutantData() {
  return fetchJSON('pollutant.json');
}

export async function getOutliersData() {
  return fetchJSON('outliers.json');
}

export async function getSafeData() {
  return fetchJSON('safe.json');
}

export async function getRatioData() {
  return fetchJSON('ratio.json');
}

export async function getRulesData() {
  return fetchJSON('rules.json');
}

export async function searchRules(params) {
  const allRules = await getRulesData();

  let filtered = allRules;

  if (params.antecedents) {
    const searchTerm = params.antecedents.toLowerCase();
    filtered = filtered.filter(rule =>
      rule.antecedents.toLowerCase().includes(searchTerm)
    );
  }

  if (params.consequents) {
    const searchTerm = params.consequents.toLowerCase();
    filtered = filtered.filter(rule =>
      rule.consequents.toLowerCase().includes(searchTerm)
    );
  }

  if (params.minConfidence !== undefined) {
    filtered = filtered.filter(rule => rule.confidence >= params.minConfidence);
  }

  if (params.minSupport !== undefined) {
    filtered = filtered.filter(rule => rule.support >= params.minSupport);
  }

  if (params.minLift !== undefined) {
    filtered = filtered.filter(rule => rule.lift >= params.minLift);
  }

  return filtered;
}

export default {
  getPollutantData,
  getOutliersData,
  getSafeData,
  getRatioData,
  getRulesData,
  searchRules
};