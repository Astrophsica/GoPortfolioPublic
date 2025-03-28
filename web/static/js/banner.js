import { LoadMediaRefGradually, GetLowestQualityMediaSrc } from "./mediamanagerv2.js"

// Banner
const canvas = document.getElementById("banner");
const ctx = canvas.getContext("2d");

var focused = false;
var AnimatedImages = []
var PrevoiusTimeStamp;
var TimeStampOfLastSpawn;
const ImageWidth = 355;
const ImageHeight = 200;
var ScrollingCanvasX = 0;
var RunningImages = [];

var Projects = null;

async function loadProjects() {
    const response = await fetch("static/json/projects.json");
    Projects = await response.json();
}
await loadProjects();


async function UpdateImageOnSrcChange(imgElement, canvasCtx)
{
    var observer = new MutationObserver((changes) => {
        changes.forEach(change => {
            if(change.attributeName.includes('src')){
                canvasCtx.drawImage(imgElement, 0, 0, ImageWidth, ImageHeight);
            }
        });
      });
    observer.observe(imgElement, {attributes : true});
}

function HandleImgUpdate(event)
{
    var imgElement = event.target
    imgElement.src = event.detail
}

async function RedrawImgOnImgLoad(imgElement, canvasCtx)
{
    await imgElement.decode()
    canvasCtx.drawImage(imgElement, 0, 0, ImageWidth, ImageHeight);
}

function CreateOffscreenCanvas(imgElement)
{
    let newCanvas = new OffscreenCanvas(ImageWidth, ImageHeight)
    const newCanvasCtx = newCanvas.getContext("2d");
    if (imgElement.complete == false)
    {
        RedrawImgOnImgLoad(imgElement, newCanvasCtx)
    }
    newCanvasCtx.drawImage(imgElement, 0, 0, ImageWidth, ImageHeight)
    UpdateImageOnSrcChange(imgElement, newCanvasCtx)
    return newCanvas
}



function CreateAnimatedImageObject(imgElement, mediaRef)
{
    return {
    ["ImgElement"] : imgElement,
    ["OffscreenCanvas"] : CreateOffscreenCanvas(imgElement),
    ["MediaRef"] : mediaRef
    }
}



for (var a in Projects)
{
    for (var b in Projects[a]["MediaRef"])
    {
        let imgElement = new Image()
        let mediaRef = Projects[a]["MediaRef"][b]
        imgElement.src = GetLowestQualityMediaSrc(mediaRef)
        let animatedImageObject = CreateAnimatedImageObject(imgElement, mediaRef);
        AnimatedImages.push(animatedImageObject);
    }
}


function UpdateCanvas(timeStamp) {
    // Process elapsed time
    if (PrevoiusTimeStamp == undefined)
    {
        PrevoiusTimeStamp = timeStamp;
    }

    if (PrevoiusTimeStamp == timeStamp) {
        setTimeout(requestAnimationFrame(UpdateCanvas), 10)
        return
    }
    const deltaTime = timeStamp - PrevoiusTimeStamp;

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = 200
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Update existing images
    ScrollingCanvasX -= 0.1 * deltaTime
    if (ScrollingCanvasX < -ImageWidth - 50)
    {
        ScrollingCanvasX = -ImageWidth
    }

    var runningImgIndex = 0
    while (RunningImages.length > runningImgIndex)
    {
        let imageObject = RunningImages[runningImgIndex];
        
        // Check if image is not visible (left side)
        if ((runningImgIndex * ImageWidth) + ScrollingCanvasX <= 0 - ImageWidth)
        {
            RunningImages.shift();
            ScrollingCanvasX = ScrollingCanvasX + ImageWidth;
            continue
        }

        // Check if image is not visible (right side)
        if((runningImgIndex * ImageWidth) + ScrollingCanvasX > canvas.width)
        {
            RunningImages.splice(runningImgIndex)
            break;
        }

        ctx.drawImage(imageObject["OffscreenCanvas"], (runningImgIndex * ImageWidth) + ScrollingCanvasX, 0)
        runningImgIndex += 1
    }


    // Add new running images
    if ((RunningImages.length * ImageWidth) + ScrollingCanvasX < canvas.width)
    {
        function filterToNotRunning(imageToFilter)
        {
            if (RunningImages.includes(imageToFilter))
            {
                return false
            }
            return true
        }
        var nonRunningImages = AnimatedImages.filter(filterToNotRunning)


        while ((RunningImages.length * ImageWidth) + ScrollingCanvasX < canvas.width)
        {
            let randomIndex = Math.floor(Math.random() * (nonRunningImages.length - 1));
            let selectedImageObject = nonRunningImages[randomIndex]

            nonRunningImages.splice(randomIndex, 1);
            RunningImages.push(selectedImageObject);

            ctx.drawImage(selectedImageObject["OffscreenCanvas"], (RunningImages.length - 1 * ImageWidth) + ScrollingCanvasX, 0)
        }
    }


    // Set overlay to semi transparent black
    ctx.fillStyle = "black";
    ctx.filter = "opacity(50%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    // Create title text
    var textFontSize = 75
    ctx.fillStyle = "white"
    ctx.font = textFontSize.toString() + "px Ubuntu"
    const text = "AstrophsicaDev"
    var textActualSize = ctx.measureText(text)

        // If text wont fit screen, shrink font size
    if (canvas.width < textActualSize.width)
    {
        var percentageToShrink = canvas.width / textActualSize.width
        textFontSize = Math.floor(textFontSize * percentageToShrink) 
        ctx.font = textFontSize.toString() + "px Ubuntu"
        textActualSize = ctx.measureText(text)
    }

    ctx.fillText(text, Math.floor((canvas.width / 2) - textActualSize.width / 2), Math.floor((canvas.height / 2) + textActualSize.emHeightAscent / 2))

    PrevoiusTimeStamp = timeStamp;
    requestAnimationFrame(UpdateCanvas);
}


function BeginGradualLoadOfAnimatedImages()
{
    for (var i = 0; i < AnimatedImages.length; i++) {
        let animatedImage = AnimatedImages[i]
        animatedImage["ImgElement"].addEventListener("ImgUpdate", HandleImgUpdate)
        LoadMediaRefGradually(animatedImage["ImgElement"], animatedImage["MediaRef"], 1)
    }
}

if (document.readyState == "complete") 
{
    BeginGradualLoadOfAnimatedImages()
}
else
{
    window.addEventListener("load", function() {
        BeginGradualLoadOfAnimatedImages()
    }, false);
}


requestAnimationFrame(UpdateCanvas)