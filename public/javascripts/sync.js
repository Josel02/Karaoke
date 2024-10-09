let lyricsArray = [];
let timestamps = [];
let currentLineIndex = 0;

document.getElementById('syncButton').addEventListener('click', () => {
    const lyricsText = document.getElementById('lyrics').value;
    lyricsArray = lyricsText.split('\n');
    
    // Mostrar la lista de letras
    const lyricsList = document.getElementById('lyricsList');
    lyricsList.innerHTML = ''; // Limpiar lista anterior
    lyricsArray.forEach((line, index) => {
        const li = document.createElement('li');
        li.id = `line-${index}`;
        li.textContent = line;
        lyricsList.appendChild(li);
    });

    // Cargar la base musical
    const audioFile = document.getElementById('audioFile').files[0];
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = URL.createObjectURL(audioFile);
    audioPlayer.load();

    // Mostrar la sección de sincronización
    document.getElementById('syncSection').style.display = 'block';
});

document.getElementById('markButton').addEventListener('click', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const currentTime = audioPlayer.currentTime;
    
    if (currentLineIndex < lyricsArray.length) {
        timestamps.push({ line: lyricsArray[currentLineIndex], time: currentTime });
        document.getElementById(`line-${currentLineIndex}`).classList.add('marked');
        currentLineIndex++;
    }
    
    if (currentLineIndex === lyricsArray.length) {
        console.log('Sincronización completa:', timestamps);
        // Enviar datos al servidor (opcional)
        fetch('/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lyrics: lyricsArray, timestamps }),
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
