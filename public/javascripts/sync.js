document.addEventListener('DOMContentLoaded', () => {
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
  const playButton = document.getElementById('playButton');
  const pauseButton = document.getElementById('pauseButton');
  const syncSection = document.getElementById('syncSection');

  // Inicializar Wavesurfer.js
  let waveSurfer;

  function initWaveSurfer(audioUrl) {
    // Destruir instancia previa de Wavesurfer si existe
    if (waveSurfer) {
      waveSurfer.destroy();
    }

    // Crear una nueva instancia de Wavesurfer
    waveSurfer = WaveSurfer.create({
      container: '#waveform', // Contenedor para el visualizador
      waveColor: '#d9dcff', // Color de la onda
      progressColor: '#4353ff', // Color del progreso
      height: 150, // Altura del visualizador
      responsive: true, // Adaptable al tamaño de pantalla
      backend: 'MediaElement', // Usar el reproductor HTML5
    });

    // Cargar el audio en Wavesurfer
    waveSurfer.load(audioUrl);

    // Evento cuando Wavesurfer está listo
    waveSurfer.on('ready', () => {
      console.log('Wavesurfer listo para reproducir.');
    });

    // Evento de error en Wavesurfer
    waveSurfer.on('error', (err) => {
      console.error('Error en Wavesurfer:', err);
    });
  }

  // Inicializar la sincronización al hacer clic en el botón "Iniciar Sincronización"
  syncButton.addEventListener('click', () => {
    const projectName = projectNameInput.value.trim();
    const lyricsText = lyricsInput.value.trim();
    const audioFile = audioFileInput.files[0];

    // Validar entradas
    if (!projectName) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta el nombre del proyecto',
        text: 'Por favor, ingrese un nombre para el proyecto.',
      });
      return;
    }

    if (!lyricsText) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan letras',
        text: 'Por favor, ingrese la letra.',
      });
      return;
    }

    if (!audioFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo no cargado',
        text: 'Por favor, cargue una base musical.',
      });
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

    // Cargar la base musical en Wavesurfer.js
    const audioUrl = URL.createObjectURL(audioFile);
    initWaveSurfer(audioUrl);

    // Mostrar la sección de sincronización
    syncSection.style.display = 'block';

    // Inicializar variables de sincronización
    timestamps = [];
    currentLineIndex = 0;
    isSyncing = false;
  });

  // Manejar el botón "Play"
  playButton.addEventListener('click', () => {
    if (waveSurfer) {
      waveSurfer.playPause(); // Alternar entre reproducir y pausar
      isSyncing = true;
      console.log('Play o pausa activado.');
    }
  });

  // Manejar el botón "Pause"
  pauseButton.addEventListener('click', () => {
    if (waveSurfer) {
      waveSurfer.pause();
      isSyncing = false;
      console.log('Reproducción pausada.');
    }
  });

  // Prevenir cambios en la posición de reproducción
  waveSurfer?.on('audioprocess', () => {
    if (isSyncing && currentLineIndex > 0) {
      const lastTimestamp = timestamps[currentLineIndex - 1]?.time;
      if (lastTimestamp && waveSurfer.getCurrentTime() < lastTimestamp) {
        waveSurfer.seekTo(lastTimestamp / waveSurfer.getDuration());
      }
    }
  });

  // Manejar el botón "Marcar Tiempo"
  markButton.addEventListener('click', () => {
    if (!isSyncing) {
      Swal.fire({
        icon: 'warning',
        title: 'Audio no reproduciéndose',
        text: 'Debe reproducir el audio para marcar tiempos.',
      });
      return;
    }

    const currentTime = waveSurfer.getCurrentTime();

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
      }).then((response) => {
        if (!response.ok) {
          return response.text().then((message) => {
            throw new Error(message);
          });
        }
        return response.text();
      }).then((result) => {
        console.log(result);
        Swal.fire({
            icon: 'success',
            title: '¡Sincronización completada!',
            text: 'Archivo SRT generado correctamente.',
        }).then(() => {
            window.location.href = '/projects';
        });
      }).catch((error) => {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: error.message,
        }).then(() => {
          window.location.href = '/create';
        });
      });
    }
  });

  // Manejar el botón "Reiniciar Sincronización"
  resetButton.addEventListener('click', () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto reiniciará toda la sincronización.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reiniciar',
    }).then((result) => {
      if (result.isConfirmed) {
        timestamps = [];
        currentLineIndex = 0;
        isSyncing = false;

        // Resetear la interfaz
        const markedLines = document.querySelectorAll('.marked');
        markedLines.forEach((line) => line.classList.remove('marked'));

        // Resetear Wavesurfer
        if (waveSurfer) {
          waveSurfer.stop();
        }

        Swal.fire('Reiniciado', 'La sincronización ha sido reiniciada.', 'success');
      }
    });
  });

});