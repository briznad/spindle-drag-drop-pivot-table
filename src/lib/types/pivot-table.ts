import type { StringListMap } from 'briznads-helpers';


type PivotDimension = {
	fields     : string[];
	count      : number;
	labels?    : string[];
	hierarchy? : any;
};

export type PivotTable = {
	dimensions : {
		row    : PivotDimension;
		column : PivotDimension;
		value  : PivotDimension;
	};
	values : any;
};
