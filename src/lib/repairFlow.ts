export type ApartmentType = 'studio' | '1room' | '2room' | '3room' | '4room';
export type BathroomType = 'combined' | 'separate';
export type FlowStepId =
	| 'parameters'
	| 'areas'
	| 'works'
	| 'estimate'
	| 'schedule'
	| 'roughMaterials'
	| 'finishMaterials';

export type RoomType = 'living' | 'kitchen' | 'hallway';
export type QuantityUnit = 'm²' | 'м' | 'п.м.' | 'шт';
export type WorkCategoryId =
	| 'walls'
	| 'floors'
	| 'ceilings'
	| 'bathWalls'
	| 'bathFloor'
	| 'electric'
	| 'plumbing'
	| 'lighting'
	| 'windowsDoors';

export type FlowStep = {
	id: FlowStepId;
	label: string;
};

export type ApartmentTypeOption = {
	value: ApartmentType;
	label: string;
};

export type RoomTemplate = {
	name: string;
	defaultArea: number;
	type: RoomType;
};

export type RoomConfig = {
	rooms: RoomTemplate[];
	totalLivingArea: number;
	bathroomArea: number;
	bathroomArea2: number;
};

export type RepairFlowInput = {
	apartmentType: ApartmentType;
	totalArea: number;
	ceilingHeight: number;
	bathroom: {
		type: BathroomType;
		primaryArea: number;
		secondaryArea: number;
	};
};

export type RoomArea = {
	name: string;
	area: number;
	type: RoomType;
	index: number;
	wallArea: number;
};

export type BathroomAreaDetail = {
	name: string;
	wallArea: number;
	floorArea: number;
};

export type AreaCalculation = {
	livingArea: number;
	bathTotal: number;
	totalWallArea: number;
	livingWallArea: number;
	livingFloor: number;
	ceilingArea: number;
	wallTile: number;
	floorTile: number;
	skirtingPerimeter: number;
	rooms: RoomArea[];
	bathrooms: BathroomAreaDetail[];
};

export type WorkOption = {
	id: string;
	label: string;
	quantityUnit?: QuantityUnit;
	defaultThickness?: number;
	materialKind: 'rough' | 'finish' | 'service';
};

export type WorkCategory = {
	id: WorkCategoryId;
	title: string;
	hint: string;
	defaultUnit: QuantityUnit;
	items: WorkOption[];
};

export type SelectedWorkOption = {
	id: string;
	categoryId: WorkCategoryId;
	categoryTitle: string;
	label: string;
	quantity: number;
	unit: QuantityUnit;
	materialKind: WorkOption['materialKind'];
	thickness?: number;
	userTouched?: boolean;
};

export type SelectionState = Record<string, SelectedWorkOption>;

export type ScheduleStage = {
	title: string;
	days: number;
	details: string;
	items: string[];
};

export type MaterialsView = {
	rough: SelectedWorkOption[];
	finish: SelectedWorkOption[];
};

export type CalculationResult =
	| {
			ok: true;
			calculation: AreaCalculation;
	  }
	| {
			ok: false;
			message: string;
	  };

export const FLOW_STEPS: FlowStep[] = [
	{ id: 'parameters', label: 'Параметры' },
	{ id: 'areas', label: 'Площади' },
	{ id: 'works', label: 'Работы' },
	{ id: 'estimate', label: 'Смета' },
	{ id: 'schedule', label: 'График' },
	{ id: 'roughMaterials', label: 'Черновые' },
	{ id: 'finishMaterials', label: 'Финишные' },
];

export const APARTMENT_TYPES: ApartmentTypeOption[] = [
	{ value: 'studio', label: 'Студия' },
	{ value: '1room', label: '1-комнатная' },
	{ value: '2room', label: '2-комнатная' },
	{ value: '3room', label: '3-комнатная' },
	{ value: '4room', label: '4-комнатная' },
];

