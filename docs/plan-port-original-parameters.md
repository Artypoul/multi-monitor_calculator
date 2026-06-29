# План переноса параметров из оригинального калькулятора

## Цель

Зафиксировать, какие настраиваемые параметры были в оригинальном multi-monitor калькуляторе, и как переносить их в новую реализацию без потери пользовательских сценариев. Этот документ пока не меняет код; он нужен как план перед реализацией.

## Источники в коде

- `src/lib/utils/interfaces.ts` — полный список типов `ISetup`, `IMonitor`, `ISettings`.
- `src/lib/utils/defaultSetup.ts` — значения по умолчанию.
- `src/lib/stores/SetupStore.ts` — setup-level состояние.
- `src/lib/stores/SettingsStore.ts` — глобальные настройки.
- `src/lib/components/fields/*` — поля, которые реально редактировались в UI.
- `src/lib/utils/enums.ts` — short codes для share-link параметров.
- `src/lib/utils/resolutions.ts` — варианты aspect ratio и resolution presets.

## Что считаем переносом

Перенос — это не просто скопировать старые компоненты. Нужно сохранить смысл пользовательских настроек:

- какие параметры пользователь мог менять;
- какие значения были по умолчанию;
- какие параметры попадали в сохраненный setup или share-link;
- какие параметры влияли на расчеты, preview или поиск монитора;
- какие параметры были только служебными.

## Группы параметров

### Setup

| Параметр      | Назначение               | Default            | Перенос  |
| ------------- | ------------------------ | ------------------ | -------- |
| `name`        | Название setup           | `Untitled Setup 1` | Да       |
| `description` | Описание setup           | пусто              | Да       |
| `deskWidth`   | Ширина стола             | `5`                | Да       |
| `deskHeight`  | Высота стола             | `2.25`             | Да       |
| `scale`       | Масштаб визуализации     | `16`               | Да       |
| `monitors`    | Список мониторов         | 1 монитор          | Да       |
| `id`          | Идентификатор setup      | UUID               | Служебно |
| `lastOpened`  | Последнее открытие setup | `null`             | Служебно |

### Monitor Basics

| Параметр                | Назначение             | Default | Перенос |
| ----------------------- | ---------------------- | ------- | ------- |
| `name`                  | Название монитора      | пусто   | Да      |
| `notes`                 | Заметки                | пусто   | Да      |
| `diagonal`              | Диагональ              | `27`    | Да      |
| `aspectRatio`           | Соотношение сторон     | `16:9`  | Да      |
| `resolution.standard`   | Пресет разрешения      | `FHD`   | Да      |
| `resolution.horizontal` | Горизонтальные пиксели | `1920`  | Да      |
| `resolution.vertical`   | Вертикальные пиксели   | `1080`  | Да      |
| `orientation`           | Ориентация             | `l`     | Да      |
| `scalingValue`          | OS scaling             | `100`   | Да      |

### Monitor Visual Layout

| Параметр     | Назначение   | Default   | Перенос                   |
| ------------ | ------------ | --------- | ------------------------- |
| `bezelWidth` | Ширина рамки | `0.75`    | Да                        |
| `bezelColor` | Цвет рамки   | `#666666` | Да                        |
| `offsetX`    | Позиция X    | `0`       | Да                        |
| `offsetY`    | Позиция Y    | `0`       | Да                        |
| `offsetZ`    | Глубина/слой | `0`       | Да, если есть 3D/stacking |
| `rotateX`    | Поворот по X | `0`       | Да, если есть swivel UI   |
| `rotateY`    | Поворот по Y | `0`       | Да, если есть swivel UI   |

### Monitor Specs

| Параметр       | Назначение         | Default | Перенос |
| -------------- | ------------------ | ------- | ------- |
| `displayType`  | Тип матрицы        | `any`   | Да      |
| `refreshRate`  | Частота обновления | `60`    | Да      |
| `responseTime` | Время отклика      | `null`  | Да      |
| `syncType`     | Тип синхронизации  | `any`   | Да      |
| `productLink`  | Ссылка на товар    | пусто   | Да      |

### Features

| Параметр            | Назначение      | Default | Перенос |
| ------------------- | --------------- | ------- | ------- |
| `features.curved`   | Изогнутый экран | `false` | Да      |
| `features.hdr`      | HDR             | `false` | Да      |
| `features.speakers` | Динамики        | `false` | Да      |
| `features.srgb`     | sRGB            | `false` | Да      |
| `features.touch`    | Touch           | `false` | Да      |
| `features.webcam`   | Webcam          | `false` | Да      |

### Ports

| Параметр            | Назначение  | Default | Перенос |
| ------------------- | ----------- | ------- | ------- |
| `ports.displayPort` | DisplayPort | `false` | Да      |
| `ports.dvi`         | DVI         | `false` | Да      |
| `ports.hdmi`        | HDMI        | `false` | Да      |
| `ports.usbc`        | USB-C       | `false` | Да      |
| `ports.vga`         | VGA         | `false` | Да      |

### Preview

| Параметр      | Назначение                 | Default                                      | Перенос                              |
| ------------- | -------------------------- | -------------------------------------------- | ------------------------------------ |
| `on`          | Включен ли экран в preview | `false`                                      | Да                                   |
| `previewMode` | Режим превью               | `wallpaper`                                  | Да                                   |
| `wallpaper`   | URL обоев                  | `https://wallpaperaccess.com/full/90278.jpg` | Да, если оставляем wallpaper preview |

### Global Settings

