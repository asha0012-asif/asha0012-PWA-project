// 1 - modify manifest.json to include company icon (make icon)
// 2 - add hamburger nav menu to move between pages (home & favourites)
// 3 - get home page working
// 4 - add css to everything

const APP = {
    BASE_URL: "https://asha0012-midterm-project-api.onrender.com/api/movies",

    version: null,
    movieCacheName: null,
    favouritesCacheName: null,

    init: () => {
        APP.version = 1;
        APP.movieCacheName = `movies-pwa-project-${APP.version}`;
        APP.favouritesCacheName = `favourites-pwa-project-${APP.version}`;

        APP.registerSW();

        const route = location.pathname;
        console.log("Route", route);
        if (route === "/index.html" || route === "/") {
            console.log("Home page");
        } else if (route === "/search.html") {
            const searchForm = document.querySelector(".search-form");
            searchForm.addEventListener("submit", (ev) => {
                ev.preventDefault();

                const keyword =
                    document.getElementById("search-form__input").value;
                const sort = document.getElementById("filters").value;

                if (!keyword) {
                    alert("Please enter a search term");
                    return;
                }

                location.assign(
                    `./search-results.html?keyword=${keyword}&sort=${sort}`
                );
            });
        } else if (route.includes("/search-results")) {
            const searchParams = new URLSearchParams(location.search);

            const keyword = searchParams.get("keyword");
            const sort = searchParams.get("sort");

            APP.fetchMovies(keyword, sort);

            if (!navigator.onLine) {
                const cacheResults = document.getElementById("cache-results");
                cacheResults.addEventListener("click", APP.handleMovieClick);

                return;
            }

            const searchResults = document.getElementById("search-results");
            searchResults.addEventListener("click", APP.handleMovieClick);
        } else if (route.includes("/details")) {
            const movieID = location.search.split("=")[1];
            APP.fetchMovieDetails(movieID);

            const favouriteIcon = document.getElementById("favourite-icon");

            favouriteIcon.addEventListener("click", (ev) => {
                ev.preventDefault();
                console.log("Favourite icon clicked");

                // save this movie to favourites
                APP.fetchFavouriteMovie(movieID);
            });
        } else if (route === "/favourites.html") {
            console.log("Favourites page");

            APP.displayFavouriteMovies();

            const favouriteResults =
                document.getElementById("favourite-results");
            favouriteResults.addEventListener("click", APP.handleMovieClick);
        } else if (route === "/404.html") {
            console.log("404 page");
        } else {
            console.log("Invalid route");
            location.assign("./404.html");
            return;
        }
    },

    registerSW: () => {
        console.log("\nRegistering Service Worker");

        window.addEventListener("load", async () => {
            if ("serviceWorker" in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register(
                        "./sw.js",
                        { scope: "/" }
                    );

                    registration &&
                        console.log(
                            "Service worker is registered",
                            registration
                        );
                } catch (err) {
                    console.warn("Failed to register service worker", err);
                }
            } else {
                console.log("Service workers are not supported");
            }
        });
    },

    fetchMovies: async (keyword, sort) => {
        console.log("\nFetching Movie Data");

        try {
            console.log("keyword", keyword);
            console.log("sort", sort);

            if (!navigator.onLine) {
                console.log("Offline mode");

                const cacheValue = document.getElementById("cache-value");
                cacheValue.textContent = keyword;

                APP.displayCachedMovies(keyword, sort);
                return;
            } else {
                const url = new URL(
                    `${APP.BASE_URL}?keyword=${keyword}&sort=${sort}`
                );

                const response = await fetch(url);
                console.log("Response", response);

                const { data } = await response.json();
                console.log(data);

                // if no data is returned, go to 404 page
                if (data.length === 0) {
                    location.assign("./404.html");
                    return;
                }

                const searchValue = document.getElementById("search-value");
                searchValue.textContent = keyword;

                const searchResults = document.getElementById("search-results");
                APP.displayMovies(searchResults, data);
            }
        } catch (err) {
            console.error(err);
        }
    },

    displayMovies: (results, movies) => {
        let df = new DocumentFragment();

        movies.forEach(async ({ id, imageUrl, title }) => {
            const movieCard = document.createElement("li");
            movieCard.classList.add("card");
            movieCard.setAttribute("data-id", id);

            movieCard.innerHTML = `
                <img src="${imageUrl}" alt="${title} poster" />
                <p>${title}</p>
                <div class="icon">
                    <img
                        src="../img/icons/ion_heart.svg"
                        alt="Favorite icon"
                    />
                </div>
            `;

            df.append(movieCard);
        });

        results.append(df);
    },

    handleMovieClick: async (ev) => {
        console.log("MOVIE CLICKED");

        const card = ev.target.closest(".card");

        const movieID = card.getAttribute("data-id");
        location.assign(`./details.html?id=${movieID}`);
    },

    fetchMovieDetails: async (movieID) => {
        console.log("FETCH MOVIE DETAILS");

        const response = await fetch(`${APP.BASE_URL}/${movieID}`);
        const { data } = await response.json();

        // save this data to cache for offline use
        console.log(data);

        APP.displayMovieDetails(data);
    },

    displayMovieDetails: ({
        imageUrl,
        title,
        release_date,
        adult,
        popularity,
        overview,
    }) => {
        const basicDetails = document.querySelector(".basic-details");

        const year = new Date(release_date).getFullYear();

        basicDetails.innerHTML = `
        <div class="basic-details__poster">
            <img src="${imageUrl}" alt="${title} poster">
        </div>

        <div>
            <h1 class="basic-details__title">${title}</h1>
            <div class="basic-details__info">
                <p class="basic-details__year">${year}</p>
                <p class="basic-details__rating">
                    ${adult ? "R" : "PG-13"}
                </p>
                <p class="basic-details__popularity">
                    ${popularity}
                </p>
            </div>
        </div>

        <div>
            <h2>Overview</h2>
            <p class="basic-details__overview">${overview}</p>
        </div>
        `;
    },

    fetchFavouriteMovie: async (movieID) => {
        console.log("FAVOURITING MOVIE");

        const response = await fetch(`${APP.BASE_URL}/${movieID}`);
        const { data } = await response.json();
        console.log("Favourites data", data);

        const cache = await caches.open(APP.favouritesCacheName);
        await cache.put(
            data.id,
            new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                },
            })
        );
    },

    displayFavouriteMovies: async () => {
        console.log("DISPLAYING FAVOURITE MOVIES");

        const cache = await caches.open(APP.favouritesCacheName);
        const keys = await cache.keys();

        const movies = await Promise.all(
            keys.map(async (key) => {
                const resp = await cache.match(key);
                return await resp.json();
            })
        );

        const favouritesResults = document.getElementById("favourite-results");

        APP.displayMovies(favouritesResults, movies);
    },

    displayCachedMovies: async (keyword, sort) => {
        const cache = await caches.open(APP.movieCacheName);
        const keys = await cache.keys();

        const movies = await Promise.all(
            keys.map(async (key) => {
                const resp = await cache.match(key);
                return await resp.json();
            })
        );

        console.log("keyword:", keyword);
        console.log("sort:", sort);
        console.log(movies);

        const filteredMovies = movies.filter(({ data }) => {
            return data.title.toLowerCase().includes(keyword.toLowerCase());
        });

        const filteredMoviesArray = filteredMovies.map((filteredMovie) => {
            return filteredMovie.data;
        });

        switch (sort) {
            case "release-date":
                filteredMoviesArray.sort((a, b) => b.popularity - a.popularity);
                break;

            case "popularity":
                filteredMoviesArray.sort(
                    (a, b) => b.release_date - a.release_date
                );
                break;

            case "vote":
                filteredMoviesArray.sort(
                    (a, b) => b.vote_average - a.vote_average
                );
                break;
        }

        const cacheResults = document.getElementById("cache-results");
        APP.displayMovies(cacheResults, filteredMoviesArray);
    },
};

window.addEventListener("DOMContentLoaded", APP.init);
