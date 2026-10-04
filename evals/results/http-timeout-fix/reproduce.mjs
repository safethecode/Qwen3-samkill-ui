import {createServer} from 'node:http';
import {writeFile} from 'node:fs/promises';
import {inferenceFetch} from '../../../scripts/inference-http.mjs';
const server=createServer((req,res)=>{req.resume();const timer=setTimeout(()=>res.end('{"complete":true}'),310000);res.on('close',()=>clearTimeout(timer));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const results=[];
const url=`http://127.0.0.1:${server.address().port}/api/chat`;
await Promise.all([['fetch',fetch],['inferenceFetch',inferenceFetch]].map(async([name,transport])=>{
const start=Date.now();
try{const response=await transport(url,{method:'POST',headers:{'content-type':'application/json'},body:'{}',signal:AbortSignal.timeout(360000)});results.push({name,elapsedMs:Date.now()-start,result:await response.json()});}
catch(error){results.push({name,elapsedMs:Date.now()-start,error:error.message,cause:error.cause?.code});}
await writeFile(process.env.HTTP_REPRO_OUTPUT || 'runs/http-310s-reproduction.json',JSON.stringify({node:process.version,undici:process.versions.undici,results},null,2));
}));
server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
console.log(JSON.stringify(results));