| Параметр                         | Назначение                             | Default    | Перенос                                   |
| -------------------------------- | -------------------------------------- | ---------- | ----------------------------------------- |
| `preferredSearchEngine`          | Поисковик/магазин для поиска монитора  | `Google`   | Да                                        |
| `expandAdvancedOptionsByDefault` | Advanced options раскрыты по умолчанию | `false`    | Да                                        |
| `expandStatsByDefault`           | Stats раскрыты по умолчанию            | `true`     | Да                                        |
| `statUnits`                      | Единицы статистики                     | `Imperial` | Да                                        |
| `inputUnits`                     | Единицы ввода                          | `Imperial` | Да                                        |
| `theme`                          | Тема                                   | `dark`     | Да, если новая оболочка поддерживает тему |

## Справочники значений

### Aspect Ratio

`32:9`, `21:9`, `16:9`, `16:10`, `16:18`, `4:3`, `5:4`, `1:1`, `2:1`, `Custom`.

В интерфейсе типов также есть optional ключи `3:2`, `5:3`, `32:10`, но в текущем `resolutions.ts` они не заполнены. Их нельзя считать полностью поддержанными без отдельной проверки UI.

### Resolution Standard

`VGA`, `HD`, `HD+`, `FHD`, `FHD+`, `QHD`, `QHD+`, `4K`, `5K`, `6K`, `8K`, `Custom`.

### Display Type

`any`, `TN`, `IPS`, `VA`, `OLED`, `Mini LED`, `Micro LED`.

### Sync Type

`any`, `none`, `G-Sync`, `FreeSync`, `ProMotion`.

### Preview Mode

`wallpaper`, `movie`, `tv`, `doc`, `apple`, `windows`.

### Search Target

`Google`, `Bing`, `DuckDuckGo`, `Amazon`, `Best Buy`, `Newegg`.

### Units

`Metric`, `Imperial`.

## Share-link параметры

В `src/lib/utils/enums.ts` были short codes для компактной ссылки:

| Short code | Параметр                |
| ---------- | ----------------------- |
| `a`        | `aspectRatio`           |
| `b`        | `bezelWidth`            |
| `c`        | `bezelColor`            |
| `d`        | `diagonal`              |
| `f`        | `setup.name`            |
| `g`        | `deskHeight`            |
| `h`        | `resolution.horizontal` |
| `i`        | `setup.id`              |
| `j`        | `rotateX`               |
| `k`        | `rotateY`               |
| `l`        | `features.hdr`          |
| `m`        | `monitor.name`          |
| `n`        | `syncType`              |
| `o`        | `orientation`           |
| `p`        | `displayType`           |
| `q`        | `offsetZ`               |
| `r`        | `refreshRate`           |
| `s`        | `resolution.standard`   |
| `t`        | `responseTime`          |
| `u`        | `features.curved`       |
| `v`        | `resolution.vertical`   |
| `w`        | `deskWidth`             |
| `x`        | `offsetX`               |
| `y`        | `offsetY`               |
| `z`        | `scale`                 |

Важно: short codes покрывают не все поля. Например, `ports`, `notes`, `wallpaper`, `previewMode`, `speakers`, `srgb`, `touch`, `webcam`, settings не входят в этот enum.

## Рекомендуемый порядок реализации

1. Перенести типы и default values.
2. Перенести setup-level параметры: `name`, `description`, `deskWidth`, `deskHeight`, `scale`, `monitors`.
3. Перенести базовые monitor параметры: диагональ, aspect ratio, resolution, orientation.
4. Перенести параметры визуального layout: bezel, offsets, rotation.
5. Перенести specs и поиск: display type, refresh rate, response time, sync type, product link, search target.
6. Перенести features и ports.
7. Перенести preview modes и wallpaper.
8. Перенести global settings.
9. Отдельно восстановить share-link совместимость, если старые ссылки нужно поддерживать.

## Проверки готовности

- Новый setup создается с теми же default values, что оригинал.
- Можно добавить несколько мониторов и настроить каждый независимо.
- Изменение aspect ratio / resolution пересчитывает размеры экрана так же, как раньше.
- Drag position сохраняет `offsetX` и `offsetY`.
- Swivel controls сохраняют `rotateX`, `rotateY`, `offsetZ`.
- Search URL собирается из тех же monitor specs.
- Если поддерживаем старые ссылки, все short codes из `ShortCode` читаются и записываются обратно.
- Settings сохраняются между перезагрузками так же, как в оригинальном сценарии.

## Риски

- Часть параметров была связана с UI-компонентами SMUI. Если новая реализация не использует SMUI, поля лучше переносить через новую форму, а не копировать старый компонент один-в-один.
- `inputUnits` менял значения диагонали при переключении Metric/Imperial. Это надо проверить отдельно, чтобы не получить двойную конвертацию.
- `3:2`, `5:3`, `32:10` есть в типах, но не в `resolutions.ts`; их нельзя включать без заполнения пресетов.
- Share-link enum не покрывает все поля, поэтому старые ссылки не являются полной копией setup.
- Preview modes `apple` и `windows` завязаны на внешние симуляторы; их лучше переносить только если они нужны продуктово.

## Открытые вопросы

- Нужно ли переносить именно старый monitor-калькулятор как функциональность, или только сохранить параметры для справки?
- Нужна ли обратная совместимость со старыми share links?
- Оставляем ли preview modes `apple` и `windows` с внешними ссылками?
- Должны ли settings жить в local storage, URL, backend или только в текущей сессии?
