var btoa =btoa ||  function (str) {return new Buffer(str).toString('base64');};
console.log(btoa?btoa:"ss",Buffer.from('Hello World!').toString('base64'));