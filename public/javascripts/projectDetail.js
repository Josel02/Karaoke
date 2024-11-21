document.addEventListener('DOMContentLoaded', async () => {
    const recordButton = document.getElementById('recordButton');
    const previewVideo = document.getElementById('previewVideo');
    const canvas = document.getElementById('videoCanvas');
    const context = canvas.getContext('2d');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');

    let audioContext;
    let mediaRecorder;
    let recordedChunks = [];

    const audioPlayer = new Audio(audio); // Ruta del archivo de audio

    const createAudioStream = () => {
        if (!audioContext) {
            audioContext = new AudioContext();
        }
        const source = audioContext.createMediaElementSource(audioPlayer);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        return destination.stream;
    };

    const drawLyrics = (line) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#FFF';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.fillText(line, canvas.width / 2, canvas.height / 2);
    };

    const startRecording = () => {
        const videoStream = canvas.captureStream();
        const audioStream = createAudioStream();
        const combinedStream = new MediaStream([
            ...videoStream.getTracks(),
            ...audioStream.getTracks(),
        ]);

        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp8' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            canvas.style.display = 'none';
            previewVideo.src = url;
            previewVideo.style.display = 'block';
            previewVideo.play();

            // Ocultar barra de progreso
            progressContainer.style.display = 'none';

            // Ocultar el botón de grabar
            recordButton.style.display = 'none';

            const formData = new FormData();
            formData.append('video', blob, `${project.name}.webm`);

            try {
                const response = await fetch(`/projects/uploadVideo/${project.id}`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    alert('Video guardado con éxito.');
                } else {
                    alert('Error al guardar el video.');
                }
            } catch (error) {
                console.error('Error al enviar el video al servidor:', error);
                alert('Error al enviar el video.');
            }
        };

        mediaRecorder.start();

        let currentIndex = 0;
        const totalSteps = timestamps.length; // Total de pasos para sincronizar

        // Mostrar la barra de progreso
        progressContainer.style.display = 'block';

        audioPlayer.play();

        const interval = setInterval(() => {
            if (currentIndex >= timestamps.length) {
                clearInterval(interval);
                mediaRecorder.stop();
                audioPlayer.pause();
                return;
            }

            // Dibujar letras y actualizar progreso
            drawLyrics(lyrics[currentIndex]);
            currentIndex++;

            // Actualizar la barra de progreso
            const progress = (currentIndex / totalSteps) * 100; // Calcular porcentaje
            progressBar.style.width = `${progress}%`;
        }, 2000); // Ajusta la duración por línea
    };

    recordButton.addEventListener('click', () => {
        if (timestamps.length === 0 || lyrics.length === 0) {
            alert('No se encontraron datos de sincronización para este proyecto.');
            return;
        }
        canvas.style.display = 'block';
        startRecording();
    });
});
