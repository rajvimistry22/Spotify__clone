const accessToken = 'BQB1RuPItXCopID_aAAy3_qNXf9SWLtZb-0ymaZ5h8640PBYxC9lQGVIh1HgpcGaDOJ_8XcMcRttQotVsrdSHjRUZW3gztNXYnZxAlQkdeUpWoQJXp_NyB8_VhhTeLpPfSPAAZr4e7t94Q6iDOUUjn33T-5TcH6OSeR9qm38CC1cC2Y83sWt4GUE0OMWI19Rupv93wHDcold73Px2wyxPxxOI5_KCC_8tes6ApsSY7zLzjzGvCcQ-0C-ozAVqXlloVOhtF5Q-A4gBp9LU24ylGTaQbCldFuDFPcbYZzLPTAtfjTZG6j7Husw2SkTYIjQFicJ3VTKdkVFoSeZgX5f7Gpt2ciq5hmFJhgypsxSa7RZ2vwXOgQCfi1L2F41xnc';
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');
const resultsDiv = document.getElementById('results');
let timeout = null;

    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        const query = searchInput.value.trim();
        if (query.length === 0) {
            suggestionsBox.innerHTML = '';
            return;
        }

        // Wait 300ms after last keystroke before calling API
        timeout = setTimeout(() => fetchSuggestions(query), 300);
        });

        function fetchSuggestions(query) {
        fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=10`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(data => {
            suggestionsBox.innerHTML = '';

            const suggestions = [];

            if (data.tracks?.items.length) {
            data.tracks.items.forEach(track => {
                suggestions.push({
                type: 'track',
                label: `${track.name} – ${track.artists.map(a => a.name).join(', ')}`,
                id: track.id
                });
            });
            }

            if (data.artists?.items.length) {
            data.artists.items.forEach(artist => {
                suggestions.push({
                type: 'artist',
                label: artist.name,
                id: artist.id
                });
            });
            }

            suggestions.forEach(s => {
            const div = document.createElement('div');
            div.className = 'suggestion';
            div.textContent = s.label;
            div.onclick = () => {
                searchInput.value = s.label;
                suggestionsBox.innerHTML = '';
                showDetailedResults(query);
            };
            suggestionsBox.appendChild(div);
            });
        });
        }

        function showDetailedResults(query) {
        fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=5`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(data => {
            resultsDiv.innerHTML = '';

            if (data.tracks?.items.length) {
            resultsDiv.innerHTML += '<h3>Tracks</h3>';
            data.tracks.items.forEach(track => {
                resultsDiv.innerHTML += `<div class="result">${track.name} by ${track.artists.map(a => a.name).join(', ')}</div>`;
            });
            }

            if (data.albums?.items.length) {
            resultsDiv.innerHTML += '<h3>Albums</h3>';
            data.albums.items.forEach(album => {
                resultsDiv.innerHTML += `<div class="result">${album.name} by ${album.artists.map(a => a.name).join(', ')}</div>`;
            });
            }

            if (data.artists?.items.length) {
            resultsDiv.innerHTML += '<h3>Artists</h3>';
            data.artists.items.forEach(artist => {
                resultsDiv.innerHTML += `<div class="result">${artist.name}</div>`;
            });
            }
        });
        }