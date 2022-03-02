


var scrollIndicatorElement = document.getElementById("scrollIndicator");
var cps_contentColumnElement = document.getElementById("cps_content_column");
var cs_contentColumnElement = document.getElementById("cs_content_column");


var contentColumnElements = [cps_contentColumnElement, cs_contentColumnElement];




window.onresize = function(event){

}




window.onscroll = function() {

    

    //console.log( currentOffset/(maxHeight-windowHeight) );
    

    try {
        var maxHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
        var windowHeight = window.innerHeight;
        var currentOffset = window.pageYOffset;

        scrollIndicatorElement.style.width = Math.round(currentOffset/(maxHeight-windowHeight)*100) + "%";

        if (currentOffset > 10)
        {
            if ( cps_contentColumnElement.style.opacity != '1')
            {
                console.log("op = 1");
                cps_contentColumnElement.style.opacity = '1';
            }
        }


        for(var i=0; i<contentColumnElements.length;i++)
        {
            if (Math.abs(contentColumnElements[i].getBoundingClientRect().top - (currentOffset-windowHeight/2)) < windowHeight/2 )
            {
                contentColumnElements[i].style.opacity = 1;
            } else {
                contentColumnElements[i].style.opacity = 0.2;
            }
        }
    } catch (e) {

    }

};






window.onload = function() {
    document.body.className += " loaded";
}


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
    }

    if (String(document.location).includes('index.html') || String(document.location).includes('resume.html'))
    {

    } else {
        pageString = "../"+pageString;
    }

    document.location = pageString;

    
}