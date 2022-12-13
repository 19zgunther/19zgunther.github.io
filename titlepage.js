

var spawningTextDiv = document.getElementById("spawningTextDiv");
// const text = ["","Hi, I'm Zack Gunther", 
//         "I'm a Computer Science and Electrical Engineering dual major at RPI",
//         "Welcome to my website where I showcase some of the projects I've worked on!","\n\nplease press enter"];
const origText = "Hi, I'm Zack Gunther\n\nI'm a Computer Science and Electrical Engineering dual major at RPI\n\nWelcome to my website where I showcase some of the projects I've worked on!\n\n\nplease press enter";
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
    if (spawningTextDiv == null)
    {
        spawningTextDiv = document.getElementById("spawningTextDiv");
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





/*

// █

function writeText()
{
    if (textChunkOn < text.length)
    {
        spawningTextDiv.innerText = spawningTextDiv.innerText.replace("█","");
        const chunk = text[textChunkOn];
        if (textIndexOn >= chunk.length)
        {
            textChunkOn += 1;
            textIndexOn = 0;
            spawningTextDiv.innerText += "\n\n"
        } else {
            if (textIndexOn != 0 && chunk[textIndexOn-1] == " ")
            {
                spawningTextDiv.innerText += " " + chunk[textIndexOn];
            } else {
                spawningTextDiv.innerText += chunk[textIndexOn];
            }
            textIndexOn += 1;
        }
        spawningTextDiv.innerText += "█";
        if (textChunkOn >= text.length)
        {
            writeLastText();
        }
    } else {
        //clearInterval(writeTextInterval);
        
        // if (markIsIn && Date.now() - prevUpdateTime > markDelayMs)
        // {
        //     spawningTextDiv.innerText = spawningTextDiv.innerText.replace("█","");
        //     prevUpdateTime = Date.now();
        //     markIsIn = false;
        // } else if (!markIsIn && Date.now() - prevUpdateTime > markDelayMs)
        // {
        //     spawningTextDiv.innerText += "█";
        //     prevUpdateTime = Date.now();
        //     markIsIn = true;
        // }
    }
}

function writeLastText()
{
    spawningTextDiv.innerText += "\nzgunther@my-laptop:~$ ";
    spawningTextDiv.innerText = spawningTextDiv.innerText.replace("█","");
}



//Terminal function
//window.addEventListener("keydown", bash);
function bash(e) {



    if (e == null)
    {
        if (text.length > 0)
        {
            if (text.slice(0,"zgunther@my-laptop:~$".length) == "zgunther@my-laptop:~$")
            {
                text = text.slice("zgunther@my-laptop:~$".length)
                if (text == undefined)
                {
                    text = "";
                }
                console.log(text)
                spawningTextDiv.innerText += "zgunther@my-laptop:~$";
                return;
            }
            if (needToAddSpace)
            {
                spawningTextDiv.innerText += " " + text[0];
                needToAddSpace = false;
            } else {
                spawningTextDiv.innerText += text[0]
            }
            if (text[0] == " ")
            {
                needToAddSpace = true;
            }
            text = text.slice(1)
        }
        return;
    }
    
    //spawningTextDiv.innerText = spawningTextDiv.innerText.replace('█','')
    if(e.code == "Space" && e.target == document.body) {
        e.preventDefault();
    }

    

    switch (e.key.toLowerCase())
    {
        case "enter":
            //If we haven't finished writing, just cancel it and call func
            // if (textChunkOn < text.length)
            // {
            //     textChunkOn = 100;
            //     writeLastText();
            // }
            if (text.length > 0)
            {
                text = "zgunther@my-laptop:~$";
                return;
            }
            //spawningTextDiv.innerText = spawningTextDiv.innerText.replace('█','')
            t = spawningTextDiv.innerText + " ";
            t = t.replace("\n").replace("\r").split("zgunther@my-laptop:~$")
            const lastLine = t[t.length-1];
            spawningTextDiv.innerText += "\n";
            const args = lastLine.split(" ")

            //Evaluate
            switch (args[0])
            {
                case "help":
                    text += `
                     - smile <size> -- - prints a smiley face to the terminal, sizes=small,medium,large
                     - hello - - - - - - how are you?
                     - ls -- - - - - - - prints contents of my dev folder
                     - clear - - - - - - clears terminal\n\n`;
                    break;
                case "smile":
                    text += smile(args);
                    break;
                case "hello":
                    text += hello(args);
                    break;
                case "ls":
                    text += ls(args);
                    break;
                case "clear":
                    text = "";//"zgunther@my-laptop:~$";
                    break;
                case "":
                    break;
                default:
                    text += args[0] + ": command not found. Enter 'help' to see list of commands\n";
            }
            commandHistory.push(args);

            text += "zgunther@my-laptop:~$";
            break;
        case "delete":
        case "backspace":
            t = spawningTextDiv.innerText;
            if (t[t.length-1] == "█")
            {
                if (t[t.length-2] == "$")
                {
                    break;
                }
                spawningTextDiv.innerText = spawningTextDiv.innerText.slice(0, -2);
            } else {
                if (t[t.length-1] == "$")
                {
                    break;
                }
                spawningTextDiv.innerText = spawningTextDiv.innerText.slice(0, -1);
            }
            break;
        case "space":
        case " ":
            needToAddSpace = true;
            break;
        case "arrowup":
            if (commandHistory.length > 0)
            {
                spawningTextDiv.innerText += commandHistory[commandHistory.length-1];
            }
            break;
        case "arrowdown":
        case "arrowleft":
        case "arrowright":
        case "tab":
        case "alt":
        case "escape":
        case "control":
        case "shift":
            break
        default:
            console.log(needToAddSpace);
            if (needToAddSpace && e.key.toLowerCase() != "space")
            {
                spawningTextDiv.innerText += " " + e.key;// + "█";
                needToAddSpace = false;
            } else {
                spawningTextDiv.innerText += e.key;// + "█";   
            }
            break;
    }
    lastKeyStrokeTime = Date.now();
}
*/