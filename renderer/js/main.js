document.querySelectorAll('.hover-el').forEach(el => {
    let interval;
    el.addEventListener("mouseenter", e =>{
        const sharedClasses = ['span', 'text-2xl', 'text-cyan-100','transition', 'duration-200', 'opacity-100'];
        const Lclasses = ['mr-2'];
        const Rclasses = ['ml-2'];
        const spanL = document.createElement("span");
        const spanR = document.createElement("span");
        spanL.classList.add(...sharedClasses, ...Lclasses);
        spanR.classList.add(...sharedClasses, ...Rclasses);
        spanL.textContent = ">";
        spanR.textContent = "<";
        interval = setInterval(() => {
            spanL.classList.toggle('opacity-0');
            spanL.classList.toggle('opacity-100');
            spanR.classList.toggle('opacity-0');
            spanR.classList.toggle('opacity-100');
        }, 500);
        
        el.prepend(spanL);
        el.appendChild(spanR);
    })

    el.addEventListener("mouseleave", e=>{
        document.querySelectorAll(".span").forEach(el => { el.remove();} )
        clearInterval(interval);
    })
});

const enableYomitan = document.querySelector("#enable-miyotan");
const launchOnStartup = document.querySelector("#launch-on-startup");



