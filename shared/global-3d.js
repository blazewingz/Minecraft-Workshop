
(function(){
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 const items=[...document.querySelectorAll('.depth-ui')]; let mx=innerWidth*.5,my=innerHeight*.5,raf=0;
 const tick=()=>{raf=0; for(const el of items){const r=el.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const dx=Math.max(-1,Math.min(1,(mx-cx)/(innerWidth*.62)));const dy=Math.max(-1,Math.min(1,(my-cy)/(innerHeight*.62)));const rx=(-dy*5.5),ry=(dx*7.0);el.style.transform=`perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(5px)`;}}
 const move=e=>{mx=e.clientX;my=e.clientY;if(!raf)raf=requestAnimationFrame(tick)};
 addEventListener('pointermove',move,{passive:true});addEventListener('resize',()=>{mx=Math.min(mx,innerWidth);my=Math.min(my,innerHeight);if(!raf)raf=requestAnimationFrame(tick)});
 tick();
})();