export const ROOM_CONFIGS: Record<ApartmentType, RoomConfig> = {
	studio: {
		rooms: [{ name: 'Комната', defaultArea: 25, type: 'living' }],
		totalLivingArea: 25,
		bathroomArea: 4,
		bathroomArea2: 3,
	},
	'1room': {
		rooms: [
			{ name: 'Комната', defaultArea: 18, type: 'living' },
			{ name: 'Кухня', defaultArea: 8, type: 'kitchen' },
			{ name: 'Прихожая', defaultArea: 4, type: 'hallway' },
		],
		totalLivingArea: 30,
		bathroomArea: 4.5,
		bathroomArea2: 3.5,
	},
	'2room': {
		rooms: [
			{ name: 'Гостиная', defaultArea: 16, type: 'living' },
			{ name: 'Спальня', defaultArea: 12, type: 'living' },
			{ name: 'Кухня', defaultArea: 8, type: 'kitchen' },
			{ name: 'Прихожая', defaultArea: 5, type: 'hallway' },
		],
		totalLivingArea: 41,
		bathroomArea: 4.5,
		bathroomArea2: 3.5,
	},
	'3room': {
		rooms: [
			{ name: 'Гостиная', defaultArea: 18, type: 'living' },
			{ name: 'Спальня 1', defaultArea: 12, type: 'living' },
			{ name: 'Спальня 2', defaultArea: 10, type: 'living' },
			{ name: 'Кухня', defaultArea: 9, type: 'kitchen' },
			{ name: 'Прихожая', defaultArea: 6, type: 'hallway' },
		],
		totalLivingArea: 55,
		bathroomArea: 5,
		bathroomArea2: 4,
	},
	'4room': {
		rooms: [
			{ name: 'Гостиная', defaultArea: 20, type: 'living' },
			{ name: 'Спальня 1', defaultArea: 14, type: 'living' },
			{ name: 'Спальня 2', defaultArea: 12, type: 'living' },
			{ name: 'Детская', defaultArea: 10, type: 'living' },
			{ name: 'Кухня', defaultArea: 10, type: 'kitchen' },
			{ name: 'Прихожая', defaultArea: 7, type: 'hallway' },
		],
		totalLivingArea: 73,
		bathroomArea: 5.5,
		bathroomArea2: 4.5,
	},
};

