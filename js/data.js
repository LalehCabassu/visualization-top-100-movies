var all_critics = {};       // <criticID, Critic>
/*
 * <imdbID, Movie>
 * It is better to keep it as a dictionary since it is more efficient for loading the scores
 */
var all_movies = {};
var top100_movies = [];
var scoreLowerBound = 20;

function init(callback) {

    loadContinentsCountriesMap();
    loadMovies(loadScores, filterTopMovies, loadCritics, callback);
}

function loadMovies(callback1, callback2, callback3, callback4) {
    d3.tsv("../data/metadata.tsv", function (error, data) {
        if (error) {
            throw error;
        }

        data.forEach(function (d) {
            all_movies[d.imdbID] = Movie.fromMetadata(d);
        });

        callback1(callback2, callback3, callback4);
    });
}

function loadScores(callback1, callback2, callback3) {
    d3.tsv("../data/movies.tsv", function (error, data) {
        if (error) {
            throw error;
        }

        data.forEach(function (d) {
            var movie = all_movies[d['#imdbid']];
            all_movies[d['#imdbid']] = Movie.calcCriticsScore(movie, d);
        });

        callback1(callback2, callback3);
    });
}

function filterTopMovies(callback1, callback2) {
    Object.keys(all_movies).forEach(function (imdbID) {
        if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
            var movie = all_movies[imdbID];
            if (!(typeof movie.score === "undefined") && movie.score > scoreLowerBound) {
                top100_movies.push(movie);
            }
        }
    });
    callback1(callback2);
}


function loadCritics(callback) {
    d3.tsv("../data/critics.tsv", function (error, data) {
        if (error) {
            throw error;
        }

        data.forEach(function (d) {
            all_critics[d['#critic_id']] = Critic.fromCritics(d);
        });

        callback();
    });
}

var continents = ['Africa', 'Asia', 'Oceania', 'Europe', 'North America', 'South America'];
var countries = [
    /* Africa */
    ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad',
        'Channa', 'Comoros Island', 'Congo', 'Congo (Zaire)', 'Cote D\'Ivoire', 'Djibouti', 'Egypt', 'Equatorial Guinea',
        'Eritrea', 'Ethiopia', 'Gabon', 'Guinea', 'Guinea Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
        'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
        'Sao Tomi and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'Sudan', 'Swaziland',
        'Tanzania', 'Tunisia', 'Togo', 'Uganda', 'Zambia', 'Zimbabwe'],
    /* Asia */
    ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus',
        'Georgia', 'Hong Kong', 'Iran', 'Iraq', 'India', 'Indonesia', 'Israel and Gaza', 'Israel', 'Japan', 'Jordan',
        'Kazakhstan', 'Kuwait', 'Kirghistan', 'Laos', 'Lebanon', 'Malaysia', 'Mongolia', 'Myanmar (Burma)', 'Nepal',
        'North Korea', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia',
        'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikstan', 'Thailand', 'Turkey', 'Turkmenistan',
        'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'],
    /* Oceania */
    ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia, F.S.O', 'Nauru', 'New Zealand',
        'Papua New Guinea', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu', 'Western Samoa'],
    /* Europe */
    ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Cape Verde', 'Croatia',
        'Czech Republic', 'Denmark', 'Denmark and Greenland', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
        'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova',
        'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
        'Turkey', 'Ukraine', 'UK', 'Yugoslavia'],
    /* North America */
    ['Barbados', 'Bahamas', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador',
        'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Pacific Islands Inc. Hawaii', 'Panama',
        'St Kitts-Nevis', 'St Lucia', 'St Vincent and the Grenadines', 'Trinidad and Tobago', 'USA'],
    /* South America */
    ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'French Guiana', 'Guyana', 'Nicaragua', 'Paraguay',
        'Peru', 'Suriname', 'Uruguay', 'Venezuela']
];

var continentsCountries = {};
function loadContinentsCountriesMap() {
    for (var i = 0; i < continents.length; i++) {
        continentsCountries[continents[i]] = countries[i];
    }
}

// returns the continent of the first country in the list
function findContinent(countries) {
    for (var i = 0; i < countries.length; i++) {
        for (var j = 0; j < continents.length; j++) {
            if (continentsCountries[continents[j]].indexOf(countries[i]) >= 0) {
                return continents[j];
            }
        }
    }
}

