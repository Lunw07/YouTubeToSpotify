let urlForm = document.getElementById("urlForm");
const input = document.getElementById("yt-url");

const testURL = "https://www.youtube.com/watch?v=DX7HyN7oJjE&list=PL0IIWRV1LEYJ4cz8r4ItYvC6ijwYk0Ijz&pp=sAgC"

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function isYoutubeURL(url){
    try {
        const hostname = new URL(url).hostname;
        return hostname.includes("youtube");
    } catch {
        return false;
    }
}

function getPlaylistID(url) {
    try {
        const parsed = new URL(url);
        const params = parsed.searchParams;     // maps the thing before = to the thing after =
        const id = params.get("list");          // gets the ID. Every playlist has list=

        //console.log(id);
        return id;
    }
    catch{
        return null;
    }
}

function validatePlaylistID(id){
    if (typeof id === "string" && /^[a-zA-Z0-9_-]{10,60}$/.test(id)){   // checks if the id is a string, also only allows between 10 - 60 chars
        return true;
    }
    else{
        return false;
    }
}

urlForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ytUrl = input.value;

    if (isValidURL(ytUrl) == false || isYoutubeURL(ytUrl) == false){
        console.log("Invalid URL");
        return;
    }

    const id = getPlaylistID(ytUrl);

    if (!id || !validatePlaylistID(id)) {
        console.log("Invalid playlist URL");
        return;
    }

    console.log("Playlist ID:", id);

});