export const WORK_CATEGORIES: WorkCategory[] = [
	{
		id: 'walls',
		title: 'Стены',
		hint: 'Жилые комнаты, кухня и прихожая',
		defaultUnit: 'm²',
		items: [
			{
				id: 'walls-plaster',
				label: 'Штукатурка стен',
				defaultThickness: 10,
				materialKind: 'rough',
			},
			{ id: 'walls-putty-wallpaper', label: 'Шпаклевка под обои', materialKind: 'rough' },
			{ id: 'walls-putty-paint', label: 'Шпаклевка под окраску', materialKind: 'rough' },
			{ id: 'walls-wallpaper', label: 'Обои', materialKind: 'finish' },
			{ id: 'walls-paint', label: 'Покраска', materialKind: 'finish' },
			{ id: 'walls-decorative', label: 'Декоративная штукатурка', materialKind: 'finish' },
			{ id: 'walls-gypsum', label: 'Стены из ГКЛ', materialKind: 'rough' },
			{ id: 'walls-tile-ceramic', label: 'Керамическая плитка', materialKind: 'finish' },
			{ id: 'walls-tile-porcelain', label: 'Керамогранит', materialKind: 'finish' },
		],
	},
	{
		id: 'floors',
		title: 'Полы',
		hint: 'Покрытия и подготовка пола без санузла',
		defaultUnit: 'm²',
		items: [
			{ id: 'floor-laminate', label: 'Ламинат', materialKind: 'finish' },
			{ id: 'floor-parquet', label: 'Паркет', materialKind: 'finish' },
			{ id: 'floor-carpet', label: 'Ковролин', materialKind: 'finish' },
			{ id: 'floor-linoleum', label: 'Линолеум', materialKind: 'finish' },
			{ id: 'floor-pvc', label: 'ПВХ', materialKind: 'finish' },
			{ id: 'floor-tile', label: 'Керамогранит', materialKind: 'finish' },
			{ id: 'floor-skirting', label: 'Плинтус', quantityUnit: 'п.м.', materialKind: 'finish' },
			{ id: 'floor-extra-self', label: 'Наливной пол', defaultThickness: 5, materialKind: 'rough' },
			{ id: 'floor-extra-screed', label: 'Стяжка', defaultThickness: 30, materialKind: 'rough' },
		],
	},
	{
		id: 'ceilings',
		title: 'Потолки',
		hint: 'Потолки по всей квартире',
		defaultUnit: 'm²',
		items: [
			{ id: 'ceil-stretch', label: 'Натяжные потолки', materialKind: 'finish' },
			{ id: 'ceil-fabric', label: 'Тканевые потолки', materialKind: 'finish' },
			{ id: 'ceil-plaster', label: 'Штукатурка потолка', materialKind: 'rough' },
			{ id: 'ceil-putty', label: 'Шпаклевка потолка', materialKind: 'rough' },
			{ id: 'ceil-paint', label: 'Покраска потолка', materialKind: 'finish' },
			{ id: 'ceil-armstrong', label: 'Потолок Армстронг', materialKind: 'finish' },
		],
	},
	{
		id: 'bathWalls',
		title: 'Санузел - стены',
		hint: 'Подготовка и облицовка стен санузла',
		defaultUnit: 'm²',
		items: [
			{ id: 'bw-tile-ceramic', label: 'Керамическая плитка', materialKind: 'finish' },
			{ id: 'bw-tile-porcelain', label: 'Керамогранит', materialKind: 'finish' },
			{ id: 'bw-mosaic', label: 'Мозаика', materialKind: 'finish' },
			{
				id: 'bw-plaster',
				label: 'Штукатурка под плитку',
				defaultThickness: 10,
				materialKind: 'rough',
			},
		],
	},
	{
		id: 'bathFloor',
		title: 'Санузел - пол',
		hint: 'Подготовка и плитка на полу санузла',
		defaultUnit: 'm²',
		items: [
			{ id: 'bf-tile-porcelain', label: 'Керамогранит', materialKind: 'finish' },
			{ id: 'bf-extra-self', label: 'Наливной пол', defaultThickness: 5, materialKind: 'rough' },
			{ id: 'bf-extra-screed', label: 'Стяжка', defaultThickness: 30, materialKind: 'rough' },
		],
	},
	{
		id: 'electric',
		title: 'Электромонтаж',
		hint: 'Точки, щиток и дополнительные линии',
		defaultUnit: 'шт',
		items: [
			{ id: 'el-outlets', label: 'Розетки', materialKind: 'service' },
			{ id: 'el-switches', label: 'Выключатели', materialKind: 'service' },
			{ id: 'el-junction', label: 'Распредкоробки', materialKind: 'service' },
			{ id: 'el-extra-panel', label: 'Электрощиток', materialKind: 'service' },
			{ id: 'el-extra-breakers', label: 'Автоматы', materialKind: 'service' },
			{ id: 'el-extra-fan', label: 'Вытяжной вентилятор', materialKind: 'service' },
			{
				id: 'el-extra-ceiling',
				label: 'Проводка по потолку',
				quantityUnit: 'м',
				materialKind: 'service',
			},
			{
				id: 'el-extra-warmfloor',
				label: 'Теплый пол',
				quantityUnit: 'm²',
				materialKind: 'service',
			},
			{ id: 'el-extra-thermostat', label: 'Терморегулятор', materialKind: 'service' },
			{ id: 'el-extra-towelwarmer', label: 'Эл. полотенцесушитель', materialKind: 'service' },
		],
	},
	{
		id: 'plumbing',
		title: 'Сантехмонтаж',
		hint: 'Сантехника и подключение оборудования',
		defaultUnit: 'шт',
		items: [
			{ id: 'plumb-installation', label: 'Инсталляция', materialKind: 'service' },
			{ id: 'plumb-toilet', label: 'Унитаз', materialKind: 'service' },
			{ id: 'plumb-bathtub', label: 'Ванна', materialKind: 'service' },
			{ id: 'plumb-shower', label: 'Душевая кабина', materialKind: 'service' },
			{
				id: 'plumb-tray',
				label: 'Поддон из керамогранита',
				quantityUnit: 'm²',
				materialKind: 'service',
			},
			{ id: 'plumb-sink', label: 'Раковина', materialKind: 'service' },
			{ id: 'plumb-sinkcabinet', label: 'Тумба с раковиной', materialKind: 'service' },
			{ id: 'plumb-heating', label: 'Радиатор отопления', materialKind: 'service' },
			{ id: 'plumb-waterheater', label: 'Водонагреватель', materialKind: 'service' },
			{ id: 'plumb-towelwarmer', label: 'Полотенцесушитель', materialKind: 'service' },
			{ id: 'plumb-glassdoors', label: 'Стеклянные дверки', materialKind: 'service' },
			{ id: 'plumb-showersystem', label: 'Душевая система', materialKind: 'service' },
			{ id: 'plumb-mirrors', label: 'Зеркала, полки', materialKind: 'finish' },
			{ id: 'plumb-wm', label: 'Стиральная машина', materialKind: 'service' },
			{ id: 'plumb-dw', label: 'Посудомоечная машина', materialKind: 'service' },
			{ id: 'plumb-kitchensink', label: 'Мойка на кухне', materialKind: 'service' },
			{ id: 'plumb-sololift', label: 'Сололифт', materialKind: 'service' },
		],
	},
	{
		id: 'lighting',
		title: 'Освещение',
		hint: 'Светильники и декоративный свет',
		defaultUnit: 'шт',
		items: [
			{ id: 'light-spots', label: 'Точечные светильники', materialKind: 'finish' },
			{ id: 'light-chandelier', label: 'Люстра', materialKind: 'finish' },
			{ id: 'light-led', label: 'LED-панели', materialKind: 'finish' },
			{ id: 'light-track', label: 'Трековые светильники', materialKind: 'finish' },
			{ id: 'light-sconce', label: 'Бра', materialKind: 'finish' },
			{ id: 'light-floor', label: 'Торшер', materialKind: 'finish' },
		],
	},
	{
		id: 'windowsDoors',
		title: 'Окна-двери',
		hint: 'Окна, двери и сопутствующие работы',
		defaultUnit: 'шт',
		items: [
			{ id: 'wd-windows', label: 'Окна', materialKind: 'finish' },
			{ id: 'wd-slopes', label: 'Откосы', materialKind: 'finish' },
			{ id: 'wd-sills', label: 'Подоконники', materialKind: 'finish' },
			{ id: 'wd-openings', label: 'Формирование проемов', materialKind: 'rough' },
			{ id: 'wd-doors', label: 'Межкомнатные двери', materialKind: 'finish' },
			{ id: 'wd-trim', label: 'Наличники', materialKind: 'finish' },
			{ id: 'wd-extensions', label: 'Доборы', materialKind: 'finish' },
			{ id: 'wd-locks', label: 'Замки и фурнитура', materialKind: 'finish' },
			{ id: 'wd-other', label: 'Прочее', materialKind: 'finish' },
		],
	},
];

