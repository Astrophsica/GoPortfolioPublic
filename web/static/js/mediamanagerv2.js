var MediaRefs = null
var eventName = "ImgUpdate"

async function loadMediaRefs() {
    const response = await fetch("static/json/mediaref.json");
    MediaRefs = await response.json();
}
await loadMediaRefs();

async function LoadImg(element, mediaList, lod)
{
    // Return if no other img left to load
    if (mediaList.length - 1 < lod)
    {
        return
    }

    var img = new Image()
    img.src = mediaList[lod]
    await img.decode();

    DispatchImageLoadedEvent(element, img.src)
    LoadImg(element, mediaList, lod + 1)
}

function LoadDirectMediaGradually(element, mediaList, startLvl)
{
    LoadImg(element, mediaList, startLvl)
}

function LoadMediaRefGradually(element, mediaRef, startLvl)
{
    var mediaList = MediaRefs[mediaRef]
    LoadImg(element, mediaList, startLvl)
}

function GetLowestQualityMediaSrc(mediaRef)
{
    return MediaRefs[mediaRef][0]
}

function DispatchImageLoadedEvent(element, src)
{
    element.dispatchEvent(
        new CustomEvent(eventName, {
            detail: src
        })
    )
}

export {LoadDirectMediaGradually, LoadMediaRefGradually, GetLowestQualityMediaSrc}