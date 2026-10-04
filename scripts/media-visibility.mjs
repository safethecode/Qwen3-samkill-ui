export async function inspectMediaVisibility(page) {
  const results = await page.locator('img').evaluateAll(images => images.flatMap(image => {
    const box = image.getBoundingClientRect();
    if (!box.width || !box.height || !image.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})) return [];
    const findings = [];
    if (!image.complete || !image.naturalWidth) findings.push({status:'FAIL',problem:'Rendered image did not load'});
    let visible = {left:box.left,top:box.top,right:box.right,bottom:box.bottom};
    const intersect = bounds => {
      visible = {left:Math.max(visible.left,bounds.left),top:Math.max(visible.top,bounds.top),right:Math.min(visible.right,bounds.right),bottom:Math.min(visible.bottom,bounds.bottom)};
    };
    for (let node=image;node;node=node.parentElement) {
      const style=getComputedStyle(node);
      const bounds=node.getBoundingClientRect();
      if (node!==image) {
        if (/hidden|clip|scroll|auto/.test(style.overflowX)) intersect({left:bounds.left,right:bounds.right,top:-Infinity,bottom:Infinity});
        if (/hidden|clip|scroll|auto/.test(style.overflowY)) intersect({left:-Infinity,right:Infinity,top:bounds.top,bottom:bounds.bottom});
      }
      if (style.clipPath==='none') continue;
      const inset=/^inset\(([^)]+)\)$/.exec(style.clipPath);
      const tokens=inset?.[1].split(/\s+round\s+/)[0].trim().split(/\s+/);
      if (!tokens || tokens.length>4 || tokens.some(value=>!/^[-\d.]+(?:px|%)?$/.test(value))) {
        findings.push({status:'UNVERIFIED',problem:`Image uses an unmeasured clip path: ${style.clipPath}`});
        continue;
      }
      const [top,right=top,bottom=top,left=right]=tokens;
      const distance=(value,extent)=>parseFloat(value)*(value.endsWith('%')?extent/100:1);
      intersect({left:bounds.left+distance(left,bounds.width),right:bounds.right-distance(right,bounds.width),top:bounds.top+distance(top,bounds.height),bottom:bounds.bottom-distance(bottom,bounds.height)});
    }
    if (visible.right-visible.left<=0.5 || visible.bottom-visible.top<=0.5) findings.push({status:'FAIL',problem:'Image has no visible area after rectangular clipping'});
    return [{src:image.getAttribute('src'),width:box.width,height:box.height,visible,findings}];
  }));
  return {results,issues:results.flatMap(result=>result.findings.map(finding=>({...finding,src:result.src}))),scope:'Loaded image boxes and rectangular overflow/inset clipping only. Occlusion, SVG paint, arbitrary clipping shapes and perceptual reference fidelity are not certified.'};
}
