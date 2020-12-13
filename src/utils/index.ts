export function hashcode(inobjin : any) {
				let inobj = JSON.stringify(inobjin);
				//console.log(88888,inobj) return;
				var hash = 0;

				if (inobj.length === 0) 
								return hash;
				
				for (let i = 0; i < inobj.length; i++) {

								let char = inobj.charCodeAt(i);

								hash = ((hash << 5) - hash) + char;
								hash = hash & hash; // Convert to 32bit integer
				}

				return hash.toString();
}

export function objectToFormData(obj : any) {
				let str = "";
				for (let k in obj) {
								str += k + "=" + obj[k] + "&";
				}
				str = str.slice(0, str.length - 1);
				return str
}

export const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

export const isNode = new Function("try {return this===global;}catch(e){return false;}");
//declare type window=never;
declare type btoa = never;

export const btoa : any = isBrowser()
				? window.btoa
				: (str : string) => Buffer
								.from(str)
								.toString('base64');
export const allPossible = (params : any[]) : any[][] => {
	console.log(17,params);
				const ret:any[][]=[];
				for (let i = 0; i < params.length; i++) {
					ret.push(params.slice(0,i+1))
					
				}
				return ret;
				
}