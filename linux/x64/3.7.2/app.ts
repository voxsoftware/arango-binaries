import Path from 'path'
import fs from 'fs'
import http from 'https'
import Os from 'os'
import crypto from 'crypto'



export async function kawixPreload(){

	let path = Path.join(Os.homedir(),  ".kawi", "arango3.72")
	if(!fs.existsSync(path)){
		fs.mkdirSync(path)
	}


	try{
		await import('/virtual/@kawix/std/package/kwa/register')
	}catch(e){
		// load first std 
		await import('gh+/kodhework/kawix@std0.9.3/std/dist/register.js')
		await import('/virtual/@kawix/std/package/kwa/register')
	}

	let md5 = "913b35bd5e50cd798c795884c54ecd3f"
	let file = Path.join(path, "arango.kwa")
	let md5r 
	if(fs.existsSync(file)){
		// GET MD5 ...
		let md5h = crypto.createHash('md5')
		let r = fs.createReadStream(file)
		r.on("data", function(buf){
			md5h.update(buf)
		})
		await new Promise(function(a,b){
			r.on("error",b)
			r.on("end", a)
		})

		md5r = md5h.digest('hex')
	}	

	if(md5r != md5){
		let st = fs.createWriteStream(file)
		let currentreject 

		st.on("error", function(er){
			if(currentreject) currentreject(er)
		})
		
		// download the content 
		let a = function(url:string){
			return new Promise(function(resolve,reject){
				currentreject = reject
				http.get(url, function(response){

					response.socket.on("end", resolve)
					response.on("data", function(buf){
						st.write(buf)
					})

				}).on("error", reject)
			})
		}


		await a("https://raw.githubusercontent.com/voxsoftware/arango-binaries/master/linux/x64/3.7.2/arango.0")
		await a("https://raw.githubusercontent.com/voxsoftware/arango-binaries/master/linux/x64/3.7.2/arango.1")
		await a("https://raw.githubusercontent.com/voxsoftware/arango-binaries/master/linux/x64/3.7.2/arango.2")
		

		st.end()
	}

	let mod = await import(file)
	//fs.writeFileSync(vfile, 'OK')
	let u = await import(Path.join(mod["kawix.app"].resolved, "app", "Program"))
	for(let id in u){
		exports[id] = u[id]
	}


}
