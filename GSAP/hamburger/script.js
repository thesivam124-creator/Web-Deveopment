var menu = document.querySelector('.ri-menu-line');
var cross = document.querySelector('#full i');
var tl = gsap.timeline();
tl.to('#full',{
    right: 0,
    duration:1
})
tl.from('#full h4',{
    x:100,
    opacity: 0,
    stagger: 0.2
})
tl.from('#full i',{
    opacity: 0
})
tl.pause();

menu.addEventListener('click' , function(){
    tl.play();
})
cross.addEventListener('click',function(){
    tl.reverse();
})