


const menuProjectsElement = document.getElementById("INSERT_MENU_PROJECTS");
if (menuProjectsElement != null) {

    const text = `
    <div class = 'menu_dropdown_child' onclick='buttonClick("circuit_simulator")'>
        Circuit Simulator
    </div>
    <div class = 'menu_dropdown_child' onclick='buttonClick("charged_particle_simulator")'>
        Charged Particle Simulator
    </div>
    <div class = 'menu_dropdown_child' onclick='buttonClick("raytracing")'>
        Ray Tracing Project (in dev)
    </div>
    <div class = 'menu_dropdown_child' onclick='buttonClick("cad")'>
        CAD (in dev)
    </div>
    `;

    menuProjectsElement.innerHTML = text;

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