//load director
function loadDirector(allMovies_selected) {
    var directors = [];
    if (allMovies_selected) {
        Object.keys(all_movies).forEach(function (imdbID) {
            if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                var movie = all_movies[imdbID];
                if (!(typeof movie.director === "undefined") && directors.indexOf(movie.director) < 0) {
                    directors.push(movie.director);
                }
            }
        });
    } else {
        Object.keys(top100_movies).forEach(function (imdbID) {
            var movie = top100_movies[imdbID];
            if (!(typeof movie.director === "undefined") && directors.indexOf(movie.director) < 0) {
                directors.push(movie.director);
            }
        });
    }
    return directors.sort();
}

//load countries
function loadCountries(allMovies_selected) {
    var countries = [];
    if (allMovies_selected) {
        Object.keys(all_movies).forEach(function (imdbID) {
            if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                var movie = all_movies[imdbID];
                if (!(typeof movie.countries === "undefined")) {
                    movie.countries.forEach(function (c) {
                        c = c.trim();
                        if (c !== 'N/A' && countries.indexOf(c) < 0) {
                            countries.push(c);
                        }
                    });
                }
            }
        });
    } else {
        Object.keys(top100_movies).forEach(function (imdbID) {
            var movie = top100_movies[imdbID];
            movie.countries.forEach(function (c) {
                c = c.trim();
                if (countries.indexOf(c) < 0) {
                    countries.push(c);
                }
            });
        });
    }
    return countries.sort();
}
//load genres
function loadGenres(allMovies_selected) {
    var genres = [];
    if (allMovies_selected) {
        Object.keys(all_movies).forEach(function (imdbID) {
            if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                var movie = all_movies[imdbID];
                if (!(typeof movie.genre === "undefined")) {
                    movie.genre.forEach(function (c) {
                        c = c.trim();
                        if (c !== 'N/A' && genres.indexOf(c) < 0) {
                            genres.push(c);
                        }
                    });
                }
            }
        });
    } else {
        Object.keys(top100_movies).forEach(function (imdbID) {
            var movie = top100_movies[imdbID];
            movie.genre.forEach(function (c) {
                c = c.trim();
                if (genres.indexOf(c) < 0) {
                    genres.push(c);
                }
            });
        });
    }
    return genres.sort();
}
//load movie's Title
function loadTitle(allMovies_selected) {
    var titles = [];
    if (allMovies_selected) {
        Object.keys(all_movies).forEach(function (imdbID) {
            if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                var movie = all_movies[imdbID];
                if (!(typeof movie.title === "undefined")) {
                    titles.push(movie.title);
                }
            }
        });
    } else {
        Object.keys(top100_movies).forEach(function (imdbID) {
            titles.push(top100_movies[imdbID].title);
        });
    }
    return titles.sort();
}


//filter movie by country
function filterByCountry(arrayOpts, allMovies_selected) {
    var movieBycon = [];
    if (allMovies_selected) {
        arrayOpts.forEach(function (con) {
            Object.keys(all_movies).forEach(function (imdbID) {
                if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                    var movie = all_movies[imdbID];
                    if (!(typeof movie.countries === "undefined")) {
                        movie.countries.forEach(function (c) {
                            if (c === con && movieBycon.indexOf(movie) < 0) {
                                movieBycon.push(movie);
                            }
                        });
                    }
                }
            });
        });
    } else {
        arrayOpts.forEach(function (con) {
            Object.keys(top100_movies).forEach(function (imdbID) {
                var movie = top100_movies[imdbID];
                movie.countries.forEach(function (c) {
                    if (c === con && movieBycon.indexOf(movie) < 0) {
                        movieBycon.push(movie);
                    }
                });
            });

        });
    }
    return movieBycon;
}

//filter movie by Genre
function filterByGenre(arrayOpts, allMovies_selected) {
    var movieBygen = [];
    if (allMovies_selected) {
        arrayOpts.forEach(function (gen) {
            Object.keys(all_movies).forEach(function (imdbID) {
                if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                    var movie = all_movies[imdbID];
                    if (!(typeof movie.countries === "undefined")) {
                        movie.genre.forEach(function (c) {
                            if (c === gen && movieBygen.indexOf(movie) < 0) {
                                movieBygen.push(movie);
                            }
                        });
                    }
                }
            });
        });
    } else {
        arrayOpts.forEach(function (gen) {
            Object.keys(top100_movies).forEach(function (imdbID) {
                var movie = top100_movies[imdbID];
                movie.genre.forEach(function (c) {
                    if (c === gen && movieBygen.indexOf(movie) < 0) {
                        movieBygen.push(movie);
                    }
                });
            });

        });
    }
    return movieBygen;
}

//filter movie by director
function filterByDirector(arrayOpts, allMovies_selected) {
    var movieBydire = [];
    if (allMovies_selected) {
        arrayOpts.forEach(function (dir) {
            Object.keys(all_movies).forEach(function (imdbID) {
                if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                    var movie = all_movies[imdbID];
                    if (!(typeof movie.director === "undefined") && movie.director == dir && movieBydire.indexOf(movie) < 0) {
                        movieBydire.push(movie);
                    }
                }
            });
        });
    } else {
        arrayOpts.forEach(function (dir) {
            Object.keys(top100_movies).forEach(function (imdbID) {
                var movie = top100_movies[imdbID];
                if (!(typeof movie.director === "undefined") && movie.director == dir && movieBydire.indexOf(movie) < 0) {
                    movieBydire.push(movie);
                }
            });

        });
    }
    return movieBydire;
}
//filter movie by title
function filterByTitle(arrayOpts, allMovies_selected) {
    var movieBytit = [];
    if (allMovies_selected) {
        arrayOpts.forEach(function (tit) {
            Object.keys(all_movies).forEach(function (imdbID) {
                if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                    var movie = all_movies[imdbID];
                    if (!(typeof movie.title === "undefined") && movie.title == tit && movieBytit.indexOf(movie) < 0) {
                        movieBytit.push(movie);
                        console.log("* " + movie.score);
                    }
                }
            });
        });
    } else {
        arrayOpts.forEach(function (tit) {
            Object.keys(top100_movies).forEach(function (imdbID) {
                var movie = top100_movies[imdbID];
                if (!(typeof movie.title === "undefined") && movie.title == tit && movieBytit.indexOf(movie) < 0) {
                    movieBytit.push(movie);
                }
            });

        });
    }
    return movieBytit;
}

//Filter by years
function filterByYear(value0, value1, allMovies_selected) {
    var movieByyear = [];
    if (allMovies_selected) {
        Object.keys(all_movies).forEach(function (imdbID) {
            if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                var movie = all_movies[imdbID];
                if (!(typeof movie.year === "undefined") && (movie.year >= value0 && movie.year <= value1) && movieByyear.indexOf(movie) < 0) {
                    movieByyear.push(movie);
                }
            }
        });

    } else {
        Object.keys(top100_movies).forEach(function (imdbID) {
            var movie = top100_movies[imdbID];
            if (!(typeof movie.year === "undefined") && movie.year >= value0 && movie.year <= value1 && movieByyear.indexOf(movie) < 0) {
                movieByyear.push(movie);
            }
        });
    }
    return movieByyear;
}

//Filter by scores
function filterByScores(value0, value1, allMovies_selected) {
    var movieByscore = [];
    if (allMovies_selected) {
        Object.keys(all_movies).forEach(function (imdbID) {
            if (!(typeof imdbID === "undefined" || typeof all_movies[imdbID] === "undefined")) {
                var movie = all_movies[imdbID];
                if (!(typeof movie.score === "undefined") && movie.score >= value0 && movie.score <= value1 && movieByscore.indexOf(movie) < 0) {
                    movieByscore.push(movie);
                }
            }
        });

    } else {
        Object.keys(top100_movies).forEach(function (imdbID) {
            var movie = top100_movies[imdbID];
            if (!(typeof movie.score === "undefined") && movie.score >= value0 && movie.score <= value1 && movieByscore.indexOf(movie) < 0) {
                movieByscore.push(movie);
            }
        });

    }
    return movieByscore;
}

/**
 Africa        #F44336
 Asia            #FFEB3B
 Australia        #4CAF50
 Europe            #2196F3
 North America    #9C27B0
 South America    #795548
 */
var colors = {
    'Africa': '#F44336',
    'Asia': '#FFEB3B',
    'Oceania': '#4CAF50',
    'Europe': '#2196F3',
    'North America': '#9C27B0',
    'South America': '#795548'
};

function findColor(continent) {
    var result = '#000000';
    if (continent in colors) {
        result = colors[continent];
    }
    return result;
}

function Movie() {
    // from metadata.tsv
    this.imdbID = null;
    this.title = null;
    this.poster = null;
    this.countries = [];
    this.released = null;
    this.director = null;
    this.genre = null;
    this.language = null;
    this.plot = null;
    this.awards = null;
    this.runtime = null;
    this.year = null;
    this.writer = null;
    this.actors = null;

    // from movies.tsv
    this.score = null;
    this.criticScore = {};    // <criticID, score>

    this.continent = null;
    this.color = null;
}