export const BATHROOM_TILE_DEFAULT_OPTION_IDS = [
	'bw-plaster',
	'bw-tile-ceramic',
	'bf-extra-self',
	'bf-tile-porcelain',
];

const AREA_CATEGORY_IDS = new Set<WorkCategoryId>([
	'walls',
	'floors',
	'ceilings',
	'bathWalls',
	'bathFloor',
]);

export function getApartmentDefaults(
	apartmentType: ApartmentType,
	bathroomType: BathroomType,
): Pick<RepairFlowInput, 'totalArea'> & RepairFlowInput['bathroom'] {
	const config = ROOM_CONFIGS[apartmentType];
	const bathTotal =
		bathroomType === 'separate' ? config.bathroomArea + config.bathroomArea2 : config.bathroomArea;

	return {
		totalArea: round1(config.totalLivingArea + bathTotal),
		type: bathroomType,
		primaryArea: config.bathroomArea,
		secondaryArea: config.bathroomArea2,
	};
}

export function safeCalculateAreas(input: RepairFlowInput): CalculationResult {
	try {
		return {
			ok: true,
			calculation: calculateAreas(input),
		};
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : 'Проверьте параметры квартиры',
		};
	}
}

export function calculateAreas(input: RepairFlowInput): AreaCalculation {
	assertPositiveNumber(input.totalArea, 'Укажите общую площадь квартиры');
	assertPositiveNumber(input.ceilingHeight, 'Укажите высоту потолка');
	assertPositiveNumber(input.bathroom.primaryArea, 'Укажите площадь санузла');

	if (input.ceilingHeight < 2 || input.ceilingHeight > 6) {
		throw new Error('Укажите высоту потолка от 2 до 6 м');
	}

	if (input.bathroom.type === 'separate') {
		assertPositiveNumber(input.bathroom.secondaryArea, 'Укажите площадь ванной');
	}

	const bathTotal =
		input.bathroom.type === 'separate'
			? input.bathroom.primaryArea + input.bathroom.secondaryArea
			: input.bathroom.primaryArea;
	const livingArea = input.totalArea - bathTotal;

	if (livingArea <= 0) {
		throw new Error('Площадь квартиры должна быть больше площади санузлов');
	}

	const rooms = getRoomsData(input.apartmentType, livingArea, input.ceilingHeight);
	const bathrooms = calculateBathroomAreas(
		input.bathroom.primaryArea,
		input.ceilingHeight,
		input.bathroom.type,
		input.bathroom.secondaryArea,
	);
	const livingWallArea = round1(rooms.reduce((sum, room) => sum + room.wallArea, 0));
	const bathroomWallArea = round1(bathrooms.reduce((sum, bathroom) => sum + bathroom.wallArea, 0));
	const bathroomFloorArea = round1(
		bathrooms.reduce((sum, bathroom) => sum + bathroom.floorArea, 0),
	);
	const livingFloor = round1(rooms.reduce((sum, room) => sum + room.area, 0));
	const skirtingPerimeter = round1(rooms.reduce((sum, room) => sum + 4 * Math.sqrt(room.area), 0));

	return {
		livingArea: round1(livingArea),
		bathTotal: round1(bathTotal),
		totalWallArea: round1(livingWallArea + bathroomWallArea),
		livingWallArea,
		livingFloor,
		ceilingArea: round1(input.totalArea),
		wallTile: bathroomWallArea,
		floorTile: bathroomFloorArea,
		skirtingPerimeter,
		rooms,
		bathrooms,
	};
}

