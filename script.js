let urlForm = document.getElementById("urlForm");
const input = document.getElementById("yt-url");

const API_KEY = "AIzaSyC_-T944hlJbyF5t_nwrWW5LCcTkbfkCGs";

const testURL = "https://www.youtube.com/watch?v=DX7HyN7oJjE&list=PL0IIWRV1LEYJ4cz8r4ItYvC6ijwYk0Ijz&pp=sAgC"
//PL0IIWRV1LEYJ4cz8r4ItYvC6ijwYk0Ijz

const filter = ["(Official Video)", "[Official Video]", "(Official Music Video)", "(Lyrics)", "[Lyrics]", "(Audio)", "[HD]", "4K", "(Visualizer)", "(Live)", "(Remastered)", "(Official Visualizer)"]; 

let titles = [];

// helper functions stuff

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

function validateYoutubePlaylist(ytUrl){

    if (isValidURL(ytUrl) == false || isYoutubeURL(ytUrl) == false){
        console.log("Invalid URL");
        return;
    }

    const id = getPlaylistID(ytUrl);

    if (!id || !validatePlaylistID(id)) {
        console.log("Invalid playlist URL");
        return;
    }

    return id;
}

function cleanTitle(raw, filter){
    for (let i = 0; i < filter.length; i++){
        raw = raw.replaceAll(filter[i], "");
    }

    const title = raw.trim();
    return title;
}

function storeTitle(title){
    let [artist, song] = title.split("-");
    return {"artist": artist?.trim() || "",        // if it doesnt find an artist, use "" instead
        "song": song?.trim() || title
    };

}

// Youtube API------------------------------------------------------------------------------------------------------------------------------------------

async function getYoutubePlaylist(id){

    const playlistItemsUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id}&maxResults=50&key=${API_KEY}`;
    const res = await fetch(playlistItemsUrl);
    const data = await res.json();

    if (!data.items) {
        console.log("Playlist not found");
        return [];
    }

    return data.items;
}

async function getPlaylistName(id){

    const playlistUrl = `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&id=${id}&key=${API_KEY}`;    
    const res = await fetch(playlistUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
        console.log("Playlist name not found");
        return "Youtube Playlist";
    }

    return data.items[0].snippet.title;
}


// Spotify Oauth to get Token ----------------------------------------------------------------------------------------------------------------------------------------

const clientId = "2daccc6066bc41068c6404e16b8600e0";
const redirectUri = "http://127.0.0.1:5500/main.html";

const scopes = [
    "playlist-modify-public",
    "playlist-modify-private"
];

function generateRandomString (length){
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    return crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

document.getElementById("login").addEventListener("click", async () => {

    const verifier = generateRandomString(64);  
    localStorage.setItem("verifier", verifier);

    const hashed = await sha256(verifier);
    const codeChallenge = base64encode(hashed);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    const scope = "playlist-modify-public playlist-modify-private";

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
});


window.addEventListener("load", () => {
    if (window.location.search.length > 0) {
        handleRedirect();
    }
});

function handleRedirect(){
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        exchangeCodeForToken(code);
    }

}

async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('verifier');

    const url = "https://accounts.spotify.com/api/token";
    const payload = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        }),
    }

    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('access_token', response.access_token);
    console.log("TOKEN:", response.access_token);

    // clean URL
    window.history.replaceState({}, document.title, "/main.html");
}

// Search songs on Spotify and make URI list --------------------------------------------------------------------------------------------------

async function findSongsOnSpotify(songs){

    let uris = [];
    const token = localStorage.getItem("access_token");

    const options = {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    };

    for (const {artist, song} of songs){
        const query = `${artist} ${song}`;
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&offset=0`;

        const response = await fetch(url, options);
        const data = await response.json();
        
        uris.push(data.tracks.items[0].uri);             // gets first result
        //console.log(data.tracks.items[0].uri);
    };

    //console.log(uris);
    return uris;
}


// Create the playlist + Add songs --------------------------------------------------------------------------------------------------

async function createPlaylist(name){
    const token = localStorage.getItem("access_token");

    const stuff = {
        method: "POST",
        headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"    
        },
        body: JSON.stringify({
            "name": `${name}`,
            "description": "Created by YoutubeToSpotify",
            "public": false
        })

    };

    const response = await fetch("https://api.spotify.com/v1/me/playlists", stuff);
    const playlist = await response.json();

    //console.log(`spotify_playlist_id = ${playlist.id}`);
    return playlist.id;

}

async function addToPlaylist(playlist_id, spotifyUris){
    const token = localStorage.getItem("access_token");
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/items`;

    console.log("Playlist ID:", playlist_id);
    console.log("URIs received:", spotifyUris);

    const options = {
        method: "POST",
        headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"    
        },
        body: JSON.stringify({
            uris: spotifyUris

        })
    };

    const response = await fetch(url, options);
    const data = await response.json();

    //console.log(data);
}

// Actual Program

urlForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ytUrl = input.value;

    const id = validateYoutubePlaylist(ytUrl);        // validate the URL

    if (!id) {
        console.log("Invalid YouTube playlist");
        return;
    }
 
    const items = await getYoutubePlaylist(id);   
    const name = await getPlaylistName(id);            

    items.forEach(element => {                               // clean up YT titles 
        let raw = element.snippet.title;
        
        const cleaned = cleanTitle(raw, filter);

        const finalTitle = storeTitle(cleaned);

        titles.push(finalTitle);
    });

    //console.log(titles);

    const spotifyUris = await findSongsOnSpotify(titles);           // find songs on spotify

    const spotify_playlist_id = await createPlaylist(name);             // create playlist on spotify

    addToPlaylist(spotify_playlist_id, spotifyUris);                // add songs to playlist

});




