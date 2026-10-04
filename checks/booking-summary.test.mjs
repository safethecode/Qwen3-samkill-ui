import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {evaluateService} from '../scripts/service-evaluate.mjs';

test('booking persistence verifies selected class, date and time inside the visible confirmation',async()=>{
  const target=await mkdtemp(resolve('runs/booking-summary-'));
  const fixture={id:'booking-summary',scope:'test fixture',anchors:['Pottery'],flow:'booking'};
  for(const [variant,fields,expected] of [['guest-only',['guest'],'FAIL'],['complete',['title','guest','date','slot'],'PASS'],['missing-class',['guest','date','slot'],'FAIL'],['missing-date',['title','guest','slot'],'FAIL'],['missing-time',['title','guest','date'],'FAIL']]){
    const html=`<!doctype html><html><head><style>body{font:500 16px sans-serif}button,input,select{font:inherit}[hidden]{display:none!important}</style></head><body><h1>Workshop</h1><label for="search">Search</label><input id="search"><article><h3>Pottery</h3><button id="show-detail">상세</button></article><section id="detail" hidden><h2>Pottery</h2><p>Clay class with materials included.</p><button id="book">예약하기</button></section><form id="booking-form" hidden><label for="guest">Name</label><input id="guest" required><label for="date">Date</label><input id="date" type="date" required><label for="slot">Time</label><select id="slot"><option value="10:00">10:00</option><option value="14:00">14:00</option></select><button>예약 확정</button></form><section id="confirmation" hidden><div id="summary"></div><button id="cancel">예약 취소</button></section><script>const get=id=>document.getElementById(id);let saved=JSON.parse(localStorage.getItem('booking')||'null');function render(){get('confirmation').hidden=!saved;get('summary').textContent=saved?${JSON.stringify(fields)}.map(key=>saved[key]).join(' '):'';}get('show-detail').onclick=()=>get('detail').hidden=false;get('book').onclick=()=>{get('detail').hidden=true;get('booking-form').hidden=false;};get('booking-form').onsubmit=e=>{e.preventDefault();saved={title:'Pottery',guest:get('guest').value,date:get('date').value,slot:get('slot').value};localStorage.setItem('booking',JSON.stringify(saved));get('booking-form').hidden=true;render();};get('cancel').onclick=()=>{saved=null;localStorage.removeItem('booking');render();};render();</script></body></html>`;
    await writeFile(resolve(target,'index.html'),html);
    const report=await evaluateService(target,resolve(target,variant),fixture);
    const check=report.checks.find(item=>item.name==='booking-persist-cancel');
    assert.equal(check.status,expected,`${variant}: ${check.detail||''}`);
  }
});
