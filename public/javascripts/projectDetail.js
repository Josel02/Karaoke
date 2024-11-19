document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const previewVideo = document.getElementById('previewVideo');
    const canvas = document.getElementById('videoCanvas');
    const context = canvas.getContext('2d');

    const audioPlayer = new Audio('/uploads/AMOR MALDITO-jose.mp3'); // Ruta del archivo de audio
    let recordedChunks = [];
    let mediaRecorder;

    // Dibujar las letras en el canvas
    const drawLyrics = (line) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#FFF';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.fillText(line, canvas.width / 2, canvas.height / 2);
    };

    // Iniciar la grabación combinando el audio y el canvas
    const startRecording = () => {
        const videoStream = canvas.captureStream();
        const audioStream = audioPlayer.captureStream(); // Captura el flujo de audio
        const combinedStream = new MediaStream([
            ...videoStream.getTracks(),
            ...audioStream.getTracks(),
        ]);

        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // Ocultar el canvas
            canvas.style.display = 'none';

            // Mostrar el video generado
            previewVideo.src = url;
            previewVideo.style.display = 'block';
            previewVideo.play();

            // Enviar el video al servidor para guardarlo
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

        audioPlayer.play(); // Iniciar el audio

        const interval = setInterval(() => {
            if (currentIndex >= timestamps.length) {
                clearInterval(interval);
                mediaRecorder.stop();
                audioPlayer.pause();
                return;
            }

            drawLyrics(lyrics[currentIndex]);
            currentIndex++;
        }, 2000); // Ajusta la duración por línea
    };

    // Manejar el botón de grabación
    recordButton.addEventListener('click', () => {
        if (timestamps.length === 0 || lyrics.length === 0) {
            alert('No se encontraron datos de sincronización para este proyecto.');
            return;
        }
        canvas.style.display = 'block';
        startRecording();
    });
});
