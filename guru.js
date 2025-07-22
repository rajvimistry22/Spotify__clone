const CLIENT_ID = "a7456d7b2ee24b51b3889e6bb6403cec";
const CLIENT_SECRET = "a76a7392d8834202bee62b0e0d9aa1a1";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const ARTIST_ID = "5rQoBDKFnd1n6BkdbgVaRL"; // Artist ID for Guru Randhawa
const API_URL = `https://api.spotify.com/v1/artists/${ARTIST_ID}/top-tracks?market=IN`;
let deviceId; // Device ID for Spotify Web Playback SDK
let playerReady = false; // Flag to track if the player is ready

// Helper: Format duration from milliseconds to mm:ss
function formatDuration(durationMs) {
    const durationSeconds = durationMs / 1000;
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Get Spotify Access Token
async function getAccessToken() {
    try {
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: {
                Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Token request failed: ${error.error || response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.message);
        throw error;
    }
}
window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("Spotify Web Playback SDK is ready.");

    const player = new Spotify.Player({
        name: "My Spotify Player",
        getOAuthToken: (cb) => {
            console.log("Fetching OAuth token...");
            cb(accessToken);
        },
    });

    // Error listeners
    player.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
    });
    player.addListener("authentication_error", ({ message }) => {
        console.error("Authentication error:", message);
    });
    player.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
    });
    player.addListener("playback_error", ({ message }) => {
        console.error("Playback error:", message);
    });

    // Ready listener
    player.addListener("ready", ({ device_id }) => {
        console.log("Player is ready with Device ID:", device_id);
        deviceId = device_id;
        playerReady = true;
    });

    // Not ready listener
    player.addListener("not_ready", ({ device_id }) => {
        console.warn("Player is not ready. Device ID:", device_id);
    });

    player.connect().then(success => {
        if (success) {
            console.log("Player connected successfully.");
        } else {
            console.error("Failed to connect player.");
        }
    });
};


// Initialize Spotify Web Playback SDK
function initializeSpotifyPlayer(accessToken) {
    const player = new Spotify.Player({
        name: "My Spotify Player",
        getOAuthToken: (cb) => {
            if (!accessToken) {
                console.error("Access token is not defined!");
                return;
            }
            console.log("Fetching OAuth token...");
            cb(accessToken); // Pass the valid access token
        },
    });

    // Add event listeners for debugging
    player.addListener("ready", ({ device_id }) => {
        console.log("Player is ready with Device ID:", device_id);
        deviceId = device_id;
        playerReady = true;
    });

    player.addListener("not_ready", ({ device_id }) => {
        console.warn("Player is not ready. Device ID:", device_id);
    });

    player.connect().then((success) => {
        if (success) {
            console.log("Player connected successfully.");
        } else {
            console.error("Failed to connect player.");
        }
    });
}


// Play a specific track
async function playTrack(trackUri, accessToken) {
    try {
        if (!playerReady) {
            console.error("Spotify player is not ready. Please wait...");
            alert("Spotify player is not ready. Please wait a moment before playing a song.");
            return;
        }

        // Ensure the deviceId is valid
        if (!deviceId) {
            console.error("Device ID is not available. Cannot play track.");
            return;
        }

        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Play track failed: ${error.error.message || response.statusText}`);
        }

        console.log("Playing track:", trackUri);
    } catch (error) {
        console.error("Error playing track:", error.message);
    }
}


// Fetch artist's top tracks
async function fetchPlaylist() {
    try {
        const accessToken = await getAccessToken();
        initializeSpotifyPlayer(accessToken);

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Top tracks request failed: ${error.error || response.statusText}`);
        }

        const data = await response.json();
        displayPlaylist(data, accessToken);
    } catch (error) {
        console.error("Error fetching playlist:", error.message);
    }
}

// Render the playlist (top tracks) in the DOM
async function displayPlaylist(data, accessToken) {
    const playlistList = document.getElementById("playlist-list");
    playlistList.innerHTML = ""; // Clear previous list

    const tracks = data.tracks; // Directly get the tracks

    for (const [index, track] of tracks.entries()) {
        const listItem = document.createElement("div");
        listItem.classList.add("playlist-item");

        const songNumber = document.createElement("div");
        songNumber.classList.add("song-number");
        songNumber.textContent = index + 1;

        const songImage = document.createElement("img");
        songImage.src = track.album.images[0]?.url || "placeholder.jpg";
        songImage.alt = track.name;
        songImage.classList.add("song-image");

        const songTitle = document.createElement("div");
        songTitle.classList.add("song-title");
        songTitle.textContent = track.name;
        songTitle.addEventListener("click", () => playTrack(track.uri, accessToken)); // Play track on click

        const songAlbum = document.createElement("div");
        songAlbum.classList.add("song-album");
        songAlbum.textContent = track.album.name;

        const songDuration = document.createElement("div");
        songDuration.classList.add("song-duration");
        songDuration.textContent = formatDuration(track.duration_ms);

        listItem.appendChild(songNumber);
        listItem.appendChild(songImage);
        listItem.appendChild(songTitle);
        listItem.appendChild(songAlbum);
        listItem.appendChild(songDuration);

        playlistList.appendChild(listItem);
    }
}

// Initialize app
fetchPlaylist();
