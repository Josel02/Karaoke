let lyricsArray = [];
let timestamps = [];
let currentLineIndex = 0;

document.getElementById('syncButton').addEventListener('click', () => {
    const projectName = document.getElementById('projectName').value;
    const lyricsText = document.getElementById('lyrics').value;

    // Validar que se haya ingresado un nombre de proyecto
    if (!projectName) {
        alert('Por favor, ingrese un nombre para el proyecto.');
        return;
    }

    lyricsArray = lyricsText.split('\n');
    
    // Mostrar la lista de letras en la interfaz
    const lyricsList = document.getElementById('lyricsList');
    lyricsList.innerHTML = ''; // Limpiar lista anterior
    lyricsArray.forEach((line, index) => {
        const li = document.createElement('li');
        li.id = `line-${index}`;
        li.textContent = line;
        lyricsList.appendChild(li);
    });

    // Cargar la base musical en el reproductor de audio
    const audioFile = document.getElementById('audioFile').files[0];
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioFile) {
        audioPlayer.src = URL.createObjectURL(audioFile);
        audioPlayer.load();
    } else {
        alert('Por favor, cargue una base musical.');
        return;
    }

    // Mostrar la sección de sincronización
    document.getElementById('syncSection').style.display = 'block';
});

document.getElementById('markButton').addEventListener('click', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const currentTime = audioPlayer.currentTime;

    if (currentLineIndex < lyricsArray.length) {
        // Registrar el tiempo actual para la línea correspondiente
        timestamps.push({ line: lyricsArray[currentLineIndex], time: currentTime });
        document.getElementById(`line-${currentLineIndex}`).classList.add('marked');
        currentLineIndex++;
    }

    // Enviar los datos al servidor cuando se hayan marcado todas las líneas
    if (currentLineIndex === lyricsArray.length) {
        const projectName = document.getElementById('projectName').value;

        fetch('/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                projectName,
                lyrics: lyricsArray,
                timestamps
            }),
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
            alert('Sincronización completada y archivo SRT generado.');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al generar el archivo SRT.');
        });
    }
});