Movie.fromMetadata = function (data) {
    var newMovie = null;
    if (data != null) {
        newMovie = new Movie();
        newMovie.imdbID = data.imdbID;
        newMovie.title = data['#title'];
        newMovie.poster = data.Poster;
        newMovie.released = new Date(data.Released); // formatDate(data.Released);
        newMovie.director = data.Director;
        newMovie.genre = listGenres(data.Genre);
        newMovie.language = data.Language;
        newMovie.plot = data.Plot;
        newMovie.awards = data.Awards;
        newMovie.runtime = data.Runtime;
        newMovie.year = data.Year;
        newMovie.writer = data.Writer;
        newMovie.actors = data.Actors;

        newMovie.countries = listCountries(data.Country);
        newMovie.continent = findContinent(newMovie.countries);
        newMovie.color = findColor(newMovie.continent);
    }
    return newMovie;
};

function formatDate(date) {
    var result = '';

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    result = months[date.getMonth()] + ' ' + date.getFullYear();

    //result = dateStr.replace(' ', '-');
    //result = result.replace(' ', '-');
    //
    //var date = new Date(dateStr);
    //result = date.toLocaleDateString();  // d/m/yyyy
    //
    //console.log('ISO: ' + date.toISOString());
    //console.log('toUTCString: ' + date.toUTCString());
    //console.log('toDateString: ' + date.toDateString());
    //console.log('toLocaleDateString: ' + date.toLocaleDateString());  // yes
    //console.log('toLocaleString: ' + date.toLocaleString());
    //console.log('toLocaleTimeString: ' + date.toLocaleTimeString());
    //console.log('toTimeString: ' + date.toTimeString());

    return result;
}

// from movies.tsv
Movie.calcCriticsScore = function (obj, data) {
    if (!(typeof obj === "undefined" || typeof data === "undefined")) {
        var totalScore = 0;
        for (var i = 0; i < 177; i++) {
            var criticID = 'c' + pad((i + 1), 3);
            var rank = data[criticID];
            if (rank > 0) {
                var score = 11 - rank;
                totalScore += score;
                if (!(typeof obj.criticScore === "undefined")) {
                    obj.criticScore[criticID] = score;
                }
            }
        }
        if (!(typeof obj.score === "undefined")) {
            // I am not sure if we want to do this ???
            // obj.score = Math.sqrt(totalScore) * 10;

            obj.score = totalScore;
        }
    }
    return obj;
};

function getCriticContinentPercentage(obj) {
    var result = "";

    var continentPercentage = {}; // <continent, percentage>

    if (!(typeof obj === "undefined" || typeof obj.criticScore === "undefined")) {
        var continentScore = 0;
        var criticIds = Object.keys(obj.criticScore);
        continents.forEach(function (continent) {
            criticIds.forEach(function (crId) {
                var critic = all_critics[crId];
                if (critic.continent === continent) {
                    continentScore += obj.criticScore[crId];
                }
            });
            continentPercentage[continent] = continentScore / obj.score * 100;
            continentScore = 0;
        });
    }

    for (var i = 0; i < continents.length; i++) {
        var percentage = Math.round(continentPercentage[continents[i]]);

        if (i == 1 || i == 3) {
            result += continents[i] + ' ' + percentage + "% |<br/>";
        }
        else {
            result += continents[i] + ' ' + percentage + "% | ";
        }
    }

    return result.substr(0, result.length - 3);
}

function Critic() {
    // from critics.tsv
    this.criticID = null;
    this.countries = [];

    this.continent = null;
    this.color = null;
}

// from critics.tsv
Critic.fromCritics = function (data) {
    var newCritic = null;
    if (data != null) {
        newCritic = new Critic();
        newCritic.criticID = data['#critic_id'];
        newCritic.countries = listCountries(data.country);
        newCritic.continent = findContinent(newCritic.countries);
        newCritic.color = findColor(newCritic.continent);
    }
    return newCritic;
};

function listCountries(countriesStr) {
    var result = [];

    var countries = countriesStr.split(',');
    countries.forEach(function (c) {
        var trimmed = c.trim();
        if (trimmed !== "" && trimmed !== 'N/A') {
            result.push(trimmed);
        }
    });

    return result;
}

function listGenres(genresStr) {
    var result = [];

    var genres = genresStr.split(',');
    genres.forEach(function (c) {
        var trimmed = c.trim();
        if (trimmed !== "" && trimmed !== 'N/A') {
            result.push(trimmed);
        }
    });

    return result;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}