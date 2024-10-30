const fs = require('fs');

exports.generateSRT = (lyrics, timestamps, outputPath) => {
    let srtContent = '';
    timestamps.forEach((entry, index) => {
        const startTime = new Date(entry.time * 1000).toISOString().substr(11, 8);
        const endTime = new Date((entry.time + 2) * 1000).toISOString().substr(11, 8);
        srtContent += `${index + 1}\n${startTime},000 --> ${endTime},000\n${entry.line}\n\n`;
    });

    fs.writeFileSync(outputPath, srtContent);
};
