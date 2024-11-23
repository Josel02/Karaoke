document.addEventListener('DOMContentLoaded', async () => {
    
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    
    document.getElementById('createdAt').textContent = formattedDate.format(new Date(project.created_at));;
    document.getElementById('lastModified').textContent = formattedDate.format( new Date(project.last_modified));;

    const recordButton = document.getElementById('recordButton');
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
        context.textAlign = 'center';
    
        // Tamaño base de la fuente
        let fontSize = 48;
        context.font = `${fontSize}px Arial`;
    
        // Dividir la frase en líneas si es muy larga
        const words = line.split(' ');
        const lines = [];
        let currentLine = '';
    
        // Crear líneas dinámicamente
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const testWidth = context.measureText(testLine).width;
    
            if (testWidth > canvas.width * 0.9) { // Añade un margen de 10%
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
    
        if (currentLine) {
            lines.push(currentLine.trim());
        }
    
        // Ajustar el tamaño de fuente si hay demasiadas líneas
        while (lines.length > 3 && fontSize > 20) { // Limita a un máximo de 3 líneas y evita fuentes muy pequeñas
            fontSize -= 4;
            context.font = `${fontSize}px Arial`;
        }
    
        // Dibujar las líneas centradas verticalmente
        const lineHeight = fontSize + 10;
        const totalHeight = lines.length * lineHeight;
        let y = (canvas.height - totalHeight) / 2 + fontSize;
    
        lines.forEach(line => {
            context.fillText(line, canvas.width / 2, y);
            y += lineHeight;
        });
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
    
            const formData = new FormData();
            formData.append('video', blob, `${project.name}.webm`);
    
            try {
                const response = await fetch(`/projects/uploadVideo/${project.id}`, {
                    method: 'POST',
                    body: formData,
                });
    
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Karaoke creado!',
                        text: 'El video del karaoke se ha generado correctamente.',
                    }).then(() => {
                        canvas.style.display = 'none';
            
                        // Ocultar barra de progreso
                        progressContainer.style.display = 'none';
                
                        // Desactivar el botón de grabar
                        recordButton.setAttribute('disabled', 'disabled');

                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al guardar el video.',
                    });
                }
            } catch (error) {
                console.error('Error al enviar el video al servidor:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al enviar el video.',
                });
            }
        };
    
        mediaRecorder.start();
    
        let currentIndex = 0;
        const totalSteps = timestamps.length;
    
        // Mostrar la barra de progreso
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%'; // Inicia en 0%
    
        audioPlayer.currentTime = 0;
    
        audioPlayer.addEventListener('canplaythrough', () => {
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
    
                // Calcular porcentaje de progreso
                const progress = (currentIndex / totalSteps) * 100;
                progressBar.style.width = `${progress}%`; // Actualizar la barra
            }, 2000);
        });
    };
    
    recordButton.addEventListener('click', () => {
        if (timestamps.length === 0 || lyrics.length === 0) {
            alert('No se encontraron datos de sincronización para este proyecto.');
            return;
        }
        canvas.style.display = 'block';
        startRecording();
    });

    const deleteVideoButton = document.getElementById('deleteVideoButton');

    if(deleteVideoButton) {
        deleteVideoButton.addEventListener('click', async () => {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¡No podrás recuperar este video una vez eliminado!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/projects/deleteVideo/${project.id}`, {
                        method: 'POST',
                    });

                    if (response.ok) {
                        Swal.fire({
                            title: '¡Eliminado!',
                            text: 'El video se ha eliminado con éxito.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar',
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar el video.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar',
                        });
                    }
                } catch (error) {
                    console.error('Error al eliminar el video:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al intentar eliminar el video.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar',
                    });
                }
            }
        });
    }
});
