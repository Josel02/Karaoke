// services/srtService.js
const fs = require('fs');

exports.generateSRT = (lyrics, timestamps, outputPath) => {
    let srtContent = '';
    timestamps.forEach((entry, index) => {
        const startTime = formatTime(entry.time);
        const endTime = formatTime(entry.time + 2); // Ajusta la duración según sea necesario
        srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${entry.line}\n\n`;
    });

    fs.writeFileSync(outputPath, srtContent, 'utf8');
};

const formatTime = (seconds) => {
    const date = new Date(null);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 12);
    return timeString.replace('.', ',');
};
