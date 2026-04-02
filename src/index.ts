/**
 * Disease MCP — wraps disease.sh API (COVID-19 statistics, no auth required)
 *
 * Tools:
 * - get_global_stats: Get global COVID-19 statistics
 * - get_country_stats: Get COVID-19 stats for a specific country
 * - get_historical: Get historical case/death/recovery timeline
 * - get_vaccine_stats: Get vaccination coverage timeline
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://disease.sh/v3/covid-19';

// --- Raw API types ---

type RawGlobalStats = {
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  todayCases: number;
  todayDeaths: number;
  population: number;
  updated: number;
};

type RawCountryStats = {
  country: string;
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  todayCases: number;
  todayDeaths: number;
  population: number;
};

type RawHistoricalAll = {
  cases: Record<string, number>;
  deaths: Record<string, number>;
  recovered: Record<string, number>;
};

type RawHistoricalCountry = {
  country: string;
  timeline: RawHistoricalAll;
};

type RawVaccineCoverage = Record<string, number>;

type RawVaccineCountry = {
  country: string;
  timeline: RawVaccineCoverage;
};

// --- Tool definitions ---

const tools: McpToolExport['tools'] = [
  {
    name: 'get_global_stats',
    description:
      'Get global COVID-19 statistics. Returns total cases, deaths, recovered, active cases, and today\'s new cases and deaths.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_country_stats',
    description:
      'Get COVID-19 statistics for a specific country. Returns cases, deaths, recovered, active, today\'s new cases/deaths, and population.',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'Country name or ISO code (e.g., "USA", "germany", "gb")',
        },
      },
      required: ['country'],
    },
  },
  {
    name: 'get_historical',
    description:
      'Get historical COVID-19 timeline data for a country or globally. Returns daily timeline of cases, deaths, and recoveries.',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'Country name or "all" for global data (default: "all")',
        },
        days: {
          type: 'number',
          description: 'Number of days of history to return (default: 30)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_vaccine_stats',
    description:
      'Get COVID-19 vaccination coverage timeline. Returns daily cumulative vaccine doses administered over the last 30 days.',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'Country name to get vaccine data for. Omit for global totals.',
        },
      },
      required: [],
    },
  },
];

// --- callTool dispatcher ---

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_global_stats':
      return getGlobalStats();
    case 'get_country_stats':
      return getCountryStats(args.country as string);
    case 'get_historical':
      return getHistorical(
        (args.country as string | undefined) ?? 'all',
        (args.days as number | undefined) ?? 30,
      );
    case 'get_vaccine_stats':
      return getVaccineStats(args.country as string | undefined);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Tool implementations ---

async function getGlobalStats() {
  const res = await fetch(`${BASE_URL}/all`);
  if (!res.ok) throw new Error(`disease.sh error: ${res.status}`);

  const data = (await res.json()) as RawGlobalStats;
  return {
    cases: data.cases,
    deaths: data.deaths,
    recovered: data.recovered,
    active: data.active,
    todayCases: data.todayCases,
    todayDeaths: data.todayDeaths,
  };
}

async function getCountryStats(country: string) {
  const res = await fetch(`${BASE_URL}/countries/${encodeURIComponent(country)}`);
  if (!res.ok) throw new Error(`disease.sh error: ${res.status}`);

  const data = (await res.json()) as RawCountryStats;
  return {
    country: data.country,
    cases: data.cases,
    deaths: data.deaths,
    recovered: data.recovered,
    active: data.active,
    todayCases: data.todayCases,
    todayDeaths: data.todayDeaths,
    population: data.population,
  };
}

async function getHistorical(country: string, days: number) {
  const res = await fetch(
    `${BASE_URL}/historical/${encodeURIComponent(country)}?lastdays=${days}`,
  );
  if (!res.ok) throw new Error(`disease.sh error: ${res.status}`);

  const data = (await res.json()) as RawHistoricalAll | RawHistoricalCountry;

  // Global response has timeline at top level; country response nests it
  const timeline = 'timeline' in data ? data.timeline : data;

  return {
    country,
    days,
    timeline: {
      cases: timeline.cases,
      deaths: timeline.deaths,
      recovered: timeline.recovered,
    },
  };
}

async function getVaccineStats(country?: string) {
  const url =
    country != null
      ? `${BASE_URL}/vaccine/coverage/countries/${encodeURIComponent(country)}?lastdays=30`
      : `${BASE_URL}/vaccine/coverage?lastdays=30`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`disease.sh error: ${res.status}`);

  const data = (await res.json()) as RawVaccineCoverage | RawVaccineCountry;

  // Country response wraps timeline; global response is the timeline directly
  const timeline = 'timeline' in data ? data.timeline : (data as RawVaccineCoverage);
  const label = country != null ? ('country' in data ? data.country : country) : 'global';

  return {
    country: label,
    timeline,
  };
}

export default { tools, callTool } satisfies McpToolExport;
