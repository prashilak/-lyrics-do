import GetService from "./GetService.js";
const BaseUrl = "https://api.lyrics.ovh/suggest/";
const LyricUrl = "https://api.lyrics.ovh/v1";

const logo = document.querySelector(".logo");
const loader = document.querySelector(".loadersmall");
const inputSearch = document.querySelector("#inputSearch");
const inputSearchMb = document.querySelector("#inputSearchMb");
const btnSearch = document.querySelector("#btnSearch");
const btnSearchMb = document.querySelector("#btnSearchMb");
const songList = document.querySelector("#songList");
const paginationPrev = document.querySelector(".btn-prev");
const paginationNext = document.querySelector(".btn-next");

let list = [];

const handlePagination = async (responce) => {
  console.log(responce);
  paginationNext.setAttribute("style", "display:none");
  paginationPrev.setAttribute("style", "display:none");
  if (responce.next) {
    console.log(responce.next);
    paginationNext.setAttribute("style", "display:block");
  }
  if (responce.prev) {
    console.log(responce.prev);
    paginationPrev.setAttribute("style", "display:block");
  }
  document
    .querySelector(".btn-next")
    .addEventListener("click", async (event) => {
      console.log("next click");
      loader.setAttribute("style", "display:block");
      let next = await GetService(
        `https://cors-anywhere.herokuapp.com/${responce.next}`
      );
      list = renderSongList(next.data);
      songList.innerHTML = list;
      hadleLyrics(next.data);
      handlePagination(next);
      loader.setAttribute("style", "display:none");
    });

  document
    .querySelector(".btn-prev")
    .addEventListener("click", async (event) => {
      loader.setAttribute("style", "display:block");
      let prev = await GetService(
        `https://cors-anywhere.herokuapp.com/${responce.prev}`
      );
      console.log("prev click");
      list = renderSongList(prev.data);
      songList.innerHTML = list;
      hadleLyrics(prev.data);
      handlePagination(prev);
      loader.setAttribute("style", "display:none");
    });
};

const handlePlay = () => {
  var duration = document.querySelector("#player").duration;
  var current_time = document.querySelector("#player").currentTime;
  console.log("duration", duration);
  console.log("current_time", current_time);
  document
    .querySelector(".btn-play")
    .addEventListener("click", async (event) => {
      document.querySelector("#player").play();
      document
        .querySelector(".btn-pause")
        .setAttribute("style", "display:block");
      document.querySelector(".btn-play").setAttribute("style", "display:none");
    });
  document
    .querySelector(".btn-pause")
    .addEventListener("click", async (event) => {
      document.querySelector("#player").pause();
      document
        .querySelector(".btn-pause")
        .setAttribute("style", "display:none");
      document
        .querySelector(".btn-play")
        .setAttribute("style", "display:block");
    });
};

const handleRenderLyrics = (lyrics, image, title, artist, preview) => {
  songList.innerHTML = "";
  songList.innerHTML = `
    <div class="lyric-page">
    <div class="imgwrapper-lyrics">
        <img class="img-cover" src="${image}">
        <span class="song-title text-primary text-center"> ${title} </span>
        <span class="artist-name text-gry text-center">${artist}</span>
        <audio id="player" controls>
            <source src=${preview} type="audio/mpeg">
         </audio>
         <div id="playcontrol"> </div>
        <button  class="btn-play"><i class="fa fa-play"></i></button>
        <button class="btn-pause"><i class="fa fa-pause"></i></button>
    </div>
    <pre class="lyrics">${lyrics ? lyrics : "lyrics not found ..."}</pre>
    </div>
    `;
  document.querySelector(".btn-pause").setAttribute("style", "display:none");
  document.querySelector(".btn-play").setAttribute("style", "display:block");
  handlePlay();
};

const hadleLyrics = (res) => {
  loader.setAttribute("style", "display:block");
  document.querySelectorAll(".songlistwrap").forEach((item) => {
    item.addEventListener("click", async (event) => {
      paginationNext.setAttribute("style", "display:none");
      paginationPrev.setAttribute("style", "display:none");
      const artist = item.querySelector(".artist-name").textContent.trim();
      const title = item.querySelector(".song-title").textContent.trim();
      const image = item.querySelector(".img-cover").src;
      const preview = item.querySelector("#player").src;
      const tempurl =
        LyricUrl +
        "/" +
        artist.split(" ").join("%20") +
        "/" +
        title.split(" ").join("%20");

      let responce = await GetService(tempurl);
      if (responce.lyrics == "") {
        songList.innerHTML = `<p class="lyrics">Lyrics not found!</p>`;
        loader.setAttribute("style", "display:none");
      }
      console.log("preview", preview);
      handleRenderLyrics(responce.lyrics, image, title, artist, preview);
      loader.setAttribute("style", "display:none");
    });
  });
};

const handleSearch = async (defaultlist) => {
  songList.innerHTML = "";
  loader.setAttribute("style", "display:block");
  const inputValue = inputSearch.value || inputSearchMb.value || defaultlist;
  if (!inputValue) {
    alert("Enter something...");
    loader.setAttribute("style", "display:none");
    return;
  }

  let responce = await GetService(BaseUrl, inputValue);
  inputSearch.value = "";
  inputSearchMb.value = "";
  if (responce.total == 0) {
    alert("No match found! try again..");
    loader.setAttribute("style", "display:none");
  } else {
    let res = responce.data;
    console.log(responce);

    list = renderSongList(res);
    songList.innerHTML = list;

    hadleLyrics(res);
    handlePagination(responce);
    loader.setAttribute("style", "display:none");
  }
};

const renderSongList = (res) => {
  return res
    .map((suggestion) => {
      const { title, preview, artist, album } = suggestion;
      return `<div class="songlistwrap">
                <div class="list-wrapp" draggable="true" tabindex="0">                       
                        <div class="song-wrapper">
                                <div class="imgwrapper">
                                    <img class="img-cover" src="${album.cover}">
                                </div>
                                <div class="song-body">
                                  <span class="song-title text-primary"> ${title} </span>
                                    <span class="artist-name text-gry">
                                        ${artist.name}
                                    </span>
                                    <span class="album-name text-gry">
                                        ${album.title}
                                    </span>
                                    <audio id="player" src=${preview}>
                                        <source src=${preview} type="audio/mpeg">
                                    </audio>
                                </div>
                        </div>
                </div>
            </div>`;
    })
    .join("");
};

btnSearch.addEventListener("click", handleSearch);
btnSearchMb.addEventListener("click", handleSearch);
inputSearch.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    handleSearch();
  }
});
inputSearchMb.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    handleSearch();
  }
});

logo.addEventListener("click", () => {
  songList.innerHTML = "";
  handleSearch("dilbar");
});

document.addEventListener("DOMContentLoaded", () => {
  handleSearch("dilbar");
});
