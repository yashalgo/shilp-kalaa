/* Shilp Kalaa · the narrative pages: the split view (Home), the step navigation, the reel and
   "One sheet, closer and closer" (Process). Progressive enhancement: every page reads fully without it. */
(function(){
  var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
  var mq=matchMedia('(prefers-reduced-motion: reduce)'),reduced=mq.matches;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}

  /* the sticky header's height, so the Process step bar can sit under it when it is showing */
  var head=$('.head');
  function headH(){if(head)document.documentElement.style.setProperty('--head-h',head.offsetHeight+'px')}
  headH();addEventListener('resize',headH);

  /* ---------------------------------------------------------------- split view */
  function Split(fig){
    var stage=$('.split-stage',fig),line=$('.split-line',stage),x=+fig.dataset.split||50,drag=null,touched=false,hintRaf=0;
    var h=document.createElement('span');
    h.className='split-handle';h.tabIndex=0;h.setAttribute('role','slider');
    h.setAttribute('aria-label','Move between the photograph and the drawing');
    h.setAttribute('aria-valuemin','0');h.setAttribute('aria-valuemax','100');
    if($('#split-hint'))h.setAttribute('aria-describedby','split-hint');
    line.removeAttribute('aria-hidden');line.appendChild(h);
    function set(v){x=clamp(v,0,100);stage.style.setProperty('--x',x+'%');h.setAttribute('aria-valuenow',String(Math.round(x)));h.setAttribute('aria-valuetext',Math.round(100-x)+'% drawing')}
    function at(e){var r=stage.getBoundingClientRect();return (e.clientX-r.left)/r.width*100}
    function stopHint(){touched=true;if(hintRaf){cancelAnimationFrame(hintRaf);hintRaf=0}}
    stage.addEventListener('pointerdown',function(e){
      if(e.button>0)return;stopHint();
      var onHandle=e.target===h;
      drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,live:e.pointerType==='mouse'||onHandle};
      if(drag.live){e.preventDefault();stage.setPointerCapture(e.pointerId);fig.classList.add('is-dragging');set(at(e))}
    });
    stage.addEventListener('pointermove',function(e){
      if(!drag||e.pointerId!==drag.id)return;
      if(!drag.live){var dx=Math.abs(e.clientX-drag.x0),dy=Math.abs(e.clientY-drag.y0);if(dx>8&&dx>dy){drag.live=true;try{stage.setPointerCapture(e.pointerId)}catch(_){}fig.classList.add('is-dragging')}else return}
      set(at(e));
    });
    function end(e){
      if(!drag||e.pointerId!==drag.id)return;
      /* a tap on a phone moves the line to where the finger landed */
      if(!drag.live&&e.type==='pointerup'&&Math.abs(e.clientX-drag.x0)<8&&Math.abs(e.clientY-drag.y0)<8)set(at(e));
      drag=null;fig.classList.remove('is-dragging');
    }
    stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
    h.addEventListener('keydown',function(e){
      var k=e.key,step=e.shiftKey?10:2,v=x;
      if(k==='ArrowRight'||k==='ArrowUp')v+=step;else if(k==='ArrowLeft'||k==='ArrowDown')v-=step;
      else if(k==='PageUp')v+=10;else if(k==='PageDown')v-=10;else if(k==='Home')v=0;else if(k==='End')v=100;else return;
      e.preventDefault();stopHint();set(v);
    });
    set(x);fig.classList.add('is-live');
    /* one gentle sweep the first time it comes into view, so the line reads as something that moves */
    if(!reduced&&'IntersectionObserver'in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(en){
        if(!en.isIntersecting||touched)return;io.disconnect();
        var keys=[[0,50],[.32,38],[.68,60],[1,50]],D=2600,t0=0;
        setTimeout(function(){if(touched)return;hintRaf=requestAnimationFrame(function f(t){
          if(!t0)t0=t;var p=Math.min(1,(t-t0)/D),i=1;while(keys[i][0]<p)i++;
          var a=keys[i-1],b=keys[i],q=ease((p-a[0])/(b[0]-a[0]));set(a[1]+(b[1]-a[1])*q);
          hintRaf=p<1&&!touched?requestAnimationFrame(f):0;
        })},500);
      })},{threshold:.6});
      io.observe(stage);
    }
  }
  $$('[data-split]').forEach(function(f){new Split(f)});

  /* ---------------------------------------------------------------- process: step bar */
  var nav=$('.p-nav');
  if(nav){
    var links=$$('a',nav),secs=links.map(function(a){return document.getElementById(a.hash.slice(1))}),cur=-1,tick=false;
    function mark(){tick=false;var line=innerHeight*.35,n=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<line)n=i});
      if(n===cur)return;cur=n;links.forEach(function(a,i){if(i===n)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
      var ol=$('ol',nav),a=links[n];if(a&&ol.scrollWidth>ol.clientWidth)ol.scrollTo({left:a.offsetLeft-24,behavior:reduced?'auto':'smooth'});
    }
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(mark)}},{passive:true});mark();
  }

  /* ---------------------------------------------------------------- process: the reel */
  var v=$('.reel-video'),btn=$('.reel-toggle');
  if(v){
    var userPaused=reduced,inView=false;
    function label(){if(btn)btn.textContent=v.paused?'Play':'Pause'}
    if(btn){btn.hidden=false;label();btn.addEventListener('click',function(){if(v.paused){userPaused=false;var p=v.play();if(p&&p.catch)p.catch(function(){})}else{userPaused=true;v.pause()}})}
    v.addEventListener('play',label);v.addEventListener('pause',label);
    if('IntersectionObserver'in window){
      new IntersectionObserver(function(es){es.forEach(function(en){inView=en.isIntersecting;
        if(inView&&!userPaused){var p=v.play();if(p&&p.catch)p.catch(function(){})}else if(!inView&&!v.paused)v.pause();
      })},{threshold:.35}).observe(v);
    }
    mq.addEventListener&&mq.addEventListener('change',function(e){if(e.matches){userPaused=true;v.pause()}});
  }

  /* ---------------------------------------------------------------- process: one sheet, closer and closer
     The five images are her own crops of one sheet. Each is registered to the whole sheet (box = x,y,width
     in the whole sheet's 1440-px space), so a "camera" can move over the sheet and each crop lands exactly
     where it belongs. Nothing here is a stage of work: it is the same finished sheet, seen closer. */
  $$('.closer').forEach(function(sec){
    var list=$('.closer-list',sec),steps=$$('.closer-step',list);if(steps.length<2)return;
    var boxes=steps.map(function(li){return li.dataset.box.split(',').map(Number)}),W=1440;
    var wrap=document.createElement('div'),stage=document.createElement('div'),bar=document.createElement('div');
    wrap.className='closer-stage-wrap';stage.className='closer-stage';bar.className='closer-stage-bar';
    var layers=steps.map(function(li,i){var im=$('img',li);stage.appendChild(im);return im});
    /* under the sheet on tablets and phones: the current caption, shown inside the sticky box (a copy of the list's text, so hidden from assistive tech) */
    var cap=document.createElement('p');cap.className='closer-cap';cap.setAttribute('aria-hidden','true');
    var btns=steps.map(function(li,i){var b=document.createElement('button');b.type='button';b.textContent=String(i+1);
      b.setAttribute('aria-label','Go to view '+(i+1)+' of '+steps.length);
      b.addEventListener('click',function(){var p=side()?$('p',li):li,r=p.getBoundingClientRect();scrollTo({top:scrollY+r.top-target()+Math.min(80,r.height*.3+4),behavior:reduced?'auto':'smooth'})});
      bar.appendChild(b);return b});
    wrap.appendChild(stage);wrap.appendChild(cap);wrap.appendChild(bar);list.parentNode.insertBefore(wrap,list);sec.classList.add('is-live');
    var cam=boxes[0].slice(),op=layers.map(function(_,i){return i?0:1}),on=-1,raf=0;
    function render(){layers.forEach(function(im,i){var b=boxes[i],s=b[2]/cam[2];
      im.style.transform='translate('+((b[0]-cam[0])/cam[2]*100)+'%,'+((b[1]-cam[1])/cam[2]*100)+'%) scale('+s+')';
      im.style.opacity=i?op[i]:1})}
    function go(n){
      if(n===on)return;on=n;
      steps.forEach(function(li,i){li.classList.toggle('is-on',i===n)});cap.innerHTML=$('p',steps[n]).innerHTML;btns.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===n))});
      var from=cam.slice(),to=boxes[n],o0=op.slice(),D=reduced?0:1100,t0=0;
      var c0=[from[0]+from[2]/2,from[1]+from[2]/2],c1=[to[0]+to[2]/2,to[1]+to[2]/2],dist=Math.hypot(c1[0]-c0[0],c1[1]-c0[1]),lift=Math.min(.7,dist/Math.max(from[2],to[2]))*.55;
      if(raf)cancelAnimationFrame(raf);
      function frame(t){if(!t0)t0=t;var p=D?Math.min(1,(t-t0)/D):1,e=ease(p),f=clamp((p-.18)/.6,0,1);f=f*f*(3-2*f);
        var w=from[2]*Math.pow(to[2]/from[2],e)*(1+lift*Math.sin(Math.PI*e)),cx=c0[0]+(c1[0]-c0[0])*e,cy=c0[1]+(c1[1]-c0[1])*e;
        cam=[cx-w/2,cy-w/2,w];op=o0.map(function(a,i){return a+((i===n?1:0)-a)*f});render();
        raf=p<1?requestAnimationFrame(frame):0}
      if(D)raf=requestAnimationFrame(frame);else frame(0);
    }
    function side(){var a=wrap.getBoundingClientRect(),b=list.getBoundingClientRect();return a.right<=b.left+1}
    function target(){return side()?innerHeight*.55:innerHeight*.72}
    var tick=false;
    function pick(){tick=false;var line=target(),sd=side(),n=0;steps.forEach(function(li,i){if((sd?$('p',li):li).getBoundingClientRect().top<line)n=i});go(n)}
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(pick)}},{passive:true});
    addEventListener('resize',pick);render();pick();
  });
})();
