# YouTubeToSpotify
# YouTube to Spotify Playlist Converter

A web application that converts a YouTube playlist into a Spotify playlist automatically.

The app takes a YouTube playlist URL, extracts the songs, searches for matching tracks on Spotify, and creates a new Spotify playlist containing those songs.

## Features

- Convert YouTube playlists into Spotify playlists
- Supports public and unlisted YouTube playlists
- Automatically extracts:
  - Artist names
  - Song titles
- Searches Spotify for matching tracks
- Creates a new Spotify playlist
- Adds matched songs automatically
- Uses Spotify OAuth 2.0 with PKCE authentication

## How It Works

### 1. YouTube Playlist Extraction

The user enters a YouTube playlist URL.

The app:
1. Validates the URL
2. Extracts the playlist ID
3. Uses the YouTube Data API to retrieve playlist videos
4. Cleans video titles by removing unnecessary tags such as:
   - `(Official Video)`
   - `[Lyrics]`
   - `(Audio)`
   - `4K`
   
---

### 2. Spotify Authentication

The user logs into Spotify.

The app uses Spotify OAuth with PKCE to:
- Authenticate the user
- Obtain an access token
- Gain permission to modify playlists

Required scopes:
- playlist-modify-public
- playlist-modify-private



### 3. Song Matching

Each extracted song is searched on Spotify.

Example:

YouTube:Coldplay - Yellow

Spotify search: Coldplay Yellow

Result: spotify:track:xxxxxxx

The Spotify track URIs are stored.

---

### 4. Playlist Creation

A new Spotify playlist is created using the YouTube playlist name.

The matched songs are then added to the playlist.

---

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript

### APIs

- YouTube Data API v3
- Spotify Web API

### Authentication

- Spotify OAuth 2.0
- PKCE Flow

---