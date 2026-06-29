import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GigmaRequestError, precalculateRepairEstimate } from '$lib/server/gigma';
import {
	buildGigmaRepairEstimatePayload,
	getPublicWorkNamesForScenario,
	type BathroomType,
	type RepairEstimateRequest,
} from '$lib/server/repairEstimateMapping';

type JsonRecord = Record<string, unknown>;

type ClientEstimateLine = {
	name: string;
	quantity?: string;
	unit?: string;
	total?: number;
};

class HumanRequestError extends Error {
	status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.name = 'HumanRequestError';
		this.status = status;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const humanRequest = parseHumanRequest(await readJsonBody(request));
		const gigmaPayload = buildGigmaRepairEstimatePayload(humanRequest);
		const gigmaResponse = await precalculateRepairEstimate(gigmaPayload);

		return json(normalizeEstimateResponse(gigmaResponse, humanRequest));
	} catch (error) {
		if (error instanceof HumanRequestError) {
			return json({ message: error.message }, { status: error.status });
		}

		if (error instanceof GigmaRequestError) {
			console.error('[repair-estimate] Gigma request failed:', error.status, error.body);
		} else {
			console.error('[repair-estimate] Calculation failed:', error);
		}

		return json(
			{ message: 'Не удалось рассчитать, попробуйте позже или оставьте заявку' },
			{ status: 502 },
		);
	}
};

async function readJsonBody(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		throw new HumanRequestError('Проверьте данные формы и попробуйте снова');
	}
}

function parseHumanRequest(input: unknown): RepairEstimateRequest {
	if (!isRecord(input)) {
		throw new HumanRequestError('Проверьте данные формы и попробуйте снова');
	}

	if (input.repair_zone !== 'bathroom' || input.scenario !== 'bathroom_tile') {
		throw new HumanRequestError('Сейчас доступен расчет только для санузла');
	}

	const apartmentArea = readNumber(input.apartment_area);
	const ceilingHeight = readNumber(input.ceiling_height);
	const bathroom = input.bathroom;

	if (!isRecord(bathroom)) {
		throw new HumanRequestError('Укажите параметры санузла');
	}

	const bathroomType = parseBathroomType(bathroom.type);
	const bathroomArea = readNumber(bathroom.area);

	if (!apartmentArea || apartmentArea <= 0 || apartmentArea > 1000) {
		throw new HumanRequestError('Укажите корректную площадь квартиры');
	}

	if (!ceilingHeight || ceilingHeight < 2 || ceilingHeight > 6) {
		throw new HumanRequestError('Укажите корректную высоту потолка');
	}

	if (!bathroomArea || bathroomArea <= 0 || bathroomArea > apartmentArea) {
		throw new HumanRequestError('Укажите корректную площадь санузла');
	}

	return {
		repair_zone: 'bathroom',
		scenario: 'bathroom_tile',
		apartment_area: roundMetric(apartmentArea),
		ceiling_height: roundMetric(ceilingHeight),
		bathroom: {
			type: bathroomType,
			area: roundMetric(bathroomArea),
		},
	};
}

function normalizeEstimateResponse(gigmaResponse: unknown, request: RepairEstimateRequest) {
	const estimate = findEstimateRecord(gigmaResponse);
	const totals = isRecord(estimate.totals) ? estimate.totals : estimate;
	const works = readLineItems(estimate, ['works', 'work_items', 'works_items', 'selected_works']);
	const materials = readLineItems(estimate, [
		'materials',
		'material_items',
		'materials_items',
		'products',
	]);

	return {
		works_total:
			readNumberFromKeys(estimate, ['works_total', 'worksTotal']) ??
			readNumberFromKeys(totals, ['works_total', 'worksTotal']),
		materials_total:
			readNumberFromKeys(estimate, ['materials_total', 'materialsTotal']) ??
			readNumberFromKeys(totals, ['materials_total', 'materialsTotal']),
		total:
			readNumberFromKeys(estimate, ['total', 'grand_total', 'grandTotal']) ??
			readNumberFromKeys(totals, ['total', 'grand_total', 'grandTotal']),
		warnings: readWarnings(estimate),
		works:
			works.length > 0
				? works
				: getPublicWorkNamesForScenario(request.scenario).map((name) => ({ name })),
		materials,
	};
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBathroomType(value: unknown): BathroomType {
	if (value === 'combined' || value === 'separate') {
		return value;
	}

	throw new HumanRequestError('Выберите тип санузла');
}

function readNumber(value: unknown): number | null {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === 'string' && value.trim()) {
		const parsed = Number(value.replace(',', '.'));
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function roundMetric(value: number): number {
	return Math.round(value * 100) / 100;
}

function findEstimateRecord(value: unknown, depth = 0): JsonRecord {
	if (!isRecord(value) || depth > 4) {
		return {};
	}

	if (
		'works_total' in value ||
		'materials_total' in value ||
		'total' in value ||
		'worksTotal' in value ||
		'materialsTotal' in value
	) {
		return value;
	}

	for (const key of ['data', 'estimate', 'result', 'repair_estimate']) {
		const nested = value[key];
		if (isRecord(nested)) {
			const found = findEstimateRecord(nested, depth + 1);
			if (Object.keys(found).length > 0) {
				return found;
			}
		}
	}

	return value;
}

function readNumberFromKeys(record: JsonRecord, keys: string[]): number | null {
	for (const key of keys) {
		const value = readNumber(record[key]);
		if (value !== null) {
			return value;
		}
	}

	return null;
}

function readWarnings(record: JsonRecord): string[] {
	const warnings = record.warnings;

	if (Array.isArray(warnings)) {
		return warnings.map(warningToText).filter((warning): warning is string => warning !== null);
	}

	if (typeof warnings === 'string' && warnings.trim()) {
		return [warnings];
	}

	return [];
}

function warningToText(warning: unknown): string | null {
	if (typeof warning === 'string' && warning.trim()) {
		return warning;
	}

	if (isRecord(warning)) {
		return readStringFromKeys(warning, ['message', 'text', 'title']);
	}

	return null;
}

function readLineItems(record: JsonRecord, keys: string[]): ClientEstimateLine[] {
	for (const key of keys) {
		const items = readArray(record[key]);
		if (items) {
			return items
				.map(normalizeLineItem)
				.filter((item): item is ClientEstimateLine => item !== null);
		}
	}

	return [];
}

function normalizeLineItem(item: unknown): ClientEstimateLine | null {
	if (typeof item === 'string' && item.trim()) {
		return { name: item };
	}

	if (!isRecord(item)) {
		return null;
	}

	const name =
		readStringFromKeys(item, ['name', 'title', 'work_name', 'material_name']) ??
		readNestedName(item, ['work', 'material', 'product', 'composition']);

	if (!name) {
		return null;
	}

	const quantity = readNumberFromKeys(item, ['quantity', 'qty', 'amount']);
	const unit = readStringFromKeys(item, ['unit', 'unit_name', 'measure']);
	const total = readNumberFromKeys(item, [
		'total',
		'total_price',
		'price_total',
		'sum',
		'amount_total',
		'cost',
		'final_price',
	]);

	return {
		name,
		...(quantity === null ? {} : { quantity: formatQuantity(quantity) }),
		...(unit ? { unit } : {}),
		...(total === null ? {} : { total }),
	};
}

function readArray(value: unknown): unknown[] | null {
	if (Array.isArray(value)) {
		return value;
	}

	if (isRecord(value)) {
		for (const key of ['data', 'items', 'list']) {
			const nested = value[key];
			if (Array.isArray(nested)) {
				return nested;
			}
		}
	}

	return null;
}

function readStringFromKeys(record: JsonRecord, keys: string[]): string | null {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string' && value.trim()) {
			return value;
		}
	}

	return null;
}

function readNestedName(record: JsonRecord, keys: string[]): string | null {
	for (const key of keys) {
		const value = record[key];
		if (!isRecord(value)) {
			continue;
		}

		const name = readStringFromKeys(value, ['name', 'title']);
		if (name) {
			return name;
		}
	}

	return null;
}

function formatQuantity(value: number): string {
	return Number.isInteger(value)
		? value.toString()
		: value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
