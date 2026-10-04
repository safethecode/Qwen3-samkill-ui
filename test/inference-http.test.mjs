import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {inferenceFetch} from '../scripts/inference-http.mjs';

async function serve(handler, run) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('inference transport waits for delayed headers and the complete chunked JSON body', async () => {
  await serve((req, res) => {
    req.resume();
    setTimeout(() => { res.write('{"message":'); setTimeout(() => res.end('"완료"}'), 30); }, 30);
  }, async url => {
    const response = await inferenceFetch(url, {method:'POST', body:'{}', signal:AbortSignal.timeout(2000)});
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {message:'완료'});
  });
});

test('explicit timeout aborts both a waiting response and an incomplete body', async () => {
  for (const partial of [false, true]) await serve((req, res) => {req.resume(); if(partial)res.write('{');}, async url => {
    await assert.rejects(inferenceFetch(url, {method:'POST', signal:AbortSignal.timeout(40)}), {name:'TimeoutError'});
  });
});

test('HTTP failures, invalid JSON and disconnected responses cannot become success', async () => {
  await serve((req, res) => {req.resume(); res.writeHead(503); res.end('{}');}, async url => {
    assert.equal((await inferenceFetch(url, {signal:AbortSignal.timeout(1000)})).ok, false);
  });
  await serve((req, res) => {req.resume(); res.end('{');}, async url => {
    const response = await inferenceFetch(url, {signal:AbortSignal.timeout(1000)});
    await assert.rejects(response.json(), SyntaxError);
  });
  await serve((req, res) => {req.resume(); res.write('{'); setTimeout(()=>res.destroy(), 10);}, async url => {
    await assert.rejects(inferenceFetch(url, {signal:AbortSignal.timeout(1000)}));
  });
});

test('inference transport requires a caller cancellation signal and HTTP protocol', () => {
  assert.throws(() => inferenceFetch('http://localhost', {}), /signal/);
  assert.throws(() => inferenceFetch('file:///test', {signal:AbortSignal.timeout(1000)}), /protocol/);
});

test('inference deadlines default to ten minutes and overrides remain bounded', async () => {
  const {inferenceTimeout} = await import('../scripts/inference-http.mjs');
  assert.equal(inferenceTimeout(undefined, {}), 600000);
  assert.equal(inferenceTimeout(120000, {}), 120000);
  assert.equal(inferenceTimeout(undefined, {QWEN_REQUEST_TIMEOUT_MS:'900000'}), 900000);
  for(const value of ['0','Infinity','abc','1800001','1.5'])assert.throws(()=>inferenceTimeout(undefined,{QWEN_REQUEST_TIMEOUT_MS:value}), /Invalid/);
});
