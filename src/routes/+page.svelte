<script lang="ts">
	import Button, { Icon, Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import Paper, { Content } from '@smui/paper';
	import Select, { Option } from '@smui/select';
	import TextField from '@smui/textfield';
	import {
		APARTMENT_TYPES,
		BATHROOM_TILE_DEFAULT_OPTION_IDS,
		FLOW_STEPS,
		WORK_CATEGORIES,
		buildMaterialsView,
		buildSchedulePreview,
		buildSelectedWorkOptions,
		createBathroomTileDefaultSelections,
		createSelection,
		formatAreaValue,
		formatQuantity,
		getApartmentDefaults,
		safeCalculateAreas,
		syncAutoQuantities,
		type ApartmentType,
		type AreaCalculation,
		type BathroomType,
		type FlowStepId,
		type SelectedWorkOption,
		type SelectionState,
		type WorkCategory,
		type WorkOption,
	} from '$lib/repairFlow';

	type EstimateLine = {
		name: string;
		quantity?: string;
		unit?: string;
		total?: number;
	};

	type EstimateResult = {
		works_total: number | null;
		materials_total: number | null;
		total: number | null;
		warnings: string[];
		works: EstimateLine[];
		materials: EstimateLine[];
	};

	type SummaryRow = {
		label: string;
		value: string;
	};

	const HUMAN_ERROR = 'Не удалось рассчитать, попробуйте позже или оставьте заявку';
	const SEPARATE_BATHROOM_MESSAGE =
		'Для раздельного санузла предварительную смету лучше уточнить после заявки. Площади уже посчитаны, точная смета после замера.';

	let activeStepId: FlowStepId = 'parameters';
	let apartmentType: ApartmentType = 'studio';
	let totalArea = 40;
	let ceilingHeight = 2.7;
	let bathroomType: BathroomType = 'combined';
	let bathroomPrimaryArea = 4;
	let bathroomSecondaryArea = 3;
	let selections: SelectionState = {};
	let hasInitializedSelections = false;
	let lastAreaSignature = '';
	let areaMessage = '';
	let estimateMessage = '';
	let isSubmitting = false;
	let estimateResult: EstimateResult | null = null;
	let leadNoteVisible = false;

	$: flowInput = {
		apartmentType,
		totalArea,
		ceilingHeight,
		bathroom: {
			type: bathroomType,
			primaryArea: bathroomPrimaryArea,
			secondaryArea: bathroomSecondaryArea,
		},
	};
	$: areaResult = safeCalculateAreas(flowInput);
	$: areaCalculation = areaResult.ok ? areaResult.calculation : null;
	$: areaErrorText = areaResult.ok ? '' : areaResult.message;
	$: areaSignature = areaCalculation
		? [
				apartmentType,
				totalArea,
				ceilingHeight,
				bathroomType,
				bathroomPrimaryArea,
				bathroomSecondaryArea,
		  ].join(':')
		: '';
	$: if (areaCalculation && areaSignature !== lastAreaSignature) {
		syncSelectionsWithArea(areaCalculation);
		lastAreaSignature = areaSignature;
	}
	$: activeStepIndex = FLOW_STEPS.findIndex((step) => step.id === activeStepId);
	$: selectedOptions = buildSelectedWorkOptions(selections);
	$: scheduleStages = buildSchedulePreview(selectedOptions, areaCalculation);
	$: totalScheduleDays = scheduleStages.reduce((sum, stage) => sum + stage.days, 0);
	$: materialsView = buildMaterialsView(selectedOptions);
	$: areaSummaryRows = areaCalculation ? buildAreaSummaryRows(areaCalculation) : [];
	$: materialLines =
		estimateResult && estimateResult.materials.length > 0
			? estimateResult.materials
			: estimateResult
			  ? [
						{
							name: 'Материалы по выбранному пакету рассчитаны общей суммой. Детальный состав уточняется после замера.',
						},
			    ]
			  : [];
	$: bathroomPrimaryLabel = bathroomType === 'separate' ? 'Туалет, м²' : 'Санузел, м²';
	$: isSeparateEstimateBlocked =
		bathroomType === 'separate' && estimateMessage === SEPARATE_BATHROOM_MESSAGE;

	function syncSelectionsWithArea(calculation: AreaCalculation) {
		if (!hasInitializedSelections) {
			selections = createBathroomTileDefaultSelections(calculation);
			hasInitializedSelections = true;
			return;
		}

		selections = syncAutoQuantities(selections, calculation);
	}

	function buildAreaSummaryRows(calculation: AreaCalculation): SummaryRow[] {
		return [
			{ label: 'Площадь без санузла', value: formatAreaValue(calculation.livingArea) },
			{ label: 'Санузел(ы) всего', value: formatAreaValue(calculation.bathTotal) },
			{ label: 'Стены всего', value: formatAreaValue(calculation.totalWallArea) },
			{ label: 'Полы без санузла', value: formatAreaValue(calculation.livingFloor) },
			{ label: 'Потолки всего', value: formatAreaValue(calculation.ceilingArea) },
			{ label: 'Стены санузла под плитку', value: formatAreaValue(calculation.wallTile) },
			{ label: 'Пол санузла под плитку', value: formatAreaValue(calculation.floorTile) },
			{ label: 'Периметр плинтуса', value: formatQuantity(calculation.skirtingPerimeter, 'п.м.') },
		];
	}

	function applyApartmentDefaults() {
		const defaults = getApartmentDefaults(apartmentType, bathroomType);
		totalArea = defaults.totalArea;
		bathroomPrimaryArea = defaults.primaryArea;
		bathroomSecondaryArea = defaults.secondaryArea;
		invalidateEstimate();
	}

	function handleBathroomTypeChange() {
		const defaults = getApartmentDefaults(apartmentType, bathroomType);

		if (bathroomType === 'separate' && bathroomSecondaryArea <= 0) {
			bathroomSecondaryArea = defaults.secondaryArea;
		}

		invalidateEstimate();
	}

	function invalidateEstimate() {
		estimateResult = null;
		estimateMessage = '';
		leadNoteVisible = false;
	}

	function canOpenStep(stepId: FlowStepId): boolean {
		if (stepId === 'parameters') {
			return true;
		}

		if (!areaCalculation) {
			return false;
		}

		if (stepId === 'schedule' || stepId === 'roughMaterials' || stepId === 'finishMaterials') {
			return selectedOptions.length > 0;
		}

		return true;
	}

	function goToStep(stepId: FlowStepId) {
		if (!canOpenStep(stepId)) {
			return;
		}

		activeStepId = stepId;
		areaMessage = '';
	}

	function showAreas() {
		if (!areaCalculation) {
			areaMessage = areaErrorText;
			activeStepId = 'parameters';
			return;
		}

		areaMessage = '';
		activeStepId = 'areas';
	}

	function showWorks() {
		if (!areaCalculation) {
			areaMessage = areaErrorText;
			activeStepId = 'parameters';
			return;
		}

		activeStepId = 'works';
	}

	function toggleWorkOption(category: WorkCategory, option: WorkOption) {
		const next = { ...selections };

		if (isPackageOption(option.id) && next[option.id]) {
			return;
		}

		if (next[option.id]) {
			delete next[option.id];
		} else if (areaCalculation) {
			next[option.id] = createSelection(category, option, areaCalculation);
		}

		selections = next;
		invalidateEstimate();
	}

	function updateSelectionQuantity(id: string, event: Event) {
		const value = readInputNumber(event);
		const selection = selections[id];

		if (!selection || value < 0) {
			return;
		}

		selections = {
			...selections,
			[id]: {
				...selection,
				quantity: value,
				userTouched: true,
			},
		};
		invalidateEstimate();
	}

	function updateSelectionThickness(id: string, event: Event) {
		const value = readInputNumber(event);
		const selection = selections[id];

		if (!selection || value <= 0) {
			return;
		}

		selections = {
			...selections,
			[id]: {
				...selection,
				thickness: value,
				userTouched: true,
			},
		};
		invalidateEstimate();
	}

	async function calculateEstimate() {
		if (!areaCalculation) {
			areaMessage = areaErrorText;
			activeStepId = 'parameters';
			return;
		}

		if (bathroomType === 'separate') {
			estimateResult = null;
			estimateMessage = SEPARATE_BATHROOM_MESSAGE;
			leadNoteVisible = true;
			activeStepId = 'estimate';
			return;
		}

		estimateMessage = '';
		estimateResult = null;
		leadNoteVisible = false;
		isSubmitting = true;
		activeStepId = 'estimate';

		try {
			const response = await fetch('/api/repair-estimate/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					repair_zone: 'bathroom',
					scenario: 'bathroom_tile',
					apartment_area: totalArea,
					ceiling_height: ceilingHeight,
					bathroom: {
						type: bathroomType,
						area: bathroomPrimaryArea,
					},
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.message ?? HUMAN_ERROR);
			}

			estimateResult = data as EstimateResult;
		} catch (error) {
			estimateMessage = error instanceof Error ? error.message : HUMAN_ERROR;
		} finally {
			isSubmitting = false;
		}
	}

	function readInputNumber(event: Event): number {
		const target = event.currentTarget as HTMLInputElement;
		const value = Number(target.value.replace(',', '.'));
		return Number.isFinite(value) ? value : 0;
	}

	function formatMoney(value: number | null): string {
		if (value === null) {
			return '—';
		}

		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 0,
		}).format(value);
	}

	function formatLineMeta(line: EstimateLine): string {
		const parts: string[] = [];

		if (line.quantity) {
			parts.push(line.quantity);
		}

		if (line.unit) {
			parts.push(line.unit);
		}

		if (line.total !== undefined) {
			parts.push(formatMoney(line.total));
		}

		return parts.join(' · ');
	}

	function selectionMeta(selection: SelectedWorkOption): string {
		const parts = [formatQuantity(selection.quantity, selection.unit)];

		if (selection.thickness) {
			parts.push(`${selection.thickness} мм`);
		}

		return parts.join(' · ');
	}

	function stepNumber(stepId: FlowStepId): number {
		return FLOW_STEPS.findIndex((step) => step.id === stepId) + 1;
	}

	function isPackageOption(optionId: string): boolean {
		return BATHROOM_TILE_DEFAULT_OPTION_IDS.includes(optionId);
	}