export function getQuantityUnit(category: WorkCategory, option: WorkOption): QuantityUnit {
	return option.quantityUnit ?? category.defaultUnit;
}

export function getDefaultQuantity(
	category: WorkCategory,
	option: WorkOption,
	calculation: AreaCalculation,
): number {
	const unit = getQuantityUnit(category, option);

	if (unit === 'шт') {
		return 1;
	}

	if (option.id === 'floor-skirting') {
		return calculation.skirtingPerimeter;
	}

	if (option.id === 'el-extra-ceiling') {
		return calculation.ceilingArea;
	}

	if (option.id === 'el-extra-warmfloor') {
		return calculation.livingFloor;
	}

	if (option.id === 'plumb-tray') {
		return 1;
	}

	if (!AREA_CATEGORY_IDS.has(category.id)) {
		return 1;
	}

	if (category.id === 'walls') {
		return calculation.livingWallArea;
	}

	if (category.id === 'floors') {
		return calculation.livingFloor;
	}

	if (category.id === 'ceilings') {
		return calculation.ceilingArea;
	}

	if (category.id === 'bathWalls') {
		return calculation.wallTile;
	}

	if (category.id === 'bathFloor') {
		return calculation.floorTile;
	}

	return 1;
}

export function createSelection(
	category: WorkCategory,
	option: WorkOption,
	calculation: AreaCalculation,
): SelectedWorkOption {
	return {
		id: option.id,
		categoryId: category.id,
		categoryTitle: category.title,
		label: option.label,
		quantity: getDefaultQuantity(category, option, calculation),
		unit: getQuantityUnit(category, option),
		materialKind: option.materialKind,
		...(option.defaultThickness ? { thickness: option.defaultThickness } : {}),
	};
}

export function createBathroomTileDefaultSelections(calculation: AreaCalculation): SelectionState {
	return WORK_CATEGORIES.reduce<SelectionState>((state, category) => {
		category.items.forEach((option) => {
			if (BATHROOM_TILE_DEFAULT_OPTION_IDS.includes(option.id)) {
				state[option.id] = createSelection(category, option, calculation);
			}
		});

		return state;
	}, {});
}

export function syncAutoQuantities(
	selections: SelectionState,
	calculation: AreaCalculation,
): SelectionState {
	return Object.fromEntries(
		Object.values(selections).map((selection) => {
			const category = WORK_CATEGORIES.find((item) => item.id === selection.categoryId);
			const option = category?.items.find((item) => item.id === selection.id);

			if (!category || !option || selection.userTouched) {
				return [selection.id, selection];
			}

			return [
				selection.id,
				{
					...selection,
					quantity: getDefaultQuantity(category, option, calculation),
				},
			];
		}),
	);
}

export function buildSelectedWorkOptions(selections: SelectionState): SelectedWorkOption[] {
	return Object.values(selections).sort((a, b) => {
		const categoryOrderA = WORK_CATEGORIES.findIndex((category) => category.id === a.categoryId);
		const categoryOrderB = WORK_CATEGORIES.findIndex((category) => category.id === b.categoryId);

		if (categoryOrderA !== categoryOrderB) {
			return categoryOrderA - categoryOrderB;
		}

		return a.label.localeCompare(b.label, 'ru');
	});
}

