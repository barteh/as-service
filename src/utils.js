export function hashcode(inobjin){ 
	let inobj=JSON.stringify(inobjin);
	//console.log(88888,inobj)
	//return;
	var hash = 0;

	if (inobj.length == 0) return hash;
	
	for (let i = 0; i < inobj.length; i++) {
		
		let char = inobj.charCodeAt(i);
		
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}

	
	return  hash.toString();
}

export  function objectToFormData(obj) {
    let str = "";
    for (let k in obj) {
      str += k + "=" + obj[k]+"&";
    }
    str = str.slice(0, str.length - 1);
    return str
  }
  