// grid-core.js — v29
// ══════════════════════════════════════════════════════════════════════════════
// The ONE shared copy of the code that draws an Arrow Word puzzle grid.
// It was moved here, unchanged in behaviour, from builder.html — the builder is
// the master copy. Pages call it through the "ArrowGrid" object.
// Change how the grid is DRAWN here, not in the pages. Needs grid-core.css.
//
// v29 - First version. Used by builder.html.
// ══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Arrow SVG ───────────────────────────────────────────────────────────────
  function arrowSVG(dir, s) {
    const c=s/2, m=Math.ceil(s*0.12), e=s-m;
    const sw=Math.max(1.6, s/12);
    const ahLarge=s*0.34, ahSmall=s*0.25;
    function head(x,y,dx,dy,size='large'){
      const ah = size === 'small' ? ahSmall : ahLarge;
      const l=Math.sqrt(dx*dx+dy*dy),nx=dx/l,ny=dy/l,px=-ny,py=nx;
      return `M${x-nx*ah+px*ah*0.45},${y-ny*ah+py*ah*0.45} L${x},${y} L${x-nx*ah-px*ah*0.45},${y-ny*ah-py*ah*0.45}`;
    }
    const paths={
      right:    [`M${m},${c} L${e},${c}`,          head(e,c,1,0,'large')],
      left:     [`M${e},${c} L${m},${c}`,          head(m,c,-1,0,'large')],
      down:     [`M${c},${m} L${c},${e}`,          head(c,e,0,1,'large')],
      up:       [`M${c},${e} L${c},${m}`,          head(c,m,0,-1,'large')],
      'right-down': [`M${m},${c} L${c},${c} L${c},${1.2*e-0.2*c}`, head(c,1.2*e-0.2*c,0,1,'small')],
      'down-right': [`M${c},${m} L${c},${c} L${1.2*e-0.2*c},${c}`, head(1.2*e-0.2*c,c,1,0,'small')],
      'left-down':  [`M${e},${c} L${c},${c} L${c},${1.2*e-0.2*c}`, head(c,1.2*e-0.2*c,0,1,'small')],
      'down-left':  [`M${c},${m} L${c},${c} L${1.2*m-0.2*c},${c}`, head(1.2*m-0.2*c,c,-1,0,'small')],
      'right-up':   [`M${m},${c} L${c},${c} L${c},${1.2*m-0.2*c}`, head(c,1.2*m-0.2*c,0,-1,'small')],
      'up-right':   [`M${c},${e} L${c},${c} L${1.2*e-0.2*c},${c}`, head(1.2*e-0.2*c,c,1,0,'small')],
      'left-up':    [`M${e},${c} L${c},${c} L${c},${1.2*m-0.2*c}`, head(c,1.2*m-0.2*c,0,-1,'small')],
      'up-left':    [`M${c},${e} L${c},${c} L${1.2*m-0.2*c},${c}`, head(1.2*m-0.2*c,c,-1,0,'small')],
    };
    const [p,a]=paths[dir]||paths.right;
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg"><path d="${p}" stroke="#7744bb" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${a}" stroke="#7744bb" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // The small, thin arrow drawn inside the first answer square of a word.
  function answerArrowSVG(dir,s,color='#7744bb'){
    const thinStroke=Math.max(1,s/16);
    return arrowSVG(dir,s)
      .replace(/stroke-width="[^"]+"/g,`stroke-width="${thinStroke}"`)
      .replaceAll('#7744bb',color);
  }

  // ── Word placement ──────────────────────────────────────────────────────────
  // Convention: letters are placed in natural reading order
  // (left-to-right for horizontal words, top-to-bottom for vertical words)
  function getWordCells(dir,ans,or,oc){
    const len=ans.length, cells=[];
    if(dir==='right')     {for(let i=0;i<len;i++)cells.push([or,oc+1+i]);}
    else if(dir==='left') {for(let i=0;i<len;i++)cells.push([or,oc-len+i]);}
    else if(dir==='down') {for(let i=0;i<len;i++)cells.push([or+1+i,oc]);}
    else if(dir==='up')   {for(let i=0;i<len;i++)cells.push([or-len+i,oc]);}
    else if(dir==='right-down'){cells.push([or,oc+1]);for(let i=1;i<len;i++)cells.push([or+i,oc+1]);}
    else if(dir==='down-right'){cells.push([or+1,oc]);for(let i=1;i<len;i++)cells.push([or+1,oc+i]);}
    else if(dir==='left-down') {cells.push([or,oc-1]);for(let i=1;i<len;i++)cells.push([or+i,oc-1]);}
    else if(dir==='down-left') {const t=[[or+1,oc]];for(let i=1;i<len;i++)t.push([or+1,oc-i]);t.sort((a,b)=>a[1]-b[1]);cells.push(...t);}
    else if(dir==='right-up')  {const t=[[or,oc+1]];for(let i=1;i<len;i++)t.push([or-i,oc+1]);t.sort((a,b)=>a[0]-b[0]);cells.push(...t);}
    else if(dir==='up-right')  {const t=[[or-1,oc]];for(let i=1;i<len;i++)t.push([or-1,oc+i]);cells.push(...t);}
    else if(dir==='left-up')   {const t=[[or,oc-1]];for(let i=1;i<len;i++)t.push([or-i,oc-1]);t.sort((a,b)=>a[0]-b[0]);cells.push(...t);}
    else if(dir==='up-left')   {const t=[[or-1,oc]];for(let i=1;i<len;i++)t.push([or-1,oc-i]);t.sort((a,b)=>a[1]-b[1]);cells.push(...t);}
    return cells;
  }

  // The first answer square of a word, and which edge its arrow sits on.
  function firstAnswerTarget(dir,or,oc){
    const steps={
      right:[0,1,'left'],left:[0,-1,'right'],down:[1,0,'top'],up:[-1,0,'bottom'],
      'right-down':[0,1,'left'],'down-right':[1,0,'top'],
      'left-down':[0,-1,'right'],'down-left':[1,0,'top'],
      'right-up':[0,1,'left'],'up-right':[-1,0,'bottom'],
      'left-up':[0,-1,'right'],'up-left':[-1,0,'bottom']
    };
    const [dr,dc,edge]=steps[dir]||steps.right;
    return {r:or+dr,c:oc+dc,edge};
  }

  // How much of a shared clue square each clue gets (longer text = more room).
  function clueBoxWeight(cl){
    const length=Math.max(1,String(cl&&cl.clue||'?').trim().length);
    return Math.sqrt(length);
  }

  function getAnswerArrowMarkers(r,c,grid){
    const markers=[];
    for(let or=0;or<grid.length;or++){
      for(let oc=0;oc<(grid[or]||[]).length;oc++){
        const owner=grid[or][oc];
        if(owner.t!=='clue'||!Array.isArray(owner.clues)||!owner.clues.length)continue;
        const weights=owner.clues.map(clueBoxWeight);
        const total=weights.reduce((sum,value)=>sum+value,0)||owner.clues.length;
        let consumed=0;
        owner.clues.forEach((cl,index)=>{
          const weight=weights[index]||1;
          const target=firstAnswerTarget(cl.dir,or,oc);
          if(target.r===r&&target.c===c){
            // Up/down arrows sit on horizontal cell edges, so center them across
            // the destination cell. Only left/right arrows follow the clue's
            // vertical share within a split clue box.
            const position=(target.edge==='top'||target.edge==='bottom')
              ?50
              :((consumed+weight/2)/total)*100;
            markers.push({dir:cl.dir,edge:target.edge,position});
          }
          consumed+=weight;
        });
      }
    }
    return markers;
  }

  function appendAnswerArrowMarkers(td,r,c,grid,cellPx,color='#7744bb'){
    const markerSize=Math.max(8,Math.round(cellPx*0.25));
    getAnswerArrowMarkers(r,c,grid).forEach(marker=>{
      const el=document.createElement('span');
      el.className='answer-arrow-marker edge-'+marker.edge;
      el.style.setProperty('--arrow-size',markerSize+'px');
      el.style.setProperty('--slot-position',marker.position+'%');
      el.innerHTML=answerArrowSVG(marker.dir,markerSize,color);
      td.appendChild(el);
    });
  }

  // ── Grid model ──────────────────────────────────────────────────────────────
  // Turns saved puzzle data into the grid of squares that gets drawn.
  function freshCell(){return{t:'empty',clues:[],answerOf:null};}

  function gridFromData(data){
    const R=data.rows,C=data.cols,G=[];
    for(let r=0;r<R;r++){G.push([]);for(let c=0;c<C;c++)G[r].push(freshCell());}
    (data.cells||[]).forEach(cell=>{
      if(cell.t==='black'){G[cell.r][cell.c].t='black';}
      else if(cell.t==='clue'){
        G[cell.r][cell.c]={t:'clue',clues:[],answerOf:null};
        cell.clues.forEach(cl=>{
          const clObj={clue:cl.clue,ans:cl.ans,dir:cl.dir,textSize:cl.textSize||0};
          G[cell.r][cell.c].clues.push(clObj);
          getWordCells(cl.dir,cl.ans,cell.r,cell.c).forEach(([ar,ac],i)=>{
            if(ar>=0&&ar<R&&ac>=0&&ac<C){
              const ex=G[ar][ac];
              if(ex.t==='answer'&&ex.answerOf)ex.answerOf2={or:cell.r,oc:cell.c,cl:clObj,letter:cl.ans[i]};
              else G[ar][ac]={t:'answer',clues:[],answerOf:{or:cell.r,oc:cell.c,cl:clObj,letter:cl.ans[i]}};
            }
          });
        });
      }
    });
    return G;
  }

  // ── Drawing one square ──────────────────────────────────────────────────────
  // o.grid, o.r, o.c      which square
  // o.cellSizePx          square size
  // o.textSizePx          the puzzle's default clue text size
  // o.solve               true = answer squares are typing boxes (solving);
  //                       false = answer squares show their letter (designing)
  // The page adds its own click and typing behaviour to the square afterwards.
  function buildCell(o){
    const r=o.r,c=o.c,cellSizePx=o.cellSizePx,textSizePx=o.textSizePx,solve=!!o.solve;
    const td=document.createElement('td');
    td.dataset.r=r;td.dataset.c=c;
    td.style.width=cellSizePx+'px';
    td.style.height=cellSizePx+'px';
    td.style.minWidth=cellSizePx+'px';
    td.style.minHeight=cellSizePx+'px';
    td.style.maxWidth=cellSizePx+'px';
    td.style.maxHeight=cellSizePx+'px';
    const cell=o.grid[r][c];

    if(cell.t==='black'){
      td.className='t-black';

    } else if(cell.t==='clue'){
      td.className='t-clue';
      const inner=document.createElement('div');inner.className='clue-inner';
      cell.clues.forEach((cl,idx)=>{
        if(idx>0){const dv=document.createElement('div');dv.className='clue-divider';inner.appendChild(dv);}
        const slot=document.createElement('div');
        slot.className='clue-slot';
        const fs=cl.textSize&&cl.textSize>0?cl.textSize:textSizePx;
        // Give longer clue text a larger share of the cell. Keep this independent
        // of fs so auto-fitting its font cannot make its own box smaller.
        slot.style.flex=clueBoxWeight(cl)+' 1 0';
        const txtDiv=document.createElement('div');txtDiv.className='slot-text';
        txtDiv.style.fontSize=fs+'px';
        txtDiv.textContent=cl.clue||'?';
        slot.appendChild(txtDiv);
        if(solve)slot.dataset.clueIdx=idx;
        inner.appendChild(slot);
      });
      td.appendChild(inner);

    } else if(cell.t==='answer'){
      td.className='t-answer';
      if(solve){
        const inp=document.createElement('input');
        inp.className='solve-input';inp.type='text';inp.maxLength=1;
        inp.style.fontSize=Math.round(cellSizePx*0.38)+'px';
        inp.dataset.r=r;inp.dataset.c=c;
        td.appendChild(inp);
      } else {
        const sp=document.createElement('span');sp.className='ans-letter';
        sp.style.fontSize=Math.round(cellSizePx*0.38)+'px';
        sp.textContent=cell.answerOf?cell.answerOf.letter:'';
        td.appendChild(sp);
      }
      appendAnswerArrowMarkers(td,r,c,o.grid,cellSizePx,o.arrowColor||'#7744bb');
    } else {
      td.className='t-empty';
    }
    return td;
  }

  // ── Fitting clue text into its box ──────────────────────────────────────────
  // Shrinks a clue's text in half-pixel steps if its box reports an overflow
  // (never below 4px). Kept exactly as it was in the builder.
  function fitClueText(slot){
    const txt=slot.querySelector('.slot-text'); if(!txt)return;
    let fs=parseFloat(txt.style.fontSize); if(!fs)fs=10;
    const min=4; let safety=40;
    while(safety-->0 && fs>min && (slot.scrollWidth>slot.clientWidth+1 || slot.scrollHeight>slot.clientHeight+1)){
      fs-=0.5;
      txt.style.fontSize=fs+'px';
    }
  }
  function fitAllClueText(root){
    (root||document).querySelectorAll('.clue-slot').forEach(fitClueText);
  }

  window.ArrowGrid={
    version:'v29',
    arrowSVG,answerArrowSVG,
    getWordCells,firstAnswerTarget,clueBoxWeight,
    getAnswerArrowMarkers,appendAnswerArrowMarkers,
    freshCell,gridFromData,buildCell,
    fitClueText,fitAllClueText
  };
})();
