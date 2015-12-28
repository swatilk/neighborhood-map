# Neighborhood-Map
The app shows a list restaurants around a place, as a list and on the map with markers. Each marker, when clicked, shows additional information about the restaurant, like its contact, address, website. The project uses KnockoutJS to bind the data on the list with markers on map, so whenever an item on the list is clicked, only that particular restaurant is showed on the map (filtering).

## Setup
To run the project, download all the files. 
* Run `npm install` command, inside the current project folder, via command line. This will install all the dependecies required to run the project.
* Run the `grunt` command. This will perform run time tasks like, minifying js and css files.
* `grunt` command will generate **node_modules** folder and minified versions of the js and css files, in a new folder **dist**
* Now run **index.html** on the browser.
* This will display a set of restaurants fetched from the **Foursquare API** based on a location and the map with markers, from **google maps API**.
* The app also displays a textarea which filters the restaurants, as the user types in. This also updates the markers on the map
* Map provides a `textarea` to enter place name with autocomplete functionality. The chosen place id then displayed on the map.

