export type RepairZone = 'bathroom';
export type RepairScenario = 'bathroom_tile';
export type BathroomType = 'combined' | 'separate';
export type QuantitySource = 'bathroom_wall_area' | 'bathroom_floor_area';

export type RepairEstimateRequest = {
	repair_zone: RepairZone;
	scenario: RepairScenario;
	apartment_area: number;
	ceiling_height: number;
	bathroom: {
		type: BathroomType;
		area: number;
	};
};

export type MappedWork = {
	composition_id: number;
	name: string;
	quantity_source: QuantitySource;
	thickness?: number;
};

export type GigmaSelectedWork = Omit<MappedWork, 'name'>;

export type GigmaRepairEstimatePayload = {
	apartment_type: 'studio';
	total_area: number;
	ceiling_height: number;
	bathroom: {
		type: BathroomType;
		primary_area: number;
	};
	selected_works: GigmaSelectedWork[];
};

export const bathroomTileWorks: MappedWork[] = [
	{
		composition_id: 34766,
		name: 'Грунтовка стен',
		quantity_source: 'bathroom_wall_area',
	},
	{
		composition_id: 34770,
		name: 'Штукатурка стен под плитку',
		quantity_source: 'bathroom_wall_area',
		thickness: 10,
	},
	{
		composition_id: 34767,
		name: 'Грунтовка пола',
		quantity_source: 'bathroom_floor_area',
	},
	{
		composition_id: 34777,
		name: 'Наливной пол',
		quantity_source: 'bathroom_floor_area',
		thickness: 5,
	},
	{
		composition_id: 34778,
		name: 'Укладка керамической плитки на стенах',
		quantity_source: 'bathroom_wall_area',
	},
	{
		composition_id: 34780,
		name: 'Укладка керамической плитки на полу',
		quantity_source: 'bathroom_floor_area',
	},
];

function toGigmaSelectedWork(work: MappedWork): GigmaSelectedWork {
	return {
		composition_id: work.composition_id,
		quantity_source: work.quantity_source,
		...(work.thickness === undefined ? {} : { thickness: work.thickness }),
	};
}

export function buildGigmaRepairEstimatePayload(
	request: RepairEstimateRequest,
): GigmaRepairEstimatePayload {
	if (request.repair_zone !== 'bathroom' || request.scenario !== 'bathroom_tile') {
		throw new Error('Unsupported repair estimate scenario');
	}

	return {
		apartment_type: 'studio',
		total_area: request.apartment_area,
		ceiling_height: request.ceiling_height,
		bathroom: {
			type: request.bathroom.type,
			primary_area: request.bathroom.area,
		},
		selected_works: bathroomTileWorks.map(toGigmaSelectedWork),
	};
}

export function getPublicWorkNamesForScenario(scenario: RepairScenario): string[] {
	if (scenario !== 'bathroom_tile') {
		return [];
	}

	return bathroomTileWorks.map((work) => work.name);
}
