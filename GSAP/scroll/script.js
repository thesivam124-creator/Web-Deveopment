// Register the plugin with a capital 'S'
gsap.registerPlugin(ScrollTrigger); 

// First box animation (remains the same)
gsap.to('.box1', {
  rotation: 360, 
  duration: 2, 
  backgroundColor: "red"
});

// Second box animation (remains the same)
gsap.to(".box2", { 
  rotation: 360, 
  duration: 2, 
  backgroundColor: "white", 
  scrollTrigger: { 
    trigger: ".section2", 
    start: "20% top", // Added viewport relative position for clarity
    end: "50% top",   
    markers: true ,
    scrub: true //reverse the rotation
  } 
});
gsap.to(".box3", { 
  rotation: 360, 
  duration: 2, 
  backgroundColor: "blue", 
  scrollTrigger: { 
    trigger: ".section2", 
    start: "40%", // Added viewport relative position for clarity
    end: "50% top",   
    markers: true ,
    scrub: 2//reverse the rotation
  } 
});
