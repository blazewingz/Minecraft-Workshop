(function(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  const items=[...document.querySelectorAll('[data-tilt]')];
  items.forEach(el=>{
    let raf=0;
    const move=e=>{
      const r=el.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
      cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{el.style.transform=`perspective(1000px) rotateX(${(-py*5.2).toFixed(2)}deg) rotateY(${(px*6.2).toFixed(2)}deg) translateZ(7px)`});
    };
    const reset=()=>{cancelAnimationFrame(raf);el.style.transform='perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)'};
    el.addEventListener('pointermove',move);el.addEventListener('pointerleave',reset);el.addEventListener('pointercancel',reset);
  });
})();