</script>

<main class="repair-flow">
	<section class="flow-shell">
		<Paper class="hero-paper">
			<Content>
				<div class="hero-row">
					<div class="hero-copy">
						<h3>Санузел под плитку</h3>
						<p>
							Сценарий перенесён в интерфейс проекта: вводим параметры квартиры, считаем площади,
							собираем работы и получаем предварительную смету через готовый headless-расчёт.
						</p>
					</div>
					<div class="hero-meta">
						<div>
							<small>Контакт</small>
							<a href="tel:+79529394194">+7 952 939-41-94</a>
						</div>
						<div>
							<small>Статус</small>
							<strong>Точная смета после замера</strong>
						</div>
					</div>
				</div>
			</Content>
		</Paper>

		<div class="stepper">
			{#each FLOW_STEPS as step, index (step.id)}
				<Button
					class={`step-button ${step.id === activeStepId ? 'step-active' : ''}`}
					disabled={!canOpenStep(step.id)}
					variant={step.id === activeStepId ? 'raised' : 'outlined'}
					on:click={() => goToStep(step.id)}
				>
					<Label>{index + 1}. {step.label}</Label>
				</Button>
			{/each}
		</div>

		<div class="workspace">
			<Paper class="flow-panel">
				<Content>
					{#if activeStepId === 'parameters'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('parameters')}. Параметры квартиры</h3>
							<p>Поля и сценарий собраны в material-форму проекта, без технических id.</p>
						</div>

						<div class="scenario-paper">
							<strong>Что ремонтируем:</strong>
							<span>Санузел</span>
							<strong>Пакет:</strong>
							<span>Санузел под плитку</span>
						</div>

						<div class="field-grid">
							<Select
								bind:value={apartmentType}
								label="Тип квартиры"
								on:MDCSelect:change={applyApartmentDefaults}
								style="width:100%;"
								variant="filled"
							>
								{#each APARTMENT_TYPES as type}
									<Option value={type.value}>{type.label}</Option>
								{/each}
							</Select>

							<TextField
								bind:value={totalArea}
								input$max="1000"
								input$min="1"
								input$step="0.1"
								label="Общая площадь"
								on:input={invalidateEstimate}
								required
								style="width:100%;"
								suffix="м²"
								type="number"
								variant="filled"
							/>

							<TextField
								bind:value={ceilingHeight}
								input$max="6"
								input$min="2"
								input$step="0.01"
								label="Высота потолка"
								on:input={invalidateEstimate}
								required
								style="width:100%;"
								suffix="м"
								type="number"
								variant="filled"
							/>

							<Select
								bind:value={bathroomType}
								label="Тип санузла"
								on:MDCSelect:change={handleBathroomTypeChange}
								style="width:100%;"
								variant="filled"
							>
								<Option value="combined">Совмещенный</Option>
								<Option value="separate">Раздельный</Option>
							</Select>

							<TextField
								bind:value={bathroomPrimaryArea}
								input$max="1000"
								input$min="0.1"
								input$step="0.1"
								label={bathroomPrimaryLabel}
								on:input={invalidateEstimate}
								required
								style="width:100%;"
								suffix="м²"
								type="number"
								variant="filled"
							/>

							{#if bathroomType === 'separate'}
								<TextField
									bind:value={bathroomSecondaryArea}
									input$max="1000"
									input$min="0.1"
									input$step="0.1"
									label="Ванная"
									on:input={invalidateEstimate}
									required
									style="width:100%;"
									suffix="м²"
									type="number"
									variant="filled"
								/>
							{/if}
						</div>

						{#if areaMessage}
							<p class="form-message error" role="alert">{areaMessage}</p>
						{/if}

						<div class="actions-row">
							<Button variant="raised" on:click={showAreas}>
								<Icon class="material-icons">calculate</Icon>
								<Label>Рассчитать площади</Label>
							</Button>
						</div>
					{:else if activeStepId === 'areas'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('areas')}. Площади</h3>
							<p>Формулы взяты из оригинального сценария и показаны в привычной карточной сетке.</p>
						</div>

						{#if areaCalculation}
							<div class="summary-grid">
								{#each areaSummaryRows as row}
									<Paper class="metric-paper">
										<Content>
											<small>{row.label}</small>
											<strong>{row.value}</strong>
										</Content>
									</Paper>
								{/each}
							</div>

							<div class="detail-columns">
								<Paper class="detail-paper">
									<Content>
										<h4>Стены по комнатам</h4>
										<ul class="data-list">
											{#each areaCalculation.rooms as room}
												<li>
													<span>{room.name}</span>
													<strong>{formatAreaValue(room.wallArea)}</strong>
												</li>
											{/each}
										</ul>
									</Content>
								</Paper>

								<Paper class="detail-paper">
									<Content>
										<h4>Санузел по зонам</h4>
										<ul class="data-list">
											{#each areaCalculation.bathrooms as bathroom}
												<li>
													<span>{bathroom.name} - стены</span>
													<strong>{formatAreaValue(bathroom.wallArea)}</strong>
												</li>
												<li>
													<span>{bathroom.name} - пол</span>
													<strong>{formatAreaValue(bathroom.floorArea)}</strong>
												</li>
											{/each}
										</ul>
									</Content>
								</Paper>

								<div class="detail-paper-wide">
									<Paper class="detail-paper">
										<Content>
											<h4>Полы по комнатам</h4>
											<ul class="data-list">
												{#each areaCalculation.rooms as room}
													<li>
														<span>{room.name}</span>
														<strong>{formatAreaValue(room.area)}</strong>
													</li>
												{/each}
											</ul>
										</Content>
									</Paper>
								</div>
							</div>

							<div class="actions-row">
								<Button variant="outlined" on:click={() => goToStep('parameters')}>
									<Label>Назад</Label>
								</Button>
								<Button variant="raised" on:click={showWorks}>
									<Icon class="material-icons">construction</Icon>
									<Label>Выбрать работы</Label>
								</Button>
							</div>
						{:else}
							<p class="form-message error" role="alert">{areaErrorText}</p>
						{/if}
					{:else if activeStepId === 'works'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('works')}. Работы и материалы</h3>
							<p>
								Пакет санузла уже выбран. Остальные позиции можно отмечать для графика и списков
								материалов в рамках этого сценария.
							</p>
						</div>

						<div class="category-stack">
							{#each WORK_CATEGORIES as category (category.id)}
								<Paper class="category-paper">
									<Content>
										<div class="category-title">
											<h4>{category.title}</h4>
											<p>{category.hint}</p>
										</div>

										<div class="option-grid">
											{#each category.items as option (option.id)}
												<div class="work-option" class:selected={Boolean(selections[option.id])}>
													<div class="option-field">
														<FormField>
															<Checkbox
																checked={Boolean(selections[option.id])}
																disabled={isPackageOption(option.id)}
																on:change={() => toggleWorkOption(category, option)}
															/>
															<span slot="label">
																{option.label}
																{#if isPackageOption(option.id)}
																	<small class="package-badge">В пакете</small>
																{/if}
															</span>
														</FormField>
													</div>

													{#if selections[option.id]}
														<div class="option-controls">
															<TextField
																input$min="0"
																input$step={selections[option.id].unit === 'шт' ? '1' : '0.1'}
																label="Количество"
																on:input={(event) => updateSelectionQuantity(option.id, event)}
																style="width:100%;"
																suffix={selections[option.id].unit}
																type="number"
																value={selections[option.id].quantity}
																variant="filled"
															/>

															{#if selections[option.id].thickness}
																<TextField
																	input$min="1"
																	input$step="1"
																	label="Слой"
																	on:input={(event) => updateSelectionThickness(option.id, event)}
																	style="width:100%;"
																	suffix="мм"
																	type="number"
																	value={selections[option.id].thickness}
																	variant="filled"
																/>
															{/if}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</Content>
								</Paper>
							{/each}
						</div>

						<div class="actions-row">
							<Button variant="outlined" on:click={() => goToStep('areas')}>
								<Label>Назад</Label>
							</Button>
							<Button disabled={isSubmitting} variant="raised" on:click={calculateEstimate}>
								<Icon class="material-icons">request_quote</Icon>
								<Label>{isSubmitting ? 'Считаем...' : 'Получить смету'}</Label>
							</Button>
						</div>
					{:else if activeStepId === 'estimate'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('estimate')}. Предварительная смета</h3>
							<p>
								{isSeparateEstimateBlocked
									? 'Площади рассчитаны. Денежную смету для раздельного санузла уточним после заявки.'
									: 'Расчет доступен для пакета "Санузел под плитку". Точная смета после замера.'}
							</p>
						</div>

						{#if isSubmitting}
							<Paper class="state-paper">
								<Content>
									<h4>Считаем смету</h4>
									<p>Обычно это занимает несколько секунд.</p>
								</Content>
							</Paper>
						{:else if estimateResult}
							<div class="summary-grid summary-grid--totals">
								<Paper class="metric-paper">
									<Content>
										<small>Стоимость работ</small>
										<strong>{formatMoney(estimateResult.works_total)}</strong>
									</Content>
								</Paper>
								<Paper class="metric-paper">
									<Content>
										<small>Стоимость материалов</small>
										<strong>{formatMoney(estimateResult.materials_total)}</strong>
									</Content>
								</Paper>
								<Paper class="metric-paper metric-paper--accent">
									<Content>
										<small>Итого</small>
										<strong>{formatMoney(estimateResult.total)}</strong>
									</Content>
								</Paper>
							</div>

							<div class="detail-columns">
								<Paper class="detail-paper">
									<Content>
										<h4>Основные работы</h4>
										<ul class="line-list">
											{#each estimateResult.works as work}
												<li>
													<span>{work.name}</span>
													{#if formatLineMeta(work)}
														<small>{formatLineMeta(work)}</small>
													{/if}
												</li>
											{/each}
										</ul>
									</Content>
								</Paper>

								<Paper class="detail-paper">
									<Content>
										<h4>Материалы</h4>
										<ul class="line-list">
											{#each materialLines as material}
												<li>
													<span>{material.name}</span>
													{#if formatLineMeta(material)}
														<small>{formatLineMeta(material)}</small>
													{/if}
												</li>
											{/each}
										</ul>
									</Content>
								</Paper>
							</div>

							{#if estimateResult.warnings.length > 0}
								<p class="form-message warn">
									{estimateResult.warnings.join(' ')}
								</p>
							{/if}

							<div class="actions-row">
								<Button variant="raised" on:click={() => (leadNoteVisible = true)}>
									<Icon class="material-icons">campaign</Icon>
									<Label>Оставить заявку</Label>
								</Button>
								<Button variant="outlined" on:click={() => goToStep('schedule')}>
									<Label>Посмотреть график</Label>
								</Button>
							</div>

							{#if leadNoteVisible}
								<p class="form-message info">
									Форма заявки подключается отдельно. Сейчас можно сохранить расчет и передать его
									менеджеру.
								</p>
							{/if}
						{:else}
							<Paper class="state-paper">
								<Content>
									{#if isSeparateEstimateBlocked}
										<h4>Нужна заявка для уточнения</h4>
										<p>{SEPARATE_BATHROOM_MESSAGE}</p>
										<Button variant="raised" on:click={() => (leadNoteVisible = true)}>
											<Label>Оставить заявку</Label>
										</Button>
									{:else}
										<h4>Смета еще не рассчитана</h4>
										<p>Выберите работы и запустите предварительный расчет.</p>
										<Button disabled={isSubmitting} variant="raised" on:click={calculateEstimate}>
											<Label>Рассчитать</Label>
										</Button>
									{/if}
								</Content>
							</Paper>
						{/if}

						{#if estimateMessage && !isSeparateEstimateBlocked}
							<p class="form-message error" role="alert">{estimateMessage}</p>
						{/if}
					{:else if activeStepId === 'schedule'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('schedule')}. График работ</h3>
							<p>Предварительный порядок этапов по выбранному наполнению.</p>
						</div>

						{#if scheduleStages.length > 0}
							<Paper class="state-paper">
								<Content>
									<h4>Ориентир по длительности</h4>
									<p><strong>{totalScheduleDays} дн.</strong></p>
								</Content>
							</Paper>

							<ol class="timeline">
								{#each scheduleStages as stage, index}
									<li>
										<Paper class="detail-paper">
											<Content>
												<h4>{index + 1}. {stage.title}</h4>
												<p>{stage.details}</p>
												<strong>{stage.days} дн.</strong>
												<ul class="timeline-list">
													{#each stage.items.slice(0, 5) as item}
														<li>{item}</li>
													{/each}
												</ul>
											</Content>
										</Paper>
									</li>
								{/each}
							</ol>
						{:else}
							<Paper class="state-paper">
								<Content>
									<h4>График появится после выбора работ</h4>
									<p>На шаге "Работы" отметьте нужные позиции.</p>
								</Content>
							</Paper>
						{/if}
					{:else if activeStepId === 'roughMaterials'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('roughMaterials')}. Черновые материалы</h3>
							<p>Список основан на выбранных подготовительных и инженерных позициях.</p>
						</div>

						{#if materialsView.rough.length > 0}
							<Paper class="detail-paper">
								<Content>
									<ul class="materials-list">
										{#each materialsView.rough as item}
											<li>
												<span>{item.label}</span>
												<strong>{selectionMeta(item)}</strong>
											</li>
										{/each}
									</ul>
								</Content>
							</Paper>
						{:else}
							<Paper class="state-paper">
								<Content>
									<h4>Черновые материалы не выбраны</h4>
									<p>Вернитесь к работам и отметьте подготовку, электрику или сантехнику.</p>
								</Content>
							</Paper>
						{/if}
					{:else if activeStepId === 'finishMaterials'}
						<div class="step-heading">
							<h3>Шаг {stepNumber('finishMaterials')}. Финишные материалы</h3>
							<p>Плитка, покрытия, свет и другие чистовые позиции.</p>
						</div>

						{#if materialsView.finish.length > 0}
							<Paper class="detail-paper">
								<Content>
									<ul class="materials-list">
										{#each materialsView.finish as item}
											<li>
												<span>{item.label}</span>
												<strong>{selectionMeta(item)}</strong>
											</li>
										{/each}
									</ul>
								</Content>
							</Paper>
						{:else}
							<Paper class="state-paper">
								<Content>
									<h4>Финишные материалы не выбраны</h4>
									<p>Вернитесь к работам и отметьте чистовые позиции.</p>
								</Content>
							</Paper>
						{/if}
					{/if}
				</Content>
			</Paper>

			<Paper class="side-panel">
				<Content>
					<div class="side-section">
						<h4>Сценарий</h4>
						<p>Санузел под плитку</p>
						<small>Предварительный расчет. Точная смета после замера.</small>
					</div>

					{#if areaCalculation}
						<div class="side-section">
							<h4>Ключевые площади</h4>
							<ul class="data-list">
								<li>
									<span>Стены санузла</span>
									<strong>{formatAreaValue(areaCalculation.wallTile)}</strong>
								</li>
								<li>
									<span>Пол санузла</span>
									<strong>{formatAreaValue(areaCalculation.floorTile)}</strong>
								</li>
								<li>
									<span>Потолки</span>
									<strong>{formatAreaValue(areaCalculation.ceilingArea)}</strong>
								</li>
							</ul>
						</div>
					{/if}

					<div class="side-section">
						<h4>Выбрано</h4>
						{#if selectedOptions.length > 0}
							<ul class="line-list">
								{#each selectedOptions.slice(0, 8) as item}
									<li>
										<span>{item.label}</span>
										<small>{selectionMeta(item)}</small>
									</li>
								{/each}
							</ul>
							{#if selectedOptions.length > 8}
								<p class="side-note">Еще {selectedOptions.length - 8} поз.</p>
							{/if}
						{:else}
							<p class="side-note">Позиции появятся после выбора работ.</p>
						{/if}
					</div>
				</Content>
			</Paper>
		</div>
	</section>
</main>

<style>
	main.repair-flow {
		padding: 0 1rem 4rem;
	}

	.flow-shell {
		margin: 0 auto;
		max-width: 1240px;
	}

	:global(.hero-paper),
	:global(.flow-panel),
	:global(.side-panel),
	:global(.metric-paper),
	:global(.detail-paper),
	:global(.category-paper),
	:global(.state-paper) {
		max-width: 100%;
	}

	:global(.hero-paper) {
		margin: 1rem auto 1.25rem;
	}

	.hero-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1.5rem;
		align-items: start;
	}

	.hero-copy h3,
	.step-heading h3,
	.category-title h4,
	:global(.detail-paper h4),
	:global(.state-paper h4),
	.side-section h4 {
		text-align: left;
		margin-left: 0;
		margin-right: 0;
	}

	.hero-copy p,
	.step-heading p,
	.category-title p,
	:global(.detail-paper p),
	:global(.state-paper p),
	.side-section p,
	.side-section small,
	.side-note {
		color: rgba(0, 0, 0, 0.68);
		line-height: 1.5;
	}

	.hero-meta {
		display: grid;
		gap: 0.75rem;
		min-width: 220px;
	}

	.hero-meta div {
		background: rgba(103, 103, 120, 0.08);
		border-left: 4px solid #db3801;
		padding: 0.75rem 0.9rem;
	}

	.hero-meta small,
	:global(.metric-paper small),
	.side-section small {
		display: block;
		margin-bottom: 0.25rem;
		color: rgba(0, 0, 0, 0.6);
	}

	.hero-meta a {
		display: inline-block;
		font-weight: bold;
	}

	.stepper {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		margin: 0 auto 1.25rem;
	}

	.stepper :global(.step-button) {
		min-width: 9.5rem;
	}

	.stepper :global(.step-active) {
		box-shadow: 0 0 0 1px rgba(219, 56, 1, 0.18);
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: 1rem;
		align-items: start;
	}

	:global(.flow-panel) {
		padding: 0.75rem;
	}

	:global(.side-panel) {
		padding: 0.5rem;
		position: sticky;
		top: 4.5rem;
	}

	.step-heading {
		margin-bottom: 1rem;
	}

	.scenario-paper {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.35rem 0.9rem;
		padding: 0.9rem 1rem;
		background: rgba(103, 103, 120, 0.08);
		border-left: 4px solid #db3801;
		margin-bottom: 1rem;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.actions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.form-message {
		padding: 0.9rem 1rem;
		border-radius: 4px;
		margin: 1rem 0 0;
	}

	.form-message.error {
		background: rgba(183, 28, 28, 0.12);
		color: #7f1515;
	}

	.form-message.warn {
		background: rgba(255, 193, 7, 0.16);
		color: #7c5a00;
	}

	.form-message.info {
		background: rgba(64, 179, 255, 0.12);
		color: #155d8f;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.summary-grid--totals {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	:global(.metric-paper) {
		padding: 0.2rem 0.3rem;
	}

	:global(.metric-paper strong) {
		display: block;
		font-size: 1.4rem;
		line-height: 1.25;
		text-align: left;
	}

	:global(.metric-paper--accent) {
		border-top: 3px solid #db3801;
	}

	.detail-columns {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	:global(.detail-paper),
	:global(.state-paper),
	:global(.category-paper) {
		padding: 0.3rem 0.4rem;
	}

	.detail-paper-wide {
		grid-column: 1 / -1;
	}

	.category-stack {
		display: grid;
		gap: 1rem;
	}

	.category-title {
		margin-bottom: 0.75rem;
	}

	.option-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.work-option {
		border: 1px solid rgba(103, 103, 120, 0.18);
		border-radius: 4px;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.45);
	}

	.work-option.selected {
		border-color: rgba(219, 56, 1, 0.4);
		background: rgba(219, 56, 1, 0.04);
	}

	.option-field {
		width: 100%;
	}

	.option-controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 0.75rem;
	}

	.package-badge {
		display: inline-block;
		margin-left: 0.45rem;
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
		background: rgba(219, 56, 1, 0.12);
		color: #a92c01;
		font-size: 0.8rem;
		font-weight: bold;
		white-space: nowrap;
	}

	.data-list,
	.line-list,
	.materials-list,
	.timeline-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.6rem;
	}

	.data-list li,
	.materials-list li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid rgba(103, 103, 120, 0.14);
		padding-bottom: 0.55rem;
	}

	.line-list li {
		display: grid;
		gap: 0.2rem;
		border-bottom: 1px solid rgba(103, 103, 120, 0.14);
		padding-bottom: 0.55rem;
	}

	.line-list small {
		color: rgba(0, 0, 0, 0.58);
	}

	.timeline {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		display: grid;
		gap: 0.75rem;
	}

	.timeline-list {
		margin-top: 0.65rem;
		padding-left: 1rem;
		list-style: disc;
		display: block;
	}

	.side-section + .side-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(103, 103, 120, 0.14);
	}

	.side-note {
		margin-top: 0.75rem;
	}

	@media (max-width: 1080px) {
		.workspace {
			grid-template-columns: 1fr;
		}

		:global(.side-panel) {
			position: static;
		}

		.summary-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 720px) {
		main.repair-flow {
			padding: 0 0.5rem 3rem;
		}

		.hero-row,
		.field-grid,
		.summary-grid,
		.summary-grid--totals,
		.detail-columns,
		.option-grid,
		.option-controls {
			grid-template-columns: 1fr;
		}

		.scenario-paper {
			grid-template-columns: 1fr;
		}

		.data-list li,
		.materials-list li {
			display: grid;
		}

		.stepper {
			justify-content: stretch;
		}

		.stepper :global(.step-button) {
			flex: 1 1 100%;
		}
	}
</style>