export function buildSchedulePreview(
	selectedOptions: SelectedWorkOption[],
	calculation: AreaCalculation | null,
): ScheduleStage[] {
	if (!calculation || selectedOptions.length === 0) {
		return [];
	}

	const stages: ScheduleStage[] = [];
	const roughItems = selectedOptions.filter((item) => item.materialKind === 'rough');
	const serviceItems = selectedOptions.filter((item) => item.materialKind === 'service');
	const tileItems = selectedOptions.filter(
		(item) =>
			item.categoryId === 'bathWalls' ||
			item.categoryId === 'bathFloor' ||
			item.label.toLowerCase().includes('плитк') ||
			item.label.toLowerCase().includes('керамогранит'),
	);
	const tileItemIds = new Set(tileItems.map((item) => item.id));
	const finishItems = selectedOptions.filter(
		(item) => item.materialKind === 'finish' && !tileItemIds.has(item.id),
	);

	if (roughItems.length > 0) {
		stages.push({
			title: 'Черновая подготовка',
			days: Math.max(1, Math.ceil((calculation.totalWallArea + calculation.livingFloor) / 45)),
			details: 'Подготовка стен, полов и оснований перед финишными работами.',
			items: roughItems.map((item) => item.label),
		});
	}

	if (serviceItems.length > 0) {
		stages.push({
			title: 'Инженерные работы',
			days: Math.max(1, Math.ceil(serviceItems.length / 4)),
			details: 'Электрика, сантехника и подключение выбранного оборудования.',
			items: serviceItems.map((item) => item.label),
		});
	}

	if (tileItems.length > 0) {
		stages.push({
			title: 'Плиточные работы',
			days: Math.max(1, Math.ceil((calculation.wallTile + calculation.floorTile) / 10)),
			details: 'Облицовка стен и пола санузла по выбранному пакету.',
			items: uniqueLabels(tileItems),
		});
	}

	if (finishItems.length > 0) {
		stages.push({
			title: 'Финишная сборка',
			days: Math.max(1, Math.ceil(finishItems.length / 5)),
			details: 'Финишные покрытия, свет, двери и чистовая комплектация.',
			items: finishItems.map((item) => item.label),
		});
	}

	return stages;
}

export function buildMaterialsView(selectedOptions: SelectedWorkOption[]): MaterialsView {
	return {
		rough: selectedOptions.filter(
			(item) => item.materialKind === 'rough' || item.materialKind === 'service',
		),
		finish: selectedOptions.filter((item) => item.materialKind === 'finish'),
	};
}

export function formatQuantity(value: number, unit: QuantityUnit): string {
	const formatted = Number.isInteger(value)
		? String(value)
		: String(round1(value)).replace('.', ',');
	return `${formatted} ${unit}`;
}

export function formatAreaValue(value: number): string {
	return `${String(round1(value)).replace('.', ',')} м²`;
}

function getRoomsData(
	apartmentType: ApartmentType,
	livingArea: number,
	ceilingHeight: number,
): RoomArea[] {
	const config = ROOM_CONFIGS[apartmentType];
	const scale = livingArea / config.totalLivingArea;

	return config.rooms.map((room, index) => {
		const area = round1(room.defaultArea * scale);

		return {
			name: room.name,
			area,
			type: room.type,
			index,
			wallArea: roomWallArea(area, ceilingHeight),
		};
	});
}

function calculateBathroomAreas(
	primaryArea: number,
	ceilingHeight: number,
	bathroomType: BathroomType,
	secondaryArea: number,
): BathroomAreaDetail[] {
	const primaryName = bathroomType === 'separate' ? 'Туалет' : 'Санузел';
	const details: BathroomAreaDetail[] = [
		{
			name: primaryName,
			wallArea: squareRoomWallArea(primaryArea, ceilingHeight),
			floorArea: round1(primaryArea),
		},
	];

	if (bathroomType === 'separate') {
		details.push({
			name: 'Ванная',
			wallArea: squareRoomWallArea(secondaryArea, ceilingHeight),
			floorArea: round1(secondaryArea),
		});
	}

	return details;
}

function roomWallArea(area: number, height: number): number {
	return round1(4 * Math.sqrt(area) * height);
}

function squareRoomWallArea(area: number, height: number): number {
	return round1(4 * Math.sqrt(area) * height);
}

function assertPositiveNumber(value: number, message: string): void {
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error(message);
	}
}

function round1(value: number): number {
	return Math.round(value * 10) / 10;
}

function uniqueLabels(items: SelectedWorkOption[]): string[] {
	return [...new Set(items.map((item) => item.label))];
}
