const fs = require('fs');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function write(element, path, contents)
{
	const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
	let name = (element.name).toLowerCase().replace(/\s/g, '');
	name = name.replace(/\//g, '');
	// _postman_isSubFolder
	console.log('ø  Generate Test '+path+'/'+name + '.js')
	
	// write describe
    let code = contents.replace("{{describe}}", 'Test '+element.name)
    // write method
    code = code.replace("{{method}}", (element.request.method).toLowerCase())
    // write endpoint
    code = code.replace("{{endpoint}}", (element.request.url.raw).replace("{{url}}", "") )

    // write headers
    let headers = '';
    asyncForEach(element.request.header, async (header) => {
	  headers += '.set("'+header.key+'", "'+header.value+'")'; 
	})
	//await waitFor(50);
    code = code.replace("{{header}}", headers)

	// write bodies
    let bodies = '';
    if(element.request.method != "GET"){
    	bodies += '.send('
    	if(element.request.body.mode == 'formdata'){
    		bodies += '{'
    		let first = true;
	    	asyncForEach(element.request.body.formdata, async (body) => {
			  if( first === false) bodies += ',';
			  bodies += body.key+":'"+body.value+"'"; 
			  // console.log(body.key+":'"+body.value+"'");
			  first = false;
			})
			// await waitFor(50);
			bodies += '})'
	    }
	    if(element.request.body.mode == 'raw'){
	    	let first = true;
	    	bodies+= element.request.body.raw
			// await waitFor(50);
			bodies += ')'
	    }
    }
    code = code.replace("{{body}}", bodies)
    // create file test
	fs.writeFile( path+'/'+name + '.js', 
		code , function (err) { if (err) throw err;});
}

fs.readFile('sample.postman_collection.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data).item;
    let contents = fs.readFileSync('template.dot', 'utf8');
    	const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
    	console.log('')
    	asyncForEach(items, async (element) => {
    		if(element.hasOwnProperty('item')){

    			const path = 'tests/'+element.name;
    			console.log(path);
    			fs.mkdirSync(path, { recursive: true })
    			// await waitFor(50)
    			asyncForEach(element.item, async (second) => {
    				const second_path = path
    				if(second.hasOwnProperty('item') == false){
    					// console.log(second.name)
    					write(second, path, contents)

    					// await waitFor(10)
    				}else{
    					console.log('write third')
    					asyncForEach(second.item, async (third) => {
    						const third_path = second_path+'/'+second.name;
    						fs.mkdirSync(third_path+'/', { recursive: true })
    						if(third.hasOwnProperty('item') == false){
    							write(third, third_path, contents)
    						}else{
    							asyncForEach(third.item, async (fourth) => {
    								const fourth_path = third_path+'/'+third.name;
    								fs.mkdirSync(fourth_path+'/', { recursive: true })
    								if(fourth.hasOwnProperty('item') == false){
		    							write(fourth, fourth_path, contents)
		    						}else{
		    							asyncForEach(fourth.item, async (fifth) => {
		    								const fifth_path = fourth_path+'/'+fourth.name;
		    								fs.mkdirSync(fifth_path+'/', { recursive: true })
		    								await waitFor(50)
		    								if(fifth.hasOwnProperty('item') == false){
				    							write(fifth, fifth_path, contents)
				    							await waitFor(10)
				    						}else{
				    							
				    						}
		    							})
		    						}
    							})
    						}
    					})
    				}
    			})
    		}else{
    			// _postman_isSubFolder
	    		console.log('ø  Generate Test tests/'+(element.name).toLowerCase().replace(/\s/g, '') + '.js')
		    	
		    	// write describe
			    let code = contents.replace("{{describe}}", 'Test '+element.name)
			    // write method
			    code = code.replace("{{method}}", (element.request.method).toLowerCase())
			    // write endpoint
			    code = code.replace("{{endpoint}}", (element.request.url.raw).replace("{{url}}", "") )

			    // write headers
			    let headers = '';
			    asyncForEach(element.request.header, async (header) => {
				  headers += '.set("'+header.key+'", "'+header.value+'")'; 
				})
				await waitFor(50);
			    code = code.replace("{{header}}", headers)

				// write bodies
			    let bodies = '';
			    if(element.request.method != "GET"){
			    	bodies += '.send('
			    	if(element.request.body.mode == 'formdata'){
			    		bodies += '{'
			    		let first = true;
				    	asyncForEach(element.request.body.formdata, async (body) => {
						  if( first === false) bodies += ',';
						  bodies += body.key+":'"+body.value+"'"; 
						  // console.log(body.key+":'"+body.value+"'");
						  first = false;
						})
						await waitFor(50);
						bodies += '})'
				    }
				    if(element.request.body.mode == 'raw'){
				    	let first = true;
				    	bodies+= element.request.body.raw
						await waitFor(50);
						bodies += ')'
				    }
			    }
			    code = code.replace("{{body}}", bodies)
			    // create file test
				fs.writeFile( 'tests/'+(element.name).toLowerCase().replace(/\s/g, '') + '.js', 
					code , function (err) { if (err) throw err;});
    		}
		});
});

