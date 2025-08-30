document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento de elementos do DOM
    const timezoneSelect = document.getElementById('timezone-select');
    const clockDiv = document.getElementById('clock');
    const timezoneLabel = document.getElementById('selected-timezone-label');
    const utcOffset = document.getElementById('utc-offset');
    const currentYearSpan = document.getElementById('current-year');

    // Variáveis globais
    let clockInterval;
    const API_BASE_URL = "https://worldtimeapi.org/api";

    /**
     * Função principal que inicializa a aplicação.
     * Busca a lista de fusos, detecta o fuso do usuário via IP e inicia o relógio.
     */
    async function initialize() {
        try {
            // Busca a lista de todos os fusos horários
            const timezonesResponse = await fetch(`${API_BASE_URL}/timezone`);
            const timezones = await timezonesResponse.json();
            
            timezoneSelect.innerHTML = '';
            timezones.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz;
                option.textContent = tz.replace(/_/g, ' ');
                timezoneSelect.appendChild(option);
            });

            // Detecta o fuso horário do usuário e define como padrão
            const userTimezoneResponse = await fetch(`${API_BASE_URL}/ip`);
            const userData = await userTimezoneResponse.json();
            timezoneSelect.value = userData.timezone;

            // Inicia o relógio com o fuso horário detectado
            await handleTimezoneChange();

        } catch (error) {
            console.error("Erro na inicialização:", error);
            clockDiv.textContent = "Erro!";
            timezoneLabel.textContent = "Não foi possível carregar a aplicação.";
        }
    }

    /**
     * Busca os dados de tempo para um fuso horário específico e inicia o relógio.
     * Esta função é chamada na inicialização e a cada mudança no seletor.
     */
    async function handleTimezoneChange() {
        const selectedTimezone = timezoneSelect.value;
        clearInterval(clockInterval);

        if (!selectedTimezone) return;

        clockDiv.textContent = "Buscando...";
        try {
            const response = await fetch(`${API_BASE_URL}/timezone/${selectedTimezone}`);
            const data = await response.json();

            timezoneLabel.textContent = data.timezone.replace(/_/g, ' ');
            utcOffset.textContent = `UTC ${data.utc_offset}`;

            // Cria um objeto Date com a hora exata do servidor.
            let serverTime = new Date(data.datetime.substring(0, 19));

            // Inicia um loop local para atualizar o relógio a cada segundo.
            clockInterval = setInterval(() => {
                serverTime.setSeconds(serverTime.getSeconds() + 1);
                
                const hours = String(serverTime.getHours()).padStart(2, '0');
                const minutes = String(serverTime.getMinutes()).padStart(2, '0');
                const seconds = String(serverTime.getSeconds()).padStart(2, '0');
                
                clockDiv.textContent = `${hours}:${minutes}:${seconds}`;
            }, 1000);

        } catch (error) {
            console.error("Falha ao buscar dados da API:", error);
            clockDiv.textContent = "Erro!";
        }
    }

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    initialize();
    currentYearSpan.textContent = new Date().getFullYear();
    timezoneSelect.addEventListener('change', handleTimezoneChange);
});