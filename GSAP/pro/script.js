gsap.registerPlugin(ScrollTrigger);
//custom cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;


document.addEventListener('mousemove',(e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    //console.log('Mousemoved)
});
function animateCursor() {
    cursorX += (mouseX-cursorX) * 0.2;
    cursorY += (mouseY-cursorY) * 0.2;
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;

    cursor.style.left = cursorX - 10 + 'px';
    cursor.style.top = cursorY - 10 + 'px';
    cursorFollower.style.left = followerX - 20 + 'px';
     cursorFollower.style.top = followerY - 20 + 'px';


    requestAnimationFrame(animateCursor);
}
animateCursor(); 

//cursor hover effects
const interactiveElements = document.querySelectorAll('a,button, .work-item, .service-card, .testimonial-dot');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.add('hover'));
});
//scroll Progress bar
gsap.to('.progress-bar',{
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
        trigger:'body',
        start:'top top',
        end:'bottom bottom',
        scrub: 0.3
    }
})

//hero animations
const heroT1 = gsap.timeline({defaults: {ease: 'power4.out'}});

//split text animation for hero title

const heroTitle = document.querySelector('.hero-title');
const lines = heroTitle.querySelectorAll('.line');

lines.forEach((line,index) => {
    const text = line.textContent;
    line.innerHTML = '';
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char == ' ' ? '\u00A0' : char;
        line.appendChild(span);

    });
});
heroT1.to('.hero-subtitle',{opacity: 1, y: 0, duration: 1,delay: 0.5})
.to('.hero-title .char', {
    opacity:1,
    y: '0%',
    duration:1.2,
    stagger: 0.03,
    ease:'back.out'
},'-=0.5')
.to('.hero-description',{opacity:1,y:0,duration:1},'-=0.8')
.to('.hero-cta',{opacity:1,y:0,duration:0.8}, '-=0.6')


gsap.to('.hero-content',{
    y:200,
    opacity:0,
    ease:'none',
    scrollTrigger:{
        trigger:'.hero',
        start:'top top',
        end:'bottom top',
        scrub:true
    }
});

gsap.from('.about-title',{
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
        trigger:'.about',
        start:'top 80%',
        toggleActions:'play none none reverse'
    }
});

gsap.from('.about-text',{
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
        trigger:'.about',
        start:'top 80%',
        toggleActions:'play none none reverse'
    }
});

const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(stat => {
    const value = parseInt(stat.getAttribute('data-value'));
    gsap.to(stat,{
        innerHTML:value,
        duration:2,
        snap:{innerHTML:1},
        scrollTrigger: {
            trigger:stat,
            start:'top 85%',
            toggleActions: 'play none none reverse'
        }
    })
})



gsap.from('.stat-item',{
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger:0.1,
    scrollTrigger: {
        trigger:'.ststs-grid',
        start:'top 85%',
        toggleActions:'play none none reverse'
    }
});


gsap.from('.about-visual',{
    opacity: 0,
    x: 100,
    duration: 1.2,
    scrollTrigger: {
        trigger:'.about-visual',
        start:'top 80%',
        toggleActions:'play none none reverse'
    }
});

const servicesSection = document.querySelector('.services');
const servicesTrack = document.querySelector('.services-track');
const serviceCards = document.querySelectorAll('.service-card');


const getScrollAmount = () => {
    return -(servicesTrack.scrollWidth - window.innerWidth + 100);

};

gsap.to(servicesTrack, {
    x: getScrollAmount,
    ease: 'none',
    scrollTrigger:{
        trigger: servicesSection,
        start: 'top top',
        end: () => `+=${servicesTrack.scrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1 

    }
});


serviceCards.forEach((card, i) => {
    gsap.from(card, {
        opacity: 0,
        y: 100,
        rotation: 5,
        duration: 1,
        scrollTrigger:{
          trigger: card,
          start: 'top 80%', 
          toggleActions: 'play none none reverse'
        },
        delay: i * 0.1
    });
});



gsap.from('.work-header',{
    opacity: 0,
    y: 50,
    duration: 1,
    stagger:0.1,
    scrollTrigger: {
        trigger:'.work',
        start:'top 85%',
        toggleActions:'play none none reverse'
    }
});


const workItems = document.querySelectorAll('.work-item');
workItems.forEach((item,i) => {
    gsap.from(item,{
        opacity:0,
        y:100,
        scale:0.9,
        duration:1,
        delay: i*0.1,
        scrollTrigger:{
            trigger:item,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
});



 work-workItems.forEach(item => {
    const img = item.querySelector('.work-image');
    gsap.to(img,{
        ease:'none',
        y: '-20%',
        scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
 });

 const testimonialItems = document.querySelectorAll('.testinomial-item');
 const testimonialDots = document.querySelectorAll('.testimonial-dot');
 let currentTestimonial = 0;

 function showTestimonial(index) {
 Items.forEach((item,i) => {
    item.classList.remove('active');
    testimonialDots[i].classList.remove('active')
 })
 testimonialItems[index].classList.add('active');
  testimonialDots[index].classList.add('active');
  currentTestimonial = index;
 }

 testimonialDots.forEach((dot,index) => {
    dot.addEventListener('click', () => showTestimonial(index));
 });

 setInterval(() => {
    const next = (currentTestimonial + 1) % testimonialItems.length;
    showTestimonial(next);
}, 4000);


gsap.from('.contact-info h2', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay:0.2,
    scrollTrigger: {
        trigger: '.contact',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    }
});


gsap.from('.contact-item', {
    opacity: 0,
    x: -30,
    duration: 0.8,
    stagger:0.1,
    scrollTrigger: {
        trigger: '.contact-details',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    }
});



gsap.from('.form-group', {
    opacity: 0,
    y:30,
    duration: 0.8,
    stagger:0.1,
    delay:0.4,
    scrollTrigger: {
        trigger: '.contact-from',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
    }
});

document.querySelector('.contact-from').addEventListener('submit',(e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const originalText = btn.textContent;

    btn.textContent = 'sending...';
    btn.disabled = true;


    setTimeout(() => {
        btn.textContent = 'Message Sent!';
        btn.style.background = '#00ff88';
       setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        e.target.reset();
    },2000)
},1500);
});


window.addEventListener('resize',() => {
    ScrollTrigger.refresh();
});