require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require("node-spotify-api");
const spotify = new Spotify(keys.spotify);
const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");

initApp();

function initApp() {
    console.log("\n---------------------------------------");
    console.log("L I R I - B O T")
    console.log("---------------------------------------\n");
    inquirer.prompt({
        type: "list",
        name: "option",
        message: "Select an option:",
        choices: [
            "Search for a band:",
            "Search for a song:",
            "Search for a movie:",
            "Search something random"
        ]
    }).then(function (answer) {
        switch (answer.option) {
            case "Search for a band:":
                inquirer.prompt([
                    {
                        type: "input",
                        name: "band",
                        message: "What band would you like me to search?"
                    }
                ]).then(function (answer) {
                    concertThis(answer.band);
                });
                break;
            case "Search for a song:":
                inquirer.prompt([
                    {
                        type: "input",
                        name: "song",
                        message: "What song would you like me to search?"
                    }
                ]).then(function (answer) {
                    spotifyThisSong(answer.song);
                });
                break;
            case "Search for a movie:":
                inquirer.prompt([
                    {
                        type: "input",
                        name: "movie",
                        message: "What movie would you like me to search?"
                    }
                ]).then(function (answer) {
                    movieThis(answer.movie);
                });
                break;
            case "Search something random":
                random();
                break;
        }
    });
};

function concertThis(band) {
    console.log("\nSearching for concerts by <" + band + "> on the Bands in Town API...");
    let url = "https://rest.bandsintown.com/artists/" + band + "/events?app_id=codingbootcamp";
    axios.get(url)
        .then(function (response) {
            let events = response.data;
            if (!Array.isArray(events) || !events.length) {
                console.log("\nI'm sorry, I couldn't find any upcoming concerts from this band.");
            } else {
                console.log("\nI found " + events.length + " upcoming concerts from this band. Here are the details: ");
                events.forEach(function (item) {
                    console.log("-------");
                    console.log("Venue: " + item.venue.name);
                    console.log("Location: " + item.venue.city + ", " + item.venue.country);
                    console.log("Date: " + item.datetime);
                });
            }
        },
            function (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log("Error", error.message);
                }
                console.log(error.config);
            }
        );
}

function spotifyThisSong(song) {
    console.log("\nSearching for <" + song + "> on the Spotify API...");
    spotify.search({
        type: "track",
        query: song
    },
        function (err, data) {
            if (err) {
                return console.log("Error occurred: " + err);
            }
            console.log("\nArtist: " + data.tracks.items[0].artists[0].name);
            console.log("Album: " + data.tracks.items[0].album.name);
            console.log("Preview: " + data.tracks.items[0].preview_url);
        });
}

function movieThis(movie) {
    console.log("\nSearching for <" + movie + "> on the OMDB API...");
    let url = "http://www.omdbapi.com/?apikey=trilogy&t=" + movie;
    axios.get(url)
        .then(function (response) {
            let res = response.data;
            if (res.Response == false) {
                console.log("\nI'm sorry, I couldn't find the movie.");
            } else {
                console.log("\nHere's what I found: ");
                console.log("Title: " + res.Title);
                console.log("Year: " + res.Year);
                console.log("IMDB rating: " + res.imdbRating);
                console.log("Language: " + res.Language);
                console.log("Actors: " + res.Actors);
                console.log("Plot: " + res.Plot);
            }
        },
            function (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log("Error", error.message);
                }
                console.log(error.config);
            }
        );
}

function random() {
    console.log("\nDoing whatever the random.txt says...");
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        let dataArr = data.split(",");
        let instruction = dataArr[0];
        let value = dataArr[1];
        switch (instruction) {
            case "band":
                concertThis(value);
                break;
            case "song":
                spotifyThisSong(value);
                break;
            case "movie":
                movieThis(value);
                break;
            default:
                console.log("Error in file");
        }
    });
}