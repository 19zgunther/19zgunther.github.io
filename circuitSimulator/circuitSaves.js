
var dropdownElement = document.getElementById("exampleCircuitDropDown");


function InitExampleCircuits() {
    dropdownElement.innerHTML += "<option>voltage divider example</option>";
    dropdownElement.innerHTML += "<option>ideal diode example</option>";
    dropdownElement.innerHTML += "<option>ideal zener diode example</option>";
    dropdownElement.innerHTML += "<option>comparator example</option>";
    dropdownElement.innerHTML += "<option>inverting amplifier example</option>";
    dropdownElement.innerHTML += "<option>non-inverting amplifier example</option>";

    





}

function ChangeExampleCircuit() {
    console.log( dropdownElement.value );
    switch (dropdownElement.value)
    {
        case "voltage divider example": LoadCircuit("voltageSource2n 348997 380 300 380 100 5V 0Hz wire 288454 380 100 500 100 resistor 172935 500 100 500 200 1000Ω resistor 778194 500 200 500 300 1000Ω wire 711113 500 300 380 300 wire 574008 500 200 620 200 voltageSource1n 782431 380 300 380 340 0V 0Hz plot 348997 plot 574008");break;
        case "ideal diode example": LoadCircuit("voltageSource2n 574829 600 320 600 180 15V 5kHz resistor 168808 600 180 740 180 1000Ω diode 296754 740 180 740 320 700mV 1000MV wire 924756 740 320 600 320 voltageSource1n 246326 600 320 600 380 0V 0Hz plot 574829 plot 296754"); break;
        case "ideal zener diode example": LoadCircuit("voltageSource2n 574829 600 320 600 180 15V 5kHz resistor 168808 600 180 740 180 1000Ω diode 296754 740 180 740 320 700mV 10V wire 924756 740 320 600 320 voltageSource1n 246326 600 320 600 380 0V 0Hz plot 574829 plot 296754"); break;
        case "comparator example": LoadCircuit("voltageSource2n 657517 740 320 740 180 1V 0Hz opamp 351757 740 160 940 160 10V -10V 10uV voltageSource1n 351587 740 320 740 340 0V 0Hz wire 554776 740 140 640 140 voltageSource2n 529492 640 320 640 140 10V 5kHz resistor 44329 940 160 940 320 1000Ω wire 795120 640 320 740 320 wire 354621 740 320 940 320 plot 529492 plot 657517 plot 44329"); break;
        case "inverting amplifier example": LoadCircuit("voltageSource2n 297135 260 320 260 200 5V 5kHz voltageSource1n 136043 260 320 260 360 0V 0Hz opamp 331905 380 220 560 220 10V -10V 10uV voltageSource1n 120448 380 240 380 360 0V 0Hz resistor 122448 380 200 260 200 1000Ω wire 260761 380 200 380 140 resistor 959868 380 140 560 140 2kΩ wire 410021 560 140 560 220 wire 31843 560 220 660 220 resistor 510847 660 220 660 340 220Ω voltageSource1n 146325 660 340 660 360 0V 0Hz plot 297135 plot 510847");break;
        case "non-inverting amplifier example": LoadCircuit("voltageSource2n 297135 460 380 460 260 5V 5kHz voltageSource1n 136043 460 380 460 420 0V 0Hz opamp 331905 460 240 640 240 10V -10V 10uV resistor 510847 740 240 740 400 220Ω voltageSource1n 146325 740 400 740 420 0V 0Hz wire 222113 640 180 640 240 resistor 357600 640 180 460 180 1000Ω resistor 44305 460 80 460 180 1000Ω wire 913483 460 180 460 220 wire 506890 640 240 740 240 voltageSource1n 818478 460 80 460 60 0V 0Hz plot 297135 plot 510847");break;
    }



}