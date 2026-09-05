// Simple animation to prove GSAP is working
//gsap.to("#box1", { x: 200, duration: 2 ,backgroundColor: "blue"});
//gsap.from("#box2", { y: 150, duration: 2, delay: 1, transform:"translate(100px,200px)" });
//gsap.to("#box3", { rotation: 360, duration: 3, delay: 2, borderRadius: "50%",scrub: 2 });
//const tl = gsap.timeline();
//tl.from("#box2", { y: 150, duration: 2, delay: 1, transform:"translate(100px,200px)" });

//tl.to("#box3", { rotation: 360, duration: 3, delay: 2, borderRadius: "50%",scrub: 2 });
const tl2 = gsap.timeline();
tl2.from('nav .logo',{
  y:200,opacity:0,duration:2
})
tl2.from('nav li',{
  y:100,opacity:0,duration:2,stagger:1
})
tl2.from('nav button',{
  x:100,opacity:0,duration:2
})
