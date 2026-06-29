<script lang="ts">
	import Button, { Icon, Label } from '@smui/button';
	import Paper, { Content } from '@smui/paper';
	import Select, { Option } from '@smui/select';
	import TextField from '@smui/textfield';
	import {
		buildMaterialsView,
		buildSchedulePreview,
		buildSelectedWorkOptions,
		createBathroomTileDefaultSelections,
		formatAreaValue,
		formatQuantity,
		getApartmentDefaults,
		safeCalculateAreas,
		syncAutoQuantities,
		type ApartmentType,
		type AreaCalculation,
		type BathroomType,
		type SelectedWorkOption,
		type SelectionState,
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

	type ContactPreference = 'phone' | 'whatsapp' | 'telegram';

	type ClientDraft = {
		name: string;
		phone: string;
		address: string;
		preferredContact: ContactPreference;
		comment: string;
	};

	const HUMAN_ERROR = 'Не удалось рассчитать, попробуйте позже или оставьте заявку';
	const SEPARATE_BATHROOM_MESSAGE =
		'Для раздельного санузла предварительную смету лучше уточнить после заявки. Площади уже посчитаны, точная смета после замера.';

	let clientName = '';
	let clientPhone = '';
	let objectAddress = '';
	let preferredContact: ContactPreference = 'phone';
	let clientComment = '';
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
	let leadPrepared = false;
	let leadMessage = '';

	$: clientDraft = {
		name: clientName.trim(),
		phone: clientPhone.trim(),
		address: objectAddress.trim(),
		preferredContact,
		comment: clientComment.trim(),
	};
	$: clientSummaryRows = buildClientSummaryRows(clientDraft);
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

	function buildClientSummaryRows(client: ClientDraft): SummaryRow[] {
		return [
			{ label: 'Клиент', value: client.name || 'Не указано' },
			{ label: 'Телефон', value: client.phone || 'Не указано' },
			{ label: 'Адрес', value: client.address || 'Можно уточнить позже' },
			{ label: 'Связь', value: contactPreferenceLabel(client.preferredContact) },
		];
	}

	function contactPreferenceLabel(value: ContactPreference): string {
		if (value === 'whatsapp') {
			return 'WhatsApp';
		}

		if (value === 'telegram') {
			return 'Telegram';
		}

		return 'Звонок';
	}

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
		resetPreparedLead();
	}

	function resetPreparedLead() {
		leadNoteVisible = false;
		leadPrepared = false;
		leadMessage = '';
	}

	function resetLeadStatus() {
		leadPrepared = false;
		leadMessage = '';
	}

	async function calculateEstimate() {
		if (!areaCalculation) {
			areaMessage = areaErrorText;
			return;
		}

		if (bathroomType === 'separate') {
			estimateResult = null;
			estimateMessage = SEPARATE_BATHROOM_MESSAGE;
			leadNoteVisible = true;
			leadPrepared = false;
			leadMessage = '';
			return;
		}

		estimateMessage = '';
		estimateResult = null;
		resetPreparedLead();
		isSubmitting = true;
		areaMessage = '';

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
			leadNoteVisible = true;
		} catch (error) {
			estimateMessage = error instanceof Error ? error.message : HUMAN_ERROR;
			leadNoteVisible = true;
		} finally {
			isSubmitting = false;
		}
	}

	function prepareLead() {
		leadNoteVisible = true;
		leadPrepared = false;

		if (!clientDraft.name) {
			leadMessage = 'Укажите имя, чтобы подготовить заявку';
			return;
		}

		if (!clientDraft.phone) {
			leadMessage = 'Укажите телефон, чтобы подготовить заявку';
			return;
		}

		leadPrepared = true;
		leadMessage =
			'Заявка подготовлена. Менеджер сможет взять контакты, адрес и рассчитанную смету с этого экрана.';
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
</script>

<main class="repair-flow">
	<section class="flow-shell">
		<Paper class="hero-paper">
			<Content>
				<div class="hero-row">
					<div class="hero-copy">
						<h3>Расчет ремонта санузла</h3>
						<p>
							Введите параметры объекта, получите предварительную стоимость и оставьте заявку на
							точную смету после замера.
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

		<div class="quick-layout">
			<Paper class="flow-panel quick-form-panel">
				<Content>
					<div class="step-heading">
						<span class="flow-kicker">1 из 2 · расчет без звонка</span>
						<h3>Расскажите об объекте</h3>
						<p>
							Для предварительной стоимости нужны только площади. Контакты можно оставить после
							расчета, когда уже виден ориентир по цене.
						</p>
					</div>

					<div class="scenario-cards" aria-label="Выбранный сценарий ремонта">
						<div class="scenario-card scenario-card--active">
							<small>Что ремонтируем</small>
							<strong>Санузел</strong>
						</div>
						<div class="scenario-card scenario-card--active">
							<small>Пакет</small>
							<strong>Санузел под плитку</strong>
						</div>
						<div class="scenario-card">
							<small>Формат</small>
							<strong>Предварительный расчет</strong>
						</div>
					</div>

					<div class="field-grid quick-field-grid">
						<TextField
							bind:value={totalArea}
							input$max="1000"
							input$min="1"
							input$step="0.1"
							label="Общая площадь квартиры"
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
								label="Ванная, м²"
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

					<div class="actions-row primary-actions">
						<Button
							disabled={isSubmitting || !areaCalculation}
							variant="raised"
							on:click={calculateEstimate}
						>
							<Icon class="material-icons">request_quote</Icon>
							<Label>{isSubmitting ? 'Считаем...' : 'Рассчитать стоимость'}</Label>
						</Button>
						<span class="cta-note">Точная смета после замера</span>
					</div>

					{#if areaErrorText}
						<p class="form-message error" role="alert">{areaErrorText}</p>
					{/if}
				</Content>
			</Paper>

			<Paper class="side-panel quick-summary-panel">
				<Content>
					<div class="side-section">
						<h4>Что уже выбрано</h4>
						<ul class="mini-checklist">
							<li><span>✓</span> Санузел</li>
							<li><span>✓</span> Пакет под плитку</li>
							<li><span>✓</span> Предварительная смета</li>
						</ul>
					</div>

					<div class="side-section">
						<h4>Параметры</h4>
						<ul class="data-list">
							<li>
								<span>Квартира</span>
								<strong>{formatAreaValue(totalArea)}</strong>
							</li>
							<li>
								<span>Потолок</span>
								<strong>{String(ceilingHeight).replace('.', ',')} м</strong>
							</li>
							<li>
								<span>Санузел</span>
								<strong>{formatAreaValue(bathroomPrimaryArea)}</strong>
							</li>
						</ul>
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
				</Content>
			</Paper>
		</div>

		{#if isSubmitting || estimateResult || estimateMessage}
			<section class="result-zone" aria-live="polite">
				<div class="result-header">
					<span class="flow-kicker">2 из 2 · результат</span>
					<h3>Предварительная смета</h3>
					<p>
						{isSeparateEstimateBlocked
							? 'Площади рассчитаны. Денежную смету для раздельного санузла уточним после заявки.'
							: 'Расчет доступен для пакета "Санузел под плитку". Точная смета после замера.'}
					</p>
				</div>

				{#if isSubmitting}
					<Paper class="state-paper">
						<Content>
							<h4>Считаем предварительную стоимость</h4>
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
				{:else if estimateMessage}
					<p class="form-message error" role="alert">{estimateMessage}</p>
				{/if}

				{#if leadNoteVisible}
					<Paper class="lead-form-paper">
						<Content>
							<div class="step-heading">
								<h3>Оставить заявку</h3>
								<p>
									Контакты нужны только для связи и замера. Расчет уже можно передать менеджеру с
									этого экрана.
								</p>
							</div>

							<div class="field-grid contact-grid">
								<TextField
									bind:value={clientName}
									input$autocomplete="name"
									label="Имя"
									on:input={resetLeadStatus}
									required
									style="width:100%;"
									variant="filled"
								/>

								<TextField
									bind:value={clientPhone}
									input$autocomplete="tel"
									label="Телефон"
									on:input={resetLeadStatus}
									required
									style="width:100%;"
									type="tel"
									variant="filled"
								/>

								<TextField
									bind:value={objectAddress}
									class="field-wide"
									input$autocomplete="street-address"
									label="Адрес объекта"
									on:input={resetLeadStatus}
									style="width:100%;"
									variant="filled"
								/>

								<Select
									bind:value={preferredContact}
									label="Как удобнее связаться"
									on:MDCSelect:change={resetLeadStatus}
									style="width:100%;"
									variant="filled"
								>
									<Option value="phone">Звонок</Option>
									<Option value="whatsapp">WhatsApp</Option>
									<Option value="telegram">Telegram</Option>
								</Select>

								<TextField
									bind:value={clientComment}
									class="field-wide"
									label="Комментарий"
									on:input={resetLeadStatus}
									style="width:100%;"
									variant="filled"
								/>
							</div>

							<div class="actions-row">
								<Button variant="raised" on:click={prepareLead}>
									<Icon class="material-icons">campaign</Icon>
									<Label>Оставить заявку</Label>
								</Button>
								<a class="phone-link" href="tel:+79529394194">Позвонить: +7 952 939-41-94</a>
							</div>

							{#if leadMessage && !leadPrepared}
								<p class="form-message error" role="alert">{leadMessage}</p>
							{/if}

							{#if leadPrepared}
								<Paper class="lead-paper">
									<Content>
										<div class="lead-header">
											<h4>Заявка подготовлена</h4>
											<p>{leadMessage}</p>
										</div>
										<div class="lead-grid">
											{#each clientSummaryRows as row}
												<div>
													<small>{row.label}</small>
													<strong>{row.value}</strong>
												</div>
											{/each}
										</div>
										{#if clientDraft.comment}
											<p class="lead-comment">{clientDraft.comment}</p>
										{/if}
									</Content>
								</Paper>
							{/if}
						</Content>
					</Paper>
				{/if}

				<div class="details-stack">
					{#if areaCalculation}
						<details class="details-panel">
							<summary>Показать расчетные площади</summary>
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
						</details>
					{/if}

					{#if scheduleStages.length > 0}
						<details class="details-panel">
							<summary>Показать ориентировочный график</summary>
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
						</details>
					{/if}

					{#if selectedOptions.length > 0}
						<details class="details-panel">
							<summary>Показать пакет работ и материалов</summary>
							<div class="detail-columns">
								<Paper class="detail-paper">
									<Content>
										<h4>Пакет работ</h4>
										<ul class="materials-list">
											{#each selectedOptions as item}
												<li>
													<span>{item.label}</span>
													<strong>{selectionMeta(item)}</strong>
												</li>
											{/each}
										</ul>
									</Content>
								</Paper>

								<Paper class="detail-paper">
									<Content>
										<h4>Материалы для обсуждения</h4>
										<ul class="materials-list">
											{#each [...materialsView.rough, ...materialsView.finish] as item}
												<li>
													<span>{item.label}</span>
													<strong>{selectionMeta(item)}</strong>
												</li>
											{/each}
										</ul>
									</Content>
								</Paper>
							</div>
						</details>
					{/if}
				</div>
			</section>
		{/if}
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
	:global(.state-paper),
	:global(.lead-form-paper),
	:global(.lead-paper) {
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
	.result-header h3,
	.side-section h4,
	:global(.detail-paper h4),
	:global(.state-paper h4) {
		text-align: left;
		margin-left: 0;
		margin-right: 0;
	}

	.hero-copy p,
	.step-heading p,
	.result-header p,
	:global(.detail-paper p),
	:global(.state-paper p) {
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
	:global(.metric-paper small) {
		display: block;
		margin-bottom: 0.25rem;
		color: rgba(0, 0, 0, 0.6);
	}

	.hero-meta a {
		display: inline-block;
		font-weight: bold;
	}

	.quick-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		gap: 1rem;
		align-items: start;
	}

	:global(.flow-panel) {
		padding: 1rem;
	}

	:global(.side-panel) {
		padding: 0.75rem;
		position: sticky;
		top: 4.5rem;
	}

	.step-heading {
		margin-bottom: 1rem;
	}

	.flow-kicker {
		display: inline-block;
		margin-bottom: 0.35rem;
		color: #a92c01;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.scenario-cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.scenario-card {
		background: rgba(103, 103, 120, 0.08);
		border: 1px solid rgba(103, 103, 120, 0.16);
		border-radius: 6px;
		padding: 0.8rem 0.9rem;
	}

	.scenario-card--active {
		border-left: 4px solid #db3801;
	}

	.scenario-card small {
		display: block;
		margin-bottom: 0.25rem;
		color: rgba(0, 0, 0, 0.58);
	}

	.scenario-card strong {
		display: block;
		line-height: 1.25;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.quick-field-grid {
		margin-top: 1rem;
	}

	:global(.field-wide) {
		grid-column: 1 / -1;
	}

	.actions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
		align-items: center;
	}

	.primary-actions {
		margin-top: 1.5rem;
	}

	.cta-note {
		color: rgba(0, 0, 0, 0.62);
		font-size: 0.95rem;
	}

	.phone-link {
		font-weight: 700;
	}

	.result-zone {
		margin-top: 1.25rem;
		display: grid;
		gap: 1rem;
	}

	.result-header {
		padding: 0 0.25rem;
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
	:global(.lead-form-paper),
	:global(.lead-paper) {
		padding: 0.35rem 0.45rem;
	}

	:global(.lead-form-paper) {
		border-left: 4px solid #db3801;
	}

	:global(.lead-paper) {
		margin-top: 1rem;
		border-left: 4px solid #db3801;
	}

	.lead-header {
		margin-bottom: 1rem;
	}

	.lead-header h4,
	.lead-header p,
	.lead-comment {
		margin-left: 0;
		margin-right: 0;
	}

	.lead-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.lead-grid div {
		background: rgba(103, 103, 120, 0.08);
		padding: 0.75rem 0.9rem;
	}

	.lead-grid small {
		display: block;
		margin-bottom: 0.25rem;
		color: rgba(0, 0, 0, 0.58);
	}

	.lead-comment {
		margin-top: 1rem;
		color: rgba(0, 0, 0, 0.68);
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

	.mini-checklist {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.55rem;
	}

	.mini-checklist li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mini-checklist span {
		color: #a92c01;
		font-weight: 700;
	}

	.side-section + .side-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(103, 103, 120, 0.14);
	}

	.details-stack {
		display: grid;
		gap: 0.75rem;
	}

	.details-panel {
		border: 1px solid rgba(103, 103, 120, 0.18);
		border-radius: 6px;
		padding: 0.9rem 1rem;
		background: rgba(255, 255, 255, 0.45);
	}

	.details-panel summary {
		cursor: pointer;
		font-weight: 700;
	}

	.details-panel[open] summary {
		margin-bottom: 1rem;
	}

	@media (max-width: 1080px) {
		.quick-layout {
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
		.scenario-cards,
		.field-grid,
		.lead-grid,
		.summary-grid,
		.summary-grid--totals,
		.detail-columns {
			grid-template-columns: 1fr;
		}

		.data-list li,
		.materials-list li {
			display: grid;
		}

		.hero-meta {
			min-width: 0;
		}
	}
</style>
