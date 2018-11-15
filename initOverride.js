	var fs = require("fs");
	// 异步读取   201806221121_all  20180621_all  201806231711_all 201806232224_all
	// esop_201806261821_all
	fs.readFile('20181102-2crm.har', function (err, data) {
		if (err) {
			return console.error(err);
		}
		fs.readFile('errFile.json', function (_err, errFileData) {
			if (_err) {
				return console.error(_err);
			}
			//重载后会导致错误的文件名列表
			var errFile = (JSON.parse(errFileData.toString())).addErr0;
			var obj = JSON.parse(data.toString());
			var overrides = [],num = 1;
			var linkArr = [], names = [], sizes = [], filenames = []; // 用于判断该链接资源是否已存在
			obj.log.entries.map(function(res,i){
				var realUrl = res.request.url.split('#')[0].split('?')[0];
				var name = realUrl.substr(realUrl.lastIndexOf('/')+1,realUrl.length);
				var postfix = name.indexOf('.')>-1?name.substr(name.lastIndexOf('.')+1,name.length):'';
				
				// || postfix == 'css'
				if((postfix == 'js') && realUrl.indexOf('http')>-1 
					&& linkArr.indexOf(realUrl)==-1 && errFile.indexOf(name)==-1){
					var text = res.response.content.text;
					var textLen = text?text.length:0;
					// var filename = name.split('.')[0]+(num)+'.'+postfix;
					var filename = name.substr(0,name.lastIndexOf('.'))+(num)+'.'+postfix;
					
					linkArr.push(realUrl);
					var sliceNum = 0;
					var getFileName = function(nIdx_,fname,names_,sizes_,filenames_){
						if(nIdx_>-1 && sizes_[nIdx_]==textLen){//存在
							// fname = filenames_[nIdx_];
							overrides[sliceNum+nIdx_].origin_url.push(realUrl.replace(/\//g,'\\/').replace(/\./g,'\\.')+'.*');
							fname = '';
						}else if(nIdx_==-1){
							names.push(name);
							sizes.push(textLen);
							filenames.push(fname);
							fs.writeFile('resource/'+fname,text);
							num++;
						}else if(nIdx_>-1 && sizes_[nIdx_]!=textLen){
							var _names = names_.slice(nIdx_+1);
							var _sizes = sizes_.slice(nIdx_+1);
							var _filenames = filenames_.slice(nIdx_+1);
							var _nIdx = _names.indexOf(name);
							// console.log(_nIdx+'--'+filename,'size:'+textLen,
							// '-----'+names_[nIdx_],'size:'+sizes_[nIdx_]);
							// 递归对比当前已重载的所有同名文件
							sliceNum += nIdx_+1;
							fname = getFileName(_nIdx,fname,_names,_sizes,_filenames);
						}
						return fname;
					};

					//判断该文件名的文件是否已存在且文件大小是否一致
					var nIdx = names.indexOf(name);
					filename = getFileName(nIdx,filename,names,sizes,filenames);
					if(filename){
						overrides.push({
							"origin_url":[
								realUrl.replace(/\//g,'\\/').replace(/\./g,'\\.')+'.*'
							],
							"target_url": "override/"+filename,
							"default_url": res.request.url
						});
					}
				}
			});

			fs.writeFile('./result/overrides.json',JSON.stringify(overrides, null, 2));
			fs.writeFile('./result/already.json',JSON.stringify(linkArr, null, 2));
			fs.writeFile('./result/result.json',JSON.stringify({names,sizes,filenames}, null, 2));
		});
	});