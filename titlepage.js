

var spawningTextDiv = null;
// const text = ["","Hi, I'm Zack Gunther", 
//         "I'm a Computer Science and Electrical Engineering dual major at RPI",
//         "Welcome to my website where I showcase some of the projects I've worked on!","\n\nplease press enter"];
const origText = "Hi, I'm Zack Gunther\n\nI'm a Software Engineer working at Tesla.\n\nWelcome to my website where I showcase some of the projects I've worked on!\n\n\nplease press enter";
let text = origText;

let writeTextInterval = setInterval(bash, 30);
let setToFasterSpeed = false;
let fasterIntervalTime = 5;

let lastKeyStrokeTime = 0;
let needToAddSpace = false;
let needToAddSpaceCommand = false;
let deleteFromText = 0;
let commandHistory = [];
let command = "";
const commandPrompt = "zgunther@my-laptop:~$";

window.addEventListener("keydown", bash);

function bash(e = null)
{

    if (spawningTextDiv == null || spawningTextDiv.offsetParent == null)
    {
        let spawningTextDivs = document.getElementsByClassName("spawningTextDiv");
        console.log(spawningTextDivs.length);
        for (let i in spawningTextDivs)
        {
            console.log(spawningTextDivs[i].offsetParent);
            if (spawningTextDivs[i].offsetParent != null)
            {
                spawningTextDiv = spawningTextDivs[i];
                break;
            }
        }
        spawningTextDiv.innerText = "";
        text = origText;
    }
    
    const D = spawningTextDiv
    //If someone typed, add to command
    if (e != null)
    {
        if (!setToFasterSpeed)
        {
            clearInterval(writeTextInterval);
            writeTextInterval = setInterval(bash, fasterIntervalTime);
        }
        if(e.code == "Space" && e.target == document.body) {
            e.preventDefault();
        }
        if (e.key.length == 1 || e.code.toLowerCase() == "space")
        {
            command += e.key;
            if (e.code.toLowerCase() == "space")
            {
                needToAddSpaceCommand = true;
            } else {
                if (needToAddSpaceCommand)
                {
                    text += " " + e.key;
                    needToAddSpaceCommand = false;
                } else {
                    text += e.key;
                }
            }
        }
        if (e.key.toLowerCase() == "backspace")
        {
            if (command.length > 0)
            {
                command = command.slice(0, command.length - 1);
                deleteFromText += 1;
            }
        }
        if (e.key.toLowerCase() == "enter")
        {
            text += "\n";
            const args = command.split(" ");
            switch(args[0])
            {
                case "": text = ""; break;
                case "ls": text += ls(args); break;
                case "clear": D.innerText = origText; break;
                case "smile": text += smile(args); break;
                case "mkdir": text += mkdir(args); break;
                case "info": text += info(args); break;
                case "help": 
                    text += `
                     - smile <size> -- - prints a smiley face to the terminal, sizes=small,medium,large
                     - ls -- - - - - - - prints contents of my dev folder
                     - clear - - - - - - clears terminal
                     - mkdir - - - - - - creates a new folder
                     - info -- - - - - - lists info about this coding exercise\n`;
                    break;
                default: text += "unknown command: '" + command + "'. Type 'help' to see available commands."; break;
            }
            text += "\n" + commandPrompt;
            command = "";
        }
    } else {
        //Timer fired to write next character
        if (text.length > 0)
        {
            //Check to see if we need to print the starting line. If so, print it immediately without delay
            if (text.slice(0,commandPrompt.length) == commandPrompt)
            {
                D.innerText += commandPrompt;
                text = text.slice(commandPrompt.length);                
            } else if (text[0] == " ")
            {
                needToAddSpace = true;
                text = text.slice(1);
            } else {
                if (needToAddSpace)
                {
                    D.innerText += " " + text[0];
                    text = text.slice(1);
                    needToAddSpace = false;
                } else {
                    D.innerText += text[0];
                    text = text.slice(1);
                }
            }
        }
        if (deleteFromText > 0 && D.innerText.length > 0)
        {
            const s = D.innerText;
            D.innerText = s.slice(0,s.length - deleteFromText);
            deleteFromText = 0;
        }
    }
}

function smile(args)
{
    if (args.length > 1)
    {
        switch (args[1])
        {
            case "small":
                return ":)";
            case "medium":
                return "¯\_(ツ)_/¯";
            case "large":
                return `
                    /#######\\
                    |_______|
                    |_ 0 0 _|
                    | \\___/ |
                    \\_______/
                    `;
            default:
                return "error - unknown argument '"+args[1]+"'. Type 'help' for use.";

        }
    }
    return ":)";
}
function ls(args)
{
    return "\n code.py\n moreCode.cpp\n evenMoreCode.js\n ahhhTooMuchCode.hs\n oooooLookASchematic.png\n";
}
function mkdir(args)
{
    let o = "So you are trying to make a folder? I'm sorry but I don't have time to implement a file system, nor the money to buy a server...";
    if (args.length < 2)
    {
        o += " Also, you didn't include a name for the directory or any arguments. I don't know what you want from me...";
    }
    return o;
}
function info(args)
{
    return "\nHello! I started writing this script at ~3 am during finals, senior fall, 2022. It is now 5:14 am, and I need to get back to studying. Hope you enjoyed this!\n";
}
