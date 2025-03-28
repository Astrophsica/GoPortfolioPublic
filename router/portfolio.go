package router

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"slices"
	"sort"
	"strconv"
)

type JsonProject struct {
	DisplayName string            `json:"DisplayName"`
	Year        int               `json:"Year"`
	Subtitle    string            `json:"Subtitle"`
	MediaRefs   []string          `json:"MediaRef"`
	Description string            `json:"Description"`
	Links       map[string]string `json:"Links"`
	Tags        []string          `json:"Tags"`
}

type JsonProjects struct {
	Projects map[string]JsonProject
}

type TemplateProject struct {
	DisplayName string
	Year        int
	Subtitle    string
	Media       map[string][]string
	Description string
	Links       map[string]string
	Tags        []string
	ProjectId   string
}

type PageData struct {
	ProjectsByYear map[int][]TemplateProject
	SortedYearKeys []int
	Tags           map[string]string
	SortedTagKeys  []string
	Icons          map[string]string
}

var mediaRefLoaded = false
var projectsLoaded = false
var tagsLoaded = false

var mediaRefs = make(map[string][]string)
var tags = make(map[string]string)

var pageData PageData

func GetMediaFromMediaRef(mediaRef string) []string {
	if !mediaRefLoaded {
		jsonFile, err := os.Open("web/static/json/mediaref.json")
		if err != nil {
			log.Fatalln(err)
		}
		defer jsonFile.Close()
		byteValue, _ := io.ReadAll(jsonFile)

		err = json.Unmarshal(byteValue, &mediaRefs)
		if err != nil {
			log.Fatalln(err)
		}
		mediaRefLoaded = true
	}

	return mediaRefs[mediaRef]
}

func AddToIconsList(tagName string) {
	if pageData.Icons == nil {
		pageData.Icons = make(map[string]string)
	}
	pageData.Icons[tagName] = GetMediaFromMediaRef(tagName + "Icon")[0]
}

func LoadProjects() {
	// Open file and read data
	jsonFile, err := os.Open("web/static/json/projects.json")
	if err != nil {
		log.Fatalln(err)
	}
	defer jsonFile.Close()
	byteValue, _ := io.ReadAll(jsonFile)

	// Attempt to set data to projects struct
	var projects []JsonProject
	err = json.Unmarshal(byteValue, &projects)
	if err != nil {
		log.Fatalln(err)
	}

	// Process jsonProject data into templateProject
	projectsByYear := make(map[int][]TemplateProject)
	for projectIndex, projectData := range projects {
		templateProject := TemplateProject{
			DisplayName: projectData.DisplayName,
			Year:        projectData.Year,
			Media:       make(map[string][]string, len(projectData.MediaRefs)),
			Subtitle:    projectData.Subtitle,
			Description: projectData.Description,
			Links:       projectData.Links,
			Tags:        projectData.Tags,
		}

		// Set media map
		for _, mediaRef := range projectData.MediaRefs {
			mediaRefWithMedia := GetMediaFromMediaRef(mediaRef)
			templateProject.Media[mediaRef] = mediaRefWithMedia
		}

		// Set icons used for links
		for iconName := range templateProject.Links {
			AddToIconsList(iconName)
		}

		// Create unique projectID
		templateProject.ProjectId = "Project-" + strconv.Itoa(projectIndex)

		// Organise projects by year
		projectsByYear[templateProject.Year] = append(projectsByYear[templateProject.Year], templateProject)
	}

	// Sort year keys
	yearKeys := make([]int, 0, len(projectsByYear))
	for year := range projectsByYear {
		yearKeys = append(yearKeys, year)
	}

	// Reverse sorts the years
	sort.Sort(sort.Reverse(sort.IntSlice(yearKeys)))

	pageData.SortedYearKeys = yearKeys
	pageData.ProjectsByYear = projectsByYear

	projectsLoaded = true
}

func LoadTags() {
	if !tagsLoaded {
		jsonFile, err := os.Open("web/static/json/tags.json")
		if err != nil {
			log.Fatalln(err)
		}
		defer jsonFile.Close()
		byteValue, _ := io.ReadAll(jsonFile)

		err = json.Unmarshal(byteValue, &tags)
		if err != nil {
			log.Fatalln(err)
		}
		tagsLoaded = true
	}

	tagKeys := make([]string, 0, len(tags))
	for tagName, tagType := range tags {
		if tagType == "primary" {
			tagKeys = slices.Insert(tagKeys, 0, tagName)
			continue
		}
		tagKeys = append(tagKeys, tagName)
	}

	pageData.Tags = tags
	pageData.SortedTagKeys = tagKeys
}

func HandlePortfolio(w http.ResponseWriter, r *http.Request) {

	if !projectsLoaded {
		LoadProjects()
		LoadTags()
	}

	t, err := template.ParseFiles("web/templates/base.html", "web/templates/portfolio.html")
	if err != nil {
		log.Fatalln(err)
	}

	err = t.ExecuteTemplate(w, "portfolio.html", pageData)
	if err != nil {
		log.Fatalln(err)
	}
}
