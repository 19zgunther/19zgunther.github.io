


const topBarElement = document.getElementById("INSERT_TOP_BAR");
if (topBarElement != null) {
    topBarElement.innerHTML = `
    <div class = 'menu'>
        <div class = 'menu_item' style='position: absolute; left:0; justify-self:left;'>
            Zack Gunther
        </div>
        <div class = 'menu_item'>
            Resume
        </div>
        <div class = 'menu_item'>
            Projects
            <div class = 'menu_dropdown'>
                <div class = 'menu_dropdown_child'>
                    Circuit Simulator
                </div>
                <div class = 'menu_dropdown_child'>
                    Charged Particle Simulator
                </div>
            </div>
        </div>
    </div>
    `;
    
    
    var o = `
    <div style = "position:fixed; top:0px; z-index: 500; width: 100%;">
        <div id="Header" class = "header">
            <div id="homeButton" class = "HeaderButton" onclick= "ChangePage('index.html')">Home</div>
            <div id="resumeButton" class = "HeaderButton" onclick= "ChangePage('resume.html')" >Resume</div>
            <div id="chargeSimulatorButton" class = "HeaderButton" onclick= "ChangePage('chargeSimulator/chargeSimulator.html')">Charge Simulator</div>
            <div id="circuitSimulatorButton" class = "HeaderButton" onclick= "ChangePage('circuitSimulator/circuitSimulator.html')">Circuit Simulator</div>
            <div id="cadButton" class = "HeaderButton" onclick= "ChangePage('CAD/cad.html')">CAD</div>
        </div>
    </div>
    `;
}





