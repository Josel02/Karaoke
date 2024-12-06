document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFile');
    const processAudioButton = document.getElementById('processAudio');
    const pitchControlContainer = document.getElementById('pitchControlContainer');
    const startRecordingButton = document.getElementById('startRecording');
    const pitchControl = document.getElementById('pitchControl');
    const pitchValue = document.getElementById('pitchValue');
    const playPauseButton = document.getElementById('playPauseAudio');
    const visualizerCanvas = document.querySelector('#visualizer');

    let audioContext;
    let audioBuffer;
    let sourceNode;
    let destinationNode;
    let mediaRecorder;
    let recordedChunks = [];
    let originalFileName = ''; // Variable para guardar el nombre original del archivo
    let playbackRate = 1; // Valor inicial del tono
    let isDownloaded = false; // Nueva bandera para controlar las descargas
    let waveSurfer;

    const initializeWaveSurfer = () => {
        waveSurfer = WaveSurfer.create({
            container: visualizerCanvas,
            waveColor: '#d9dcff',
            progressColor: '#4353ff',
            height: 100,
            responsive: true,
            cursorWidth: 1,
            cursorColor: '#4353ff',
            barWidth: 2,
            barHeight: 1,
            barGap: null
        });
    };

    const processAudioFileForWaveSurfer = async (file) => {
        initializeWaveSurfer();

        const fileURL = URL.createObjectURL(file);
        waveSurfer.load(fileURL);

        waveSurfer.on('ready', () => {
            visualizerCanvas.style.display = 'block';
            playPauseButton.style.display = 'inline-block';
        });
    };

    playPauseButton.addEventListener('click', () => {
        if (!waveSurfer) return;

        waveSurfer.playPause();
        playPauseButton.textContent = waveSurfer.isPlaying() ? 'Pausar Audio' : 'Reproducir Audio';
    });

    const stopWaveSurferPlayback = () => {
        if (waveSurfer && waveSurfer.isPlaying()) {
            waveSurfer.stop();
            playPauseButton.textContent = 'Reproducir Audio';
        }
    };

    const initializeAudioContext = async (file) => {
        if (!audioContext) {
            audioContext = new AudioContext();
        }

        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        await processAudioFileForWaveSurfer(file);

        console.log('Audio cargado y decodificado.');
        pitchControlContainer.style.display = 'block';
    };

    const playAndRecord = () => {
        if (!audioContext || !audioBuffer) {
            Swal.fire('Error', 'Por favor, procesa un archivo de audio primero.', 'error');
            return;
        }

        if (isDownloaded) {
            Swal.fire('Atención', 'Ya has descargado el archivo. Revisa tu carpeta de descargas.', 'info');
            return;
        }

        sourceNode = audioContext.createBufferSource();
        destinationNode = audioContext.createMediaStreamDestination();

        sourceNode.buffer = audioBuffer;
        sourceNode.playbackRate.value = playbackRate;

        sourceNode.connect(destinationNode);
        sourceNode.connect(audioContext.destination);

        mediaRecorder = new MediaRecorder(destinationNode.stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `${originalFileName}-modificado.wav`;
            downloadLink.click();

            Swal.fire('Modificación completa', 'El audio cambiado de tono se ha descargado con éxito.', 'success');
            isDownloaded = true; // Marcar que se ha descargado el archivo
        };

        mediaRecorder.start();

        Swal.fire({
            title: 'Procesando...',
            html: `
                <p class="mb-3">No cierres esta página mientras se procesa el audio.</p>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div class="swal2-loader" style="display: flex;"></div>
                    <strong id="progress-value">0%</strong>
                </div>
            `,
            allowOutsideClick: false,
            showConfirmButton: false,
        });

        sourceNode.disconnect(audioContext.destination);
        sourceNode.start();

        const totalDuration = audioBuffer.duration;

        const updateProgress = () => {
            const currentTime = audioContext.currentTime;
            const progress = Math.min((currentTime / totalDuration) * 100, 100);

            const progressValueElement = document.getElementById('progress-value');
            if (progressValueElement) {
                progressValueElement.textContent = `${progress.toFixed(1)}%`; 
            }

            if (progress >= 100) {
                Swal.close();
                mediaRecorder.stop();
            } else {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);
    };

    processAudioButton.addEventListener('click', async () => {
        const file = audioFileInput.files[0];
        if (!file) {
            Swal.fire('Atención', 'Selecciona un archivo de audio.', 'warning');
            return;
        }

        originalFileName = file.name.split('.').slice(0, -1).join('.');
        await initializeAudioContext(file);
    });

    pitchControl.addEventListener('input', () => {
        playbackRate = parseFloat(pitchControl.value);
        pitchValue.textContent = playbackRate.toFixed(1);

        if (waveSurfer) {
            waveSurfer.setPlaybackRate(playbackRate);
        }

        startRecordingButton.disabled = false;
    });

    startRecordingButton.addEventListener('click', () => {
        stopWaveSurferPlayback();
        playAndRecord();
    });
});
