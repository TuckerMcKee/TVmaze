"use strict";
//selecting dom elements with jquery
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

 //returns an array of objects containing show objects
async function getShowsByTerm(term) {
  let response = await axios.get("http://api.tvmaze.com/search/shows", {
    params: { q: term },
  });
  return response.data;
}

// takes array of objects containing show objects and creates html display
async function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    //checking for missing images and using default image if no image
    let imgURL = "https://tinyurl.com/tv-missing";
    if (show.show.image !== null) {
      imgURL = show.show.image.medium;
    }
    const $show = $(
      `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${imgURL}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  await populateShows(shows);
}

// event listener for submit button
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  // adding event listener to episode btns
  $(".Show-getEpisodes").each(function () {
    //toggles diplay of episode lists
    $(this).on("click", async function () {
      let episodes = await getEpisodesOfShow($(this).parent().parent().parent().attr("data-show-id"));
      if (episodes[0].name === $("#episodesList li:first").text()) {
        $episodesArea.hide();
      }
      else {
        $episodesList.html("");
        populateEpisodes(episodes);
        $episodesArea.show();
      }
    });
  });
});

// returns an array of episode objects
async function getEpisodesOfShow(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return response.data;
}

// function populateEpisodes(episodes) { }
function populateEpisodes(episodes) {
  for (let episode of episodes) {
    let $newLI = $("<li/>");
    $newLI.text(episode.name);
    $episodesList.append($newLI);
  }
}
