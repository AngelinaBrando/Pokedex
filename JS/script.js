let allPokemon = []; 
let pokemonDataCache = [];

function init() {
    fetchData();
    document.getElementById("pokemon-modal").addEventListener("click", closeModal);
}

document.addEventListener("DOMContentLoaded", init);

function showLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "flex";
}

function hideLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "none";
}


//Abrufen Pokemon-Daten von API
async function fetchData() {
    try {
        showLoadingSpinner(); // Spinner anzeigen
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50');
        const data = await response.json();

        const promises = data.results.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
        );

        const pokemonList = await Promise.all(promises);
        allPokemon = pokemonList.map(pokemon => pokemon.name);
        pokemonDataCache = pokemonList;
        renderPokemonCards(pokemonList);
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
    } finally {
        hideLoadingSpinner(); // Spinner ausblenden, sobald alles fertig ist
    }
}

function renderPokemonCards(pokemonList) {
    const container = document.getElementById("pokemon-container");
    container.innerHTML = "";
    
    pokemonList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        container.appendChild(card);
    });
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


function searchPokemon() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const suggestionsBox = document.getElementById("suggestions");

    if (query.length < 3) {
        suggestionsBox.style.display = "none";
        return;
    }

    const matches = allPokemon.filter(name => name.includes(query)).slice(0, 5);
    suggestionsBox.innerHTML = matches.map(name => 
        `<div class="suggestion-item" onclick="selectPokemon('${name}')">${name}</div>`
    ).join("");

    suggestionsBox.style.display = matches.length ? "block" : "none";
}


function filterPokemon() {
    const input = document.getElementById("search-input").value.toLowerCase();
    const suggestionsContainer = document.getElementById("suggestions");

   if (input.length < 3) {
        suggestionsContainer.style.display = "none";
        return;} // Falls weniger als 3 Buchstaben eingegeben wurden, Liste ausblenden

    const filteredPokemon = allPokemon.filter(name => name.includes(input)); // Filtert Pokémon, die mit der Eingabe übereinstimmen
    if (filteredPokemon.length === 0) {
        suggestionsContainer.style.display = "none";
        return;}  // Falls keine Übereinstimmung, Liste ausblenden
    
    suggestionsContainer.innerHTML = filteredPokemon
        .map(name => `<div class="suggestion" onclick="selectPokemon('${name}')">${name}</div>`)
        .join("");    // Generiert Vorschläge

    suggestionsContainer.style.display = "block";
}


function selectPokemon(name) {
    const pokemon = pokemonDataCache.find(p => p.name === name);
    if (pokemon) {
        openModal(name);
    }
 // Eingabefeld leeren und Vorschläge ausblenden
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
    setTimeout(() => modal.style.opacity = "1", 10); //Verzögerte Animation für sanftes Einblenden
}


function closeModal(event) {
    const modal = document.getElementById("pokemon-modal");
    
    // Nur schließen, wenn außerhalb des Modal-Inhalts geklickt wird
    if (event && event.target !== modal && !modal.contains(event.target)) return;

    //fade-out-Animation starten
    modal.style.opacity = "0";

    //Nach der Animation das Modal ausblenden
    setTimeout(() => {
         modal.style.display = "none";  
    }, 300); //DAuer der Animation (300ms)
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

    if (searchInput.style.display === "none" || searchInput.style.display === "") {
        searchInput.style.display = "block";
        searchInput.classList.add("search-overlay");
        searchInput.focus();
    } else {
        searchInput.style.display = "none";
        searchInput.classList.remove("search-overlay");
    }
}