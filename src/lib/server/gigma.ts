import { env } from '$env/dynamic/private';
import { requirePrivateEnv } from '$lib/server/env';
import type { GigmaRepairEstimatePayload } from '$lib/server/repairEstimateMapping';

function getConfig() {
	return {
		apiUrl: env.GIGMA_API_URL ?? 'https://api.gigma.ru/api',
		appToken: requirePrivateEnv('GIGMA_APP_TOKEN', env.GIGMA_APP_TOKEN),
	};
}

function headers(): Record<string, string> {
	const { appToken } = getConfig();

	return {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		Token: appToken,
	};
}

export class GigmaRequestError extends Error {
	status: number;
	body: unknown;

	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.name = 'GigmaRequestError';
		this.status = status;
		this.body = body;
	}
}

async function readJsonSafely(res: Response) {
	const text = await res.text();

	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export async function getRepairEstimateConfig() {
	const { apiUrl } = getConfig();
	const res = await fetch(`${apiUrl}/counterparty/repair-estimates/config`, {
		method: 'GET',
		headers: headers(),
	});
	const body = await readJsonSafely(res);

	if (!res.ok) {
		throw new GigmaRequestError('repair estimate config failed', res.status, body);
	}

	return body;
}

export async function precalculateRepairEstimate(payload: GigmaRepairEstimatePayload) {
	const { apiUrl } = getConfig();
	const res = await fetch(`${apiUrl}/counterparty/repair-estimates/precalculate`, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify(payload),
	});
	const body = await readJsonSafely(res);

	if (!res.ok) {
		throw new GigmaRequestError('repair estimate precalculate failed', res.status, body);
	}

	return body;
}
