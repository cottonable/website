// ListenBrainz API Integration
const LISTENBRAINZ_API_PLAYING = 'https://api.listenbrainz.org/1/user/cottonable/playing-now';
const LISTENBRAINZ_API_LISTENS = 'https://api.listenbrainz.org/1/user/cottonable/listens';
const COVER_ART_API = 'https://coverartarchive.org/release/';

async function fetchNowPlaying() {
    try {
        // First, check if something is currently playing
        const playingResponse = await fetch(LISTENBRAINZ_API_PLAYING);
        if (playingResponse.ok) {
            const playingData = await playingResponse.json();

            if (playingData.payload && playingData.payload.listens && playingData.payload.listens.length > 0) {
                // Something is currently playing!
                updateWidget(playingData.payload.listens[0], true);
                return;
            }
        }

        // Nothing playing, get the last played track
        const listensResponse = await fetch(LISTENBRAINZ_API_LISTENS);
        if (!listensResponse.ok) {
            throw new Error('Failed to fetch ListenBrainz data');
        }

        const listensData = await listensResponse.json();

        if (listensData.payload && listensData.payload.listens && listensData.payload.listens.length > 0) {
            const latestListen = listensData.payload.listens[0];
            updateWidget(latestListen, false);
        } else {
            hideWidget();
        }
    } catch (error) {
        // Silent fail for widget
        hideWidget();
    }
}

function updateWidget(listen, isPlaying) {
    const widget = document.getElementById('now-playing-widget');
    const trackName = document.getElementById('track-name');
    const artistName = document.getElementById('artist-name');
    const playingStatus = document.getElementById('playing-status');
    const playingIndicator = document.getElementById('playing-indicator');
    const playingIndicatorPing = document.getElementById('playing-indicator-ping');
    const albumArt = document.getElementById('album-art');
    const albumArtPlaceholder = document.getElementById('album-art-placeholder');
    const albumArtLoading = document.getElementById('album-art-loading');
    const albumArtLink = document.getElementById('album-art-link');

    const metadata = listen.track_metadata;
    const track = metadata.track_name || 'Unknown Track';
    const artist = metadata.artist_name || 'Unknown Artist';

    // Update text content
    trackName.textContent = track;
    artistName.textContent = artist;

    // Set album art link to ListenBrainz user page
    albumArtLink.href = `https://listenbrainz.org/user/cottonable/`;

    // Update status based on whether it's currently playing
    if (isPlaying) {
        playingStatus.textContent = 'Now Playing';
        playingIndicator.classList.remove('bg-slate-500');
        playingIndicator.classList.add('bg-green-500');
        playingIndicatorPing.classList.remove('hidden');
    } else {
        // Calculate time ago
        const listenedAt = listen.listened_at;
        const timeAgo = getTimeAgo(listenedAt);
        playingStatus.textContent = `Last Played • ${timeAgo}`;
        playingIndicator.classList.remove('bg-green-500');
        playingIndicator.classList.add('bg-slate-500');
        playingIndicatorPing.classList.add('hidden');
    }

    // Try to fetch album art
    // Check multiple possible locations for the release ID
    let releaseId = null;

    if (metadata.mbid_mapping && metadata.mbid_mapping.caa_release_mbid) {
        releaseId = metadata.mbid_mapping.caa_release_mbid;
    } else if (metadata.additional_info && metadata.additional_info.release_mbid) {
        releaseId = metadata.additional_info.release_mbid;
    }

    if (releaseId) {
        // Show loading spinner
        albumArtPlaceholder.classList.add('hidden');
        albumArtLoading.classList.remove('hidden');
        albumArt.classList.add('hidden');

        fetchAlbumArt(releaseId, albumArt, albumArtPlaceholder, albumArtLoading);
    } else {
        // No album art available, show placeholder
        albumArt.classList.add('hidden');
        albumArtLoading.classList.add('hidden');
        albumArtPlaceholder.classList.remove('hidden');
    }

    // Show the widget
    widget.classList.remove('hidden');
}

function getTimeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const secondsAgo = now - timestamp;

    if (secondsAgo < 60) {
        return 'just now';
    } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        return `${minutes}m ago`;
    } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours}h ago`;
    } else if (secondsAgo < 604800) {
        const days = Math.floor(secondsAgo / 86400);
        return `${days}d ago`;
    } else {
        const weeks = Math.floor(secondsAgo / 604800);
        return `${weeks}w ago`;
    }
}

async function fetchAlbumArt(releaseId, albumArtElement, placeholderElement, loadingElement) {
    try {
        const response = await fetch(`${COVER_ART_API}${releaseId}`);
        if (!response.ok) {
            throw new Error('Album art not available');
        }

        const data = await response.json();
        if (data.images && data.images.length > 0) {
            // Use 250px thumbnail for 64x64 display (looks crisp when scaled down)
            const imageUrl = data.images[0].thumbnails?.['250'] || data.images[0].thumbnails?.small || data.images[0].image;
            albumArtElement.src = imageUrl;
            albumArtElement.classList.remove('hidden');
            placeholderElement.classList.add('hidden');
            loadingElement.classList.add('hidden');
        }
    } catch (error) {
        // Album art fetch failed, show placeholder and hide loading
        loadingElement.classList.add('hidden');
        placeholderElement.classList.remove('hidden');
    }
}

function hideWidget() {
    const widget = document.getElementById('now-playing-widget');
    if (widget) widget.classList.add('hidden');
}

// Fetch on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchNowPlaying();

    // Refresh every 15 seconds to catch now playing updates
    setInterval(fetchNowPlaying, 15000);
});
