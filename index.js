require('dotenv').config();

const keys = require('./keys.js');
var inquirer = require('inquirer');
const Spotify = require('node-spotify-api');
const Twitter = require('twitter');
const request = require('request');
const fs = require("fs");


let spotify = new Spotify(keys.spotify);
let client = new Twitter(keys.twitter);


function appInit(){
    inquirer.prompt([
        {
          type: "list",
          message: "How may I help you today?",
          choices: ["Spotify this Song", "My Tweets", "Movie this"],
          name: "userCommand"
        }

      ]).then(answers => {

        switch(answers.userCommand){
            case 'Spotify this Song':
                console.log('\n');
                spotifySong();
                break;
            case 'My Tweets':
                console.log('\n');
                myTweets();
                break;
            case 'Movie this':
                console.log('\n');
                movieThis();
                break;
        }
    });
}


function anythingElse(){
    inquirer.prompt([
        {
          type: "confirm",
          message: "Can I help you with anything else today?",
          name: "confirm",
          default: true
        }

      ]).then(answers => {
        
        if(answers.confirm){
            console.log('\n');
            appInit();
        }else {
            console.log("\n Have a great day!");
        }
    });
}

function doWhatIsay(defaultVal){
    
    
    // fs is a core Node package for reading and writing files
    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
            return console.log(error);
        }

        if(defaultVal){
            let newValues = data.split('/');

            newValues.forEach(val=>{
     
                if(val.split(',')[0] === defaultVal){
                   let defValue = val.split(',')[1];

                    switch(defaultVal){
                        case 'spotify-this-song':
                            console.log('\n');
                            spotifySong(defValue);
                            break;
                        case 'movie-this':
                            console.log('\n');
                            movieThis(defValue);
                            break;
                    }
                    
                }
            });
        }

    });
}

function spotifySong(defValue){
    
    if(defValue){
        spotify
            .search({ type: 'track', query: defValue, limit: 1 })
            .then(function(response) {
                console.log('\n');
                console.log(`Artist(s): ${response.tracks.items[0].album.artists[0].name}`);
                console.log(`Song Name: ${defValue}`);
                console.log(`Preview Link: ${response.tracks.items[0].album.artists[0].external_urls.spotify}`);
                console.log(`Album Name: ${response.tracks.items[0].album.name}`);
                console.log('===============================================================')
                console.log('\n');
                anythingElse();
            })
            .catch(function(err) {
                console.log(err);
            });
    }else {
        inquirer.prompt([
        {
          type: "input",
          message: "What song do you want me to look up for you?",
          name: "userSongInput"
        }

        ]).then(answers => {
            if(!answers.userSongInput){
                let defaultVal = 'spotify-this-song';
                doWhatIsay(defaultVal);
            }else{
                spotify
                  .search({ type: 'track', query: answers.userSongInput, limit: 1 })
                  .then(function(response) {
                    console.log('\n');
                    console.log(`Artist(s): ${response.tracks.items[0].album.artists[0].name}`);
                    console.log(`Song Name: ${answers.userSongInput}`);
                    console.log(`Preview Link: ${response.tracks.items[0].preview_url}`);
                    console.log(`Album Name: ${response.tracks.items[0].album.name}`);
                    console.log('===============================================================')
                    console.log('\n');
                    anythingElse();
                  })
                  .catch(function(err) {
                    console.log(err);
                  });    
            }
            

        });    
    }
    
    
}

function myTweets(){
    client.get('statuses/user_timeline', function(error, tweets, response) {

        tweets.sort((a,b)=>{
            return  new Date(a.created_at) - new Date(b.created_at);
        }).map(tweet =>{
            console.log('\n');
            console.log(`Date: ${tweet.created_at}`);
            console.log(`Tweet: ${tweet.text}`);
            console.log('================================================================');
            console.log('\n');
        });
        anythingElse();
    });
}

function movieThis(defValue){
    
    if(defValue){
        
        let userInput = defValue.replace(' ', '+');
           console.log(defValue);
            console.log(userInput);
            request(`http://www.omdbapi.com/?apikey=${keys.omdb.api_key}&t=${userInput}`, function (error, response, body) {
                if(error){
                    console.log('error:', error); // Print the error if one occurred    
                }
                body = JSON.parse(body); 
                let rottenTom = body.Ratings.filter(rating => rating.Source === 'Rotten Tomatoes')[0].Value;
                console.log('\n');
                console.log(`Title: ${body.Title}`);
                console.log(`Released: ${body.Released}`);
                console.log(`Rating: ${body.imdbRating}`);
                console.log(`Rotten Tomato Rating: ${rottenTom}`);
                console.log(`Country Production: ${body.Country}`);
                console.log(`Language: ${body.Language}`);
                console.log(`Plot: ${body.Plot}`);
                console.log(`Actors: ${body.Actors}`);
                console.log('===========================================================');
                console.log('\n');
                anythingElse();
            });
        
    }else{
        inquirer.prompt([
            {
              type: "input",
              message: "What movie would you like me to look up for you?",
              name: "userMovieInput"
            }

            ]).then(answers => {
       
               if(!answers.userMovieInput){
                    let defaultVal = 'movie-this';

                    doWhatIsay(defaultVal);
                }else{

                    let userInput = answers.userMovieInput.replace(' ', '+');

                    request(`http://www.omdbapi.com/?apikey=${keys.omdb.api_key}&t=${userInput}`, function (error, response, body) {
                        if(error){
                            console.log('error:', error); // Print the error if one occurred    
                        }
                        body = JSON.parse(body); 
                        let rottenTom = body.Ratings.filter(rating => rating.Source === 'Rotten Tomatoes')[0].Value;
                        console.log('\n');
                        console.log(`Title: ${body.Title}`);
                        console.log(`Released: ${body.Released}`);
                        console.log(`Rating: ${body.imdbRating}`);
                        console.log(`Rotten Tomato Rating: ${rottenTom}`);
                        console.log(`Country Production: ${body.Country}`);
                        console.log(`Language: ${body.Language}`);
                        console.log(`Plot: ${body.Plot}`);
                        console.log(`Actors: ${body.Actors}`);
                        console.log('===========================================================');
                        console.log('\n');
                        anythingElse();
                    });
                }
            });    
    }
    
             
                
}


appInit();
