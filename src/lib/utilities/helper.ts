import { get, listify, deepCopy } from 'briznads-helpers';


export function handleEnterKey(event : any, callback : (event? : any) => void) : void {
	if (event.key === 'Enter') {
		callback(event);
	}
}

export const HEK = handleEnterKey;

export function set(obj : object, props : string | Array<string | number>, value : any) : boolean {
	const propsArr = deepCopy(listify(props));

  const lastProp = propsArr.pop();

	const nestedObj = get(obj, propsArr);

  if (nestedObj === undefined || lastProp === undefined) {
    return false;
  }

  nestedObj[ lastProp ] = value;

  return true;
}
