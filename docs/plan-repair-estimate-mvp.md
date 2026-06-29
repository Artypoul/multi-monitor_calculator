# MVP калькулятора ремонта

## Задача

Заменить первую полезную зону текущей главной страницы на MVP калькулятора предварительной сметы ремонта санузла. Дизайн из внешней папки Павла не переносим: в этой задаче нужны бизнес-логика, тексты, безопасный server-side вызов Gigma и вывод результата.

## Scope

- Форма для сценария "санузел" с полями:
  - общая площадь квартиры;
  - высота потолка;
  - тип санузла: совмещенный / раздельный;
  - площадь санузла;
  - пакет "Санузел под плитку".
- Локальный server endpoint `POST /api/repair-estimate/calculate`.
- Server-only клиент Gigma с `GIGMA_APP_TOKEN` из private env.
- Перевод человеческого сценария `bathroom_tile` в payload Gigma.
- Вывод стоимости работ, материалов, итога, основных работ, материалов и CTA "Оставить заявку".
- Человеческая ошибка: "Не удалось рассчитать, попробуйте позже или оставьте заявку".

## Не входит

- Перенос визуального редизайна Павла.
- Авторизация клиента.
- Выбор пользователем technical ids, `composition_id` или `quantity_source`.
- Реализация сценариев "вся квартира", "комната", "кухня".

## Что переиспользуем

- Паттерн server-only Gigma клиента из `C:\Users\Art\Documents\GitHub\vps_artpol\src\lib\server\gigma.ts`: `$env/dynamic/private`, отдельный helper для required env, `Token` header.
- SvelteKit route endpoint в текущем приложении.
- Существующую Svelte страницу `src/routes/+page.svelte` как точку входа главной страницы.

## Mapping `bathroom_tile`

Mapping лежит в `src/lib/server/repairEstimateMapping.ts`.

Для `scenario: "bathroom_tile"` сервер отправляет в Gigma:

| composition_id | Работа                                | quantity_source     | extra        |
| -------------- | ------------------------------------- | ------------------- | ------------ |
| 34766          | Грунтовка стен                        | bathroom_wall_area  | -            |
| 34770          | Штукатурка стен под плитку            | bathroom_wall_area  | thickness 10 |
| 34767          | Грунтовка пола                        | bathroom_floor_area | -            |
| 34777          | Наливной пол                          | bathroom_floor_area | thickness 5  |
| 34778          | Укладка керамической плитки на стенах | bathroom_wall_area  | -            |
| 34780          | Укладка керамической плитки на полу   | bathroom_floor_area | -            |

Человеческий request:

```json
{
	"repair_zone": "bathroom",
	"scenario": "bathroom_tile",
	"apartment_area": 40,
	"ceiling_height": 2.7,
	"bathroom": {
		"type": "combined",
		"area": 4
	}
}
```

Gigma payload:

```json
{
	"apartment_type": "studio",
	"total_area": 40,
	"ceiling_height": 2.7,
	"bathroom": {
		"type": "combined",
		"primary_area": 4
	},
	"selected_works": []
}
```

## Проверки

- `npm run check`
- `npm run build`
- Ручная проверка формы на примере 40 м² / санузел 4 м² / высота 2.7.
- Ожидаемый результат production API: works_total `81320.00`, materials_total `12843.00`, total `94163.00`, warnings `[]`.

## Риски и решения

- Token leakage: код Gigma лежит только в `src/lib/server`, frontend вызывает только локальный endpoint.
- Response shape от Gigma может отличаться: UI должен аккуратно читать несколько возможных контейнеров для работ и материалов.
- Ошибки Gigma и отсутствующий env не показываются пользователю технически, но логируются на сервере.
- Главная страница была prerendered; prerender нужно убрать для интерактивного серверного расчета.

## Self-review ролями

- Product contract: оставляем только MVP "санузел" и не показываем технические поля.
- Security: токен только в private env, браузер получает только агрегированный расчет.
- Frontend UX: первая зона страницы сразу калькулятор, ошибка человеческая, есть "предварительный расчет" и "Точная смета после замера".
