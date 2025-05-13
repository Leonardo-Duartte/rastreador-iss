// Constantes de configuração
const MAP_ZOOM_LEVEL = 3; // Nível de zoom inicial do mapa
const UPDATE_INTERVAL_MS = 5000; // Intervalo de atualização em milissegundos (5 segundos)
const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544'; // API para dados da ISS

// Inicializa o mapa Leaflet e define a visualização inicial (centro e zoom)
const map = L.map('issMap').setView([0, 0], MAP_ZOOM_LEVEL);

// Adiciona a camada de tiles (o mapa base) do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Tenta carregar um ícone personalizado para a ISS
// Se 'iss_icon.png' não estiver na pasta, usará o ícone padrão do Leaflet
let issIcon;
try {
    // Certifique-se de que 'iss_icon.png' está na mesma pasta que este script
    // ou forneça o caminho correto.
    issIcon = L.icon({
        iconUrl: 'iss_icon.png', // Caminho para o seu ícone
        iconSize: [50, 32],      // Tamanho do ícone [largura, altura] em pixels
        iconAnchor: [25, 16]     // Ponto do ícone que corresponderá à localização (metade da largura, metade da altura)
    });
} catch (e) {
    console.warn("Ícone da ISS (iss_icon.png) não encontrado ou erro ao carregar. Usando marcador padrão.");
    // Se não houver ícone personalizado, ou se houver erro, usa o ícone padrão do Leaflet
    issIcon = L.Icon.Default ? new L.Icon.Default() : L.marker([0,0]).options.icon;
}


// Adiciona um marcador para a ISS no mapa.
// A posição [0,0] é temporária até a primeira chamada da API.
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map)
    .bindPopup("<b>Estação Espacial Internacional (ISS)</b>") // Texto que aparece ao clicar no marcador
    .openPopup(); // Abre o popup inicialmente

// Pega as referências dos elementos HTML onde as informações serão exibidas
const latDisplay = document.getElementById('lat');
const lonDisplay = document.getElementById('lon');
const velDisplay = document.getElementById('vel');
const altDisplay = document.getElementById('alt');

let firstLoad = true; // Flag para centralizar o mapa apenas na primeira carga

// Função assíncrona para buscar os dados da ISS
async function getISSData() {
    try {
        const response = await fetch(ISS_API_URL);
        if (!response.ok) {
            // Se a resposta da API não for bem-sucedida, lança um erro
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }
        const data = await response.json(); // Converte a resposta para JSON

        // Extrai os dados de latitude, longitude, velocidade e altitude
        const latitude = data.latitude;
        const longitude = data.longitude;
        const velocity = data.velocity; // em km/h
        const altitude = data.altitude; // em km

        // Atualiza a posição do marcador no mapa
        marker.setLatLng([latitude, longitude]);

        // Se for a primeira vez que os dados são carregados, centraliza o mapa na ISS
        if (firstLoad) {
            map.setView([latitude, longitude], MAP_ZOOM_LEVEL);
            firstLoad = false;
        }
        // Para manter o mapa sempre centralizado na ISS a cada atualização (opcional):
        // map.setView([latitude, longitude]);

        // Atualiza os textos na tela com as novas informações
        latDisplay.textContent = latitude.toFixed(4); // Formata para 4 casas decimais
        lonDisplay.textContent = longitude.toFixed(4);
        velDisplay.textContent = velocity.toFixed(2); // Formata para 2 casas decimais
        altDisplay.textContent = altitude.toFixed(2);

    } catch (error) {
        // Em caso de erro na busca dos dados, exibe uma mensagem no console e na tela
        console.error("Erro ao buscar dados da ISS:", error);
        latDisplay.textContent = "Erro";
        lonDisplay.textContent = "Erro";
        velDisplay.textContent = "Erro";
        altDisplay.textContent = "Erro";
    }
}

// Chama a função para buscar os dados da ISS assim que a página carrega
getISSData();

// Define um intervalo para chamar a função getISSData periodicamente
setInterval(getISSData, UPDATE_INTERVAL_MS);