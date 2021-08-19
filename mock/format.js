const fs = require('fs');
const path = require('path');

const dailys = require('./dailys.js');

const newDailys = dailys.map((d, i) => {
	return { 
		id: dailys.length - i,
		cover: d.cover,
		zh: d.zh,
		en: d.en
	}
});

fs.writeFile(
	path.join(__dirname, './_dailys.js'),
	"module.exports = " + JSON.stringify(newDailys, null, '\t'),
	err => {
		if (err) {	
			console.error(err)
		}
	}
)