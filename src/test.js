const fs = require('fs');

console.log('A');

setTimeout(() => console.log('B'), 0);

setImmediate(() => console.log('C'));

process.nextTick(() => console.log('D'));

fs.readFile('nonexistent.txt', (err, data) => {
    if (err) console.log('E');
});

console.log('F');
