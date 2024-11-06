// public/javascripts/sync.js
let lyricsArray = [];
let timestamps = [];
let currentLineIndex = 0;
let isSyncing = false;

// Referencias a elementos del DOM
const syncButton = document.getElementById('syncButton');
const markButton = document.getElementById('markButton');
const resetButton = document.getElementById('resetButton');
const projectNameInput = document.getElementById('projectName');
const lyricsInput = document.getElementById('lyrics');
const audioFileInput = document.getElementById('audioFile');
const lyricsList = document.getElementById('lyricsList');
const audioPlayer = document.getElementById('audioPlayer');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const syncSection = document.getElementById('syncSection');

// Inicializar la sincronización al hacer clic en el botón "Iniciar Sincronización"
syncButton.addEventListener('click', () => {
    const projectName = projectNameInput.value.trim();
    const lyricsText = lyricsInput.value.trim();
    const audioFile = audioFileInput.files[0];

    // Validar entradas
    if (!projectName) {
        alert('Por favor, ingrese un nombre para el proyecto.');
        return;
    }

    if (!lyricsText) {
        alert('Por favor, ingrese la letra.');
        return;
    }

    if (!audioFile) {
        alert('Por favor, cargue una base musical.');
        return;
    }

    lyricsArray = lyricsText.split('\n');

    // Mostrar la lista de letras en la interfaz
    lyricsList.innerHTML = ''; // Limpiar lista anterior
    lyricsArray.forEach((line, index) => {
        const li = document.createElement('li');
        li.id = `line-${index}`;
        li.textContent = line;
        lyricsList.appendChild(li);
    });

    // Cargar la base musical en el reproductor de audio
    audioPlayer.src = URL.createObjectURL(audioFile);
    audioPlayer.load();

    // Mostrar la sección de sincronización
    syncSection.style.display = 'block';

    // Inicializar variables de sincronización
    timestamps = [];
    currentLineIndex = 0;
    isSyncing = false;
});

// Manejar el botón "Play"
playButton.addEventListener('click', () => {
    audioPlayer.play();
    isSyncing = true;
});

// Manejar el botón "Pause"
pauseButton.addEventListener('click', () => {
    audioPlayer.pause();
    isSyncing = false;
});

// Prevenir cambios en la posición de reproducción
audioPlayer.addEventListener('seeking', () => {
    if (currentLineIndex > 0) {
        const lastTimestamp = timestamps[currentLineIndex - 1].time;
        audioPlayer.currentTime = lastTimestamp;
    } else {
        audioPlayer.currentTime = 0;
    }
});

// Manejar el botón "Marcar Tiempo"
markButton.addEventListener('click', () => {
    if (!isSyncing) {
        alert('Debe reproducir el audio para marcar tiempos.');
        return;
    }

    const currentTime = audioPlayer.currentTime;

    if (currentLineIndex < lyricsArray.length) {
        // Registrar el tiempo actual para la línea correspondiente
        timestamps.push({ line: lyricsArray[currentLineIndex], time: currentTime });
        document.getElementById(`line-${currentLineIndex}`).classList.add('marked');
        currentLineIndex++;
    }

    // Enviar los datos al servidor cuando se hayan marcado todas las líneas
    if (currentLineIndex === lyricsArray.length) {
        const projectName = projectNameInput.value.trim();
        const audioFile = audioFileInput.files[0];

        const formData = new FormData();
        formData.append('projectName', projectName);
        formData.append('lyrics', lyricsArray.join('\n'));
        formData.append('timestamps', JSON.stringify(timestamps));
        formData.append('audioFile', audioFile);

        fetch('/create/sync', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
            alert('Sincronización completada y archivo SRT generado.');
            window.location.href = '/projects';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al generar el archivo SRT.');
        });
    }
});

// Manejar el botón "Reiniciar Sincronización"
resetButton.addEventListener('click', () => {
    // Confirmar con el usuario
    if (!confirm('¿Estás seguro de reiniciar la sincronización? Esto eliminará todos los tiempos marcados.')) {
        return;
    }

    // Resetear variables de sincronización
    timestamps = [];
    currentLineIndex = 0;
    isSyncing = false;

    // Resetear la interfaz
    const markedLines = document.querySelectorAll('.marked');
    markedLines.forEach(line => line.classList.remove('marked'));

    // Resetear el reproductor de audio
    audioPlayer.currentTime = 0;
    audioPlayer.pause();
});
