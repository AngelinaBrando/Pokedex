let allPokemon = []; // Namen aller Pokemons
let pokemonDataCache = []; // Alle Daten (Bilder, Typen, Stats etc.)
let loadedPokemonCount = 20; // Startet mit 20 Pokemons
const LOAD_MORE_COUNT = 20; // Immer 20 neue laden
let isLoading = false; // Verhindert mehrfaches Nachladen

function init() {
    fetchData();
    document.getElementById("pokemon-modal").addEventListener("click", closeModal);
    window.addEventListener("scroll", handleScroll);
    document.getElementById("search-input").addEventListener("input", filterPokemon);
}

document.addEventListener("DOMContentLoaded", init);

function showLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "flex";
}

function hideLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "none";
}

async function fetchData() {
    try {
        showLoadingSpinner();
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
        const data = await response.json();

        const promises = data.results.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
        );

        const pokemonList = await Promise.all(promises);
        allPokemon = pokemonList.map(pokemon => pokemon.name);
        pokemonDataCache = pokemonList;
        renderPokemonCards(pokemonList.slice(0, loadedPokemonCount));
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
    } finally {
        hideLoadingSpinner();
    }
}

function renderPokemonCards(pokemonList, append = false) {
    const container = document.getElementById("pokemon-container");

    if (!append) container.innerHTML = ""; // Nur leeren, wenn append = false

    for (let i = 0; i < pokemonList.length; i++) {
        const card = createPokemonCard(pokemonList[i]);
        container.appendChild(card);
    }

    applyTypeColors();
}

function createPokemonCard(pokemon) {
    const card = document.createElement("div");
    card.classList.add("pokemon-card");
    card.style.backgroundColor = getTypeColor(pokemon.types[0].type.name);
    
    card.innerHTML = `
        <h3>#${pokemon.id} ${pokemon.name}</h3>
        <img src="${pokemon.sprites.other["official-artwork"].front_default}" 
        alt="${pokemon.name}" onclick="openModal('${pokemon.name}')">
        <div class="pokemon-types">
            ${getPokemonTypes(pokemon.types)}
        </div>
    `;
    return card;
}

function getPokemonTypes(types) {
    return types.map(type => 
        `<span class="type ${type.type.name}">${type.type.name}</span>`
    ).join("");
}

function applyTypeColors() {
    document.querySelectorAll('.type').forEach(span => {
        const type = span.textContent.trim().toLowerCase();
        const color = getTypeColor(type);
        span.style.backgroundColor = color;
    });
}

function filterPokemon() {
    const query = document.getElementById("search-input").value.toLowerCase();

    // Wenn die Eingabe weniger als 3 Zeichen hat, zeige wieder alle Pokémon-Karten
    if (query.length < 3) {
        renderPokemonCards(pokemonDataCache.slice(0, loadedPokemonCount)); // Alle Pokémon-Karten anzeigen
        return;
    }

    // Filtere Pokémon basierend auf dem Namen
    const filteredPokemon = pokemonDataCache.filter(pokemon => pokemon.name.toLowerCase().startsWith(query));
    renderPokemonCards(filteredPokemon); // Nur die gefilterten Pokémon-Karten anzeigen
}

function selectPokemon(name) {
    openModal(name);
    document.getElementById("search-input").value = "";
    document.getElementById("suggestions").style.display = "none";
}

function openModal(name) {
    const pokemon = pokemonDataCache.find(p => p.name === name);
    if (!pokemon) return;
    
    const modal = document.getElementById("pokemon-modal");
    const modalInfo = document.getElementById("modal-info");

    modalInfo.innerHTML = `
        <h2>${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
        <div class="pokemon-stats">
            ${pokemon.stats.map(stat => createStatBar(stat)).join("")}
        </div>
    `;
    
    modal.style.display = "flex";
    setTimeout(() => modal.style.opacity = "1", 10);
}

function closeModal(event) {
    const modal = document.getElementById("pokemon-modal");
    if (event && event.target !== modal && !modal.contains(event.target)) return;
    modal.style.opacity = "0";
    setTimeout(() => {
         modal.style.display = "none";  
    }, 300);
}

function createStatBar(stat) {
    return `
        <p>${stat.stat.name.toUpperCase()}: ${stat.base_stat}</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width: ${stat.base_stat}%;"></div>
        </div>
    `;
}

function toggleSearch() {
    let searchInput = document.getElementById("search-input");
    searchInput.classList.toggle("search-visible");

    if (searchInput.classList.contains("search-visible")) {
        searchInput.style.opacity = "1";
        searchInput.style.visibility = "visible";
        searchInput.focus();
    } else {
        searchInput.style.opacity = "0";
        searchInput.style.visibility = "hidden";
    }
}

function handleScroll() {
    if (isLoading) return; // Falls schon geladen wird, nichts tun

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        isLoading = true;
        setTimeout(loadMorePokemon, 200); // Verzögert das Nachladen leicht
    }
}

function loadMorePokemon() {
    if (loadedPokemonCount >= pokemonDataCache.length) return; // Falls alle geladen sind, nichts tun

    const newCount = loadedPokemonCount + LOAD_MORE_COUNT;
    renderPokemonCards(pokemonDataCache.slice(loadedPokemonCount, newCount), true); // 🟢 `append = true`
    loadedPokemonCount = newCount;

    isLoading = false; // Ladevorgang beenden
}