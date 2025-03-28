import { LoadDirectMediaGradually } from "./mediamanagerv2.js"

var imgElements = document.querySelectorAll("img[data-media]")


function HandleImgUpdate(event) {
    var imgElement = event.target
    imgElement.src = event.detail
}


function BeginGradualLoadOfImg()
{
    for (var i = 0; i < imgElements.length; i++) {
        let imgElement = imgElements[i]
        imgElement.addEventListener("ImgUpdate", HandleImgUpdate)
        LoadDirectMediaGradually(imgElement, imgElement.dataset.media.split(","), 1)
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
