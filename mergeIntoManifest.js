var fs = require("fs");

var arguments = process.argv.splice(2);
if(arguments.length == 0){
    fs.readFile('manifest.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        var obj = JSON.parse(data.toString());
    
        fs.readFile('./result/overrides.json', function (err, _data) {
            obj.override_urls = [...JSON.parse(_data.toString()),...obj.need_add_to_override];
            fs.writeFile('manifest.json',JSON.stringify(obj, null, 2));
        });
    });
}else if(arguments[0] == 'chgRNToComma'){
    fs.readFile('RNString.txt', function (err, data) {
        if (err) {
            return console.error(err);
        }
        var c =  data.toString().split(/\s+/);
        fs.writeFile('./result/RNToComma.json',JSON.stringify(c, null, 2));
    });
}
