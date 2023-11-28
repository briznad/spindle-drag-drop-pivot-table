import type { Writable, Readable } from 'svelte/store';

import type { PivotTable } from '$types/pivot-table';

import { writable, derived } from 'svelte/store';

import { deepCopy, get } from 'briznads-helpers';

import { set } from '$utilities/helper';


class PivotStore {
	public data         : Writable<any[]>;
	public rowFields    : Writable<string[]>;
	public columnFields : Writable<string[]>;
	public valueFields  : Writable<string[]>;

	public parsedTable : Readable<PivotTable>;


	constructor() {
		this.data         = writable([]);
		this.rowFields    = writable([]);
		this.columnFields = writable([]);
		this.valueFields  = writable([]);
		this.parsedTable  = this.initParsedTable();
	}


	private initParsedTable() : Readable<PivotTable> {
		return derived(
			[
				this.data,
				this.rowFields,
				this.columnFields,
				this.valueFields,
			],
			(
				[
					$data,
					$rowFields,
					$columnFields,
					$valueFields,
				],
			) : PivotTable => {
				let pivotTable = this.getInitialValues();

				if ($data.length === 0 || $rowFields.length === 0) {
					return pivotTable;
				}

				pivotTable.values = $data;

				pivotTable.dimensions.row.fields = $rowFields ?? [];

				pivotTable.dimensions.column.fields = $columnFields ?? [];

				pivotTable.dimensions.value.fields = $valueFields ?? [];
				pivotTable.dimensions.value.count = pivotTable.dimensions.value.fields.length;
				pivotTable.dimensions.value.labels = pivotTable.dimensions.value.fields
					.map((field : string) => `SUM of ${ field }`);

				pivotTable = this.divideDataAndParseValues(pivotTable, 'row', 0, [ 'values' ]);

				console.debug(pivotTable);

				return pivotTable;
			},
			this.getInitialValues(),
		);
	}

	private getInitialValues() : PivotTable {
		return {
			dimensions : {
				row : {
					fields : [],
					count  : 0,
				},
				column : {
					fields : [],
					count  : 0,
				},
				value : {
					fields : [],
					count  : 0,
				},
			},
			values : {},
		};
	}

	private divideDataAndParseValues(
		pivotTable       : PivotTable,
		currentDimension : 'row' | 'column',
		currentIndex     : number,
		currentPath      : string[],
	) : PivotTable {
		const dimension : string = pivotTable.dimensions[ currentDimension ].fields[ currentIndex ];

		const data = get(pivotTable, currentPath);

		const dividedData : any = {};

		for (const row of data) {
			const label = row[dimension];

			if (!(label in dividedData)) {
				dividedData[label] = [];
			}

			dividedData[label].push(row);
		}

		if (!pivotTable.dimensions[ currentDimension ].hierarchy) {
			pivotTable.dimensions[ currentDimension ].hierarchy = {};
		}

		pivotTable.dimensions[ currentDimension ].count = pivotTable.dimensions[ currentDimension ].count || 1 * Object.keys(dividedData).length;

		set(pivotTable, currentPath, dividedData);

		currentIndex++;

		if (currentDimension === 'row' && pivotTable.dimensions.row.fields[ currentIndex ] == undefined) {
			currentDimension = 'column';
			currentIndex = 0;

			pivotTable.dimensions.row.hierarchy = deepCopy(pivotTable.values) || {};
		}

		for (const key in dividedData) {
			const newPath = currentPath.concat(key);

			if (pivotTable.dimensions[ currentDimension ].fields[ currentIndex ] == undefined) {
				this.parseValues(pivotTable, newPath);
			} else {
				this.divideDataAndParseValues(pivotTable, currentDimension, currentIndex, newPath);
			}
		}

		return pivotTable;
	}

	private parseValues(
		pivotTable  : PivotTable,
		currentPath : string[],
	) : PivotTable {
		const data = get(pivotTable, currentPath);

		const values = data.reduce((accumulation : any, row : any) => {
			for (const valueField of pivotTable.dimensions.value.fields) {
				if (!(valueField in accumulation)) {
					accumulation[ valueField ] = 0;
				}

				accumulation[ valueField ] += row[ valueField ] ?? 0;
			}

			return accumulation;
		}, {});

		set(pivotTable, currentPath, { values });

		return pivotTable;
	}
}

export const pivot = new PivotStore();
