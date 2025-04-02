import { LoadDirectMediaGradually } from "./mediaManager.js"

var gradualLoadElements = document.querySelectorAll(".gradual-load-media")

function HandleMediaUpdate(event) {
    var mediaElement = event.target
    mediaElement.src = event.detail
    mediaElement.classList.remove("hidden")
    mediaElement.parentElement.classList.remove("placeholder")
}


function BeginGradualLoadOfImg()
{
    for (var i = 0; i < gradualLoadElements.length; i++) {
        let mediaElement = gradualLoadElements[i]
        mediaElement.addEventListener("MediaUpdate", HandleMediaUpdate)
        LoadDirectMediaGradually(mediaElement, mediaElement.dataset.media.split(","), 0)
    }
}


if (document.readyState == "complete") 
{
    BeginGradualLoadOfImg()
}
else
{
    window.addEventListener("load", function() {
        BeginGradualLoadOfImg()
    }, false);
}
