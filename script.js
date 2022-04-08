



{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Menu - Load Project List
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //var menuProjectsElement = document.getElementById("INSERT_MENU_PROJECTS");
    var menuElement = document.createElement('div');
    menuElement.setAttribute('class', 'menu');
    menuElement.innerHTML = `<div class='menu'>
    <div style='left:0; justify-self:left;'>
        <logo onclick='buttonClick("home")'>
            ZG
        </logo>
    </div>
    <div style="display:block; position: relative; flex-grow:1;">

    </div>
    <div class='menu_item' onclick='buttonClick("resume")'> 
        Resume
    </div>
    <div class='menu_item'>
        Projects
        <div class='menu_dropdown'>
            <div id="INSERT_MENU_PROJECTS">
                <div class = 'menu_dropdown_child' onclick='buttonClick("circuit_simulator")'>
                    Circuit Simulator
                </div>
                <div class = 'menu_dropdown_child' onclick='buttonClick("charged_particle_simulator")'>
                    Charged Particle Simulator
                </div>
                <div class = 'menu_dropdown_child' onclick='buttonClick("planet_generator")'>
                    Planet Generator
                </div>
                <div class = 'menu_dropdown_child' onclick='buttonClick("web_experiments")'>
                    Web Dev Experiments <br> (in dev)
                </div>
                <div class = 'menu_dropdown_child' onclick='buttonClick("raytracing")'>
                    Ray Tracing Project <br> (in dev)
                </div>
                <div class = 'menu_dropdown_child' onclick='buttonClick("webgl_raytracing")'>
                    Webgl Ray Tracing Project <br> (in dev)
                </div>
                <div class = 'menu_dropdown_child' onclick='buttonClick("cad")'>
                    CAD <br>(in dev)
                </div>
            </div>
        </div>
    </div>
    <!--Scroll Progress Bar-->
    <div id='scrollIndicatorBackground' class='scrollIndicatorBackground'>
        <div id='scrollIndicator' class='scrollIndicator'>

        </div>
    </div>
    </div>`;
    document.body.insertBefore(menuElement, document.body.firstChild);




    //This is for css - allowing for us to make timed transitions easily on document load
    window.onload = function() {
        document.body.className += " loaded";
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Function for switching pages (button presses on menu)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function buttonClick(buttonName) {
        var pageString = '';
        switch(buttonName)
        {
            case 'home': pageString = 'index.html'; break;
            case 'resume': pageString = 'resume.html'; break;
            case 'charged_particle_simulator': pageString = 'chargeSimulator/chargeSimulator.html'; break;
            case 'circuit_simulator': pageString = 'circuitSimulator/circuitSimulator.html'; break;
            case 'cad': pageString = 'CAD/cad.html'; break;
            case 'raytracing': pageString = 'raytracing/raytracing.html'; break;
            case 'planet_generator': pageString = 'planetGenerator/planetGenerator.html'; break;
            case 'web_experiments': pageString = 'webExperiments/webExperiments.html'; break;
            case 'webgl_raytracing': pageString = 'webglRaytracing/webglRaytracing.html'; break;
        }
        if (String(document.location).includes('index.html') || String(document.location).includes('resume.html'))
        {
        } else {
            pageString = "../"+pageString;
        }
        document.location = pageString;    
    }







    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Title Screen - Title Rotation
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    var welcomeSectionElement = document.getElementById('welcome_section');
    if (welcomeSectionElement != null)
    {   
        var ws_mx = 0; //welcome section mouse x
        var ws_my = 0;
        var ws_mm = 0; //welcome section mouse moved
        document.onmousemove = function(e) {
            ws_mx = e.clientX;
            ws_my = e.clientY;
            ws_mm = true;
        }
        setInterval(function() {
            if (ws_mm == true)
            {
                ws_mm = false;
                let bb = welcomeSectionElement.getBoundingClientRect();
                let y = Math.min(Math.max(-(ws_my - bb.top-bb.height/2)/50,-10),10);
                let x = Math.min(Math.max( (ws_mx - bb.left-bb.width/2)/50, -10), 10);
                welcomeSectionElement.style.transform = 'rotateX(' + y + "deg) rotateY("+x+"deg)";
            }
        }, 500)
    }





    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MENU - Scroll Indicator
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    var scrollIndicatorElement = document.getElementById("scrollIndicator");
    if (scrollIndicatorElement != null)
    {   
        var pPageYOffset_ = 0;
        setInterval(function() {
            if (pPageYOffset_ != window.pageYOffset)
            {
                pPageYOffset_ = window.pageYOffset;
                let maxHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
                scrollIndicatorElement.style.width = Math.round(window.pageYOffset/(maxHeight-window.innerHeight)*100) + "%";
            }
        }, 200);
    } else {
        console.log("Failed to initialize scrollIndicator interval");
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Title Screen - Project Opacity
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const contentColumnElements = document.getElementsByClassName("project_container");
    if (contentColumnElements != null && contentColumnElements.length > 0)
    {   
        var pPageYOffset_cc = 0;
        setInterval(function() {
            if (pPageYOffset_cc != window.pageYOffset)
            {
                pPageYOffset_cc = window.pageYOffset;
        
                for(var i=0; i<contentColumnElements.length;i++)
                {
                    var bb = contentColumnElements[i].getBoundingClientRect();
                    let v = Math.min(2*(Math.abs(bb.top - bb.height/2) - window.innerHeight/2)/window.innerHeight,1);
                    //if (i ==0 ) { console.log(v)}
                    if (v < 0)
                    {
                        contentColumnElements[i].style.opacity = '1';
                        //contentColumnElements[i].style.transform = 'rotateY('+(90-v*90)+'deg)';
                    } else {
                        contentColumnElements[i].style.opacity = '0.2';
                        //contentColumnElements[i].style.transform = 'rotateY(90deg)';
                    }
                }
                
            }
        }, 300)
    }



}