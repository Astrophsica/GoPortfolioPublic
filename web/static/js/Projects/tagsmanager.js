var Tags = 
{
    ["Lua"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "primary"
    },
    ["C#"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "primary"
    },
    ["Go"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "primary"
    },
    ["Web (HTML | CSS | JavaScript)"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "primary"
    },
    ["Roblox"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["Unity"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["Linux"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["University"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["Open Source"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["OpenGL"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["Shaders"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    },
    ["Bootstrap"] : 
    {
        ["Enabled"] : false,
        ["Type"] : "secondary"
    }
}


const OnTagButtonClick = e =>
{
    var buttonElement = e.target
    console.log(buttonElement.textContent)
    var tagName = buttonElement.textContent

    // Toggle tag enabled
    Tags[tagName]["Enabled"] = !Tags[tagName]["Enabled"]

    // Find button for tag and set it to show if toggled or not
    var tagsSection = document.getElementById("Tags")
    var buttons = tagsSection.querySelectorAll("button")
    for (var i = 0; i < buttons.length; i++)
    {
        if (buttons[i].textContent == tagName)
        {
            if (Tags[tagName]["Enabled"] == true)
            {
                buttons[i].classList.replace("btn-outline-" + Tags[tagName]["Type"], "btn-" + Tags[tagName]["Type"])
            }
            else
            {
                buttons[i].classList.replace("btn-" + Tags[tagName]["Type"], "btn-outline-" + Tags[tagName]["Type"])
            }
            break
        }
    }

    // Check if any tags are enabled. If not, then show all project cards
    var filterActive = false
    for (var tagName in Tags)
    {
        if (Tags[tagName]["Enabled"] == true)
        {
            filterActive = true
            break
        }
    }

    // Set project to show or hide based on toggled tags (or show all if no tag enabled)
    var projectCards = document.getElementsByClassName("project")
    for (var projectIndex = 0; projectIndex < projectCards.length; projectIndex++)
    {
        var projectElement = projectCards[projectIndex]
        var showProject = true

        if (filterActive)
        {
            showProject = false
            var badges = projectElement.querySelectorAll(".badge")
            for (var badgeIndex = 0; badgeIndex < badges.length; badgeIndex++)
            {
                var badge = badges[badgeIndex]
                if (Tags[badge.textContent]["Enabled"] == true)
                {
                    showProject = true
                }
            }
        }


        if (showProject == false)
        {
            projectElement.classList.toggle("hidden", true)
        }
        else
        {
            projectElement.classList.toggle("hidden", false)
        }
    }

    // Hide year if all projects in that year is hidden
    var yearCards = document.getElementsByClassName("year")
    for (var yearIndex = 0; yearIndex < yearCards.length; yearIndex++)
    {
        var yearElement = yearCards[yearIndex]
        var hiddenCards = yearElement.querySelectorAll(".project.hidden")
        var cards = yearElement.querySelectorAll(".project")
        
        if (hiddenCards.length == cards.length)
        {
            yearElement.classList.toggle("hidden", true)
        }
        else
        {
            yearElement.classList.toggle("hidden", false)
        }
    }
}

// Create filter button click event
var tagsSection = document.getElementById("Tags")
var buttons = tagsSection.querySelectorAll("button")
for (var i = 0; i < buttons.length; i++)
{
    buttons[i].addEventListener('click', OnTagButtonClick)
}
 