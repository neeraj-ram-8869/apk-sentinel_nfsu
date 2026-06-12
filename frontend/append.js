const fs = require('fs');

const css = `
/* Custom Animations */
@keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}

.scan-area {
    position: relative;
    overflow: hidden;
}

.scan-area::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, transparent, #5300b7, transparent);
    box-shadow: 0 0 10px #5300b7;
    animation: scanline 2.5s infinite linear;
    opacity: 0.5;
    pointer-events: none;
}
`;

fs.appendFileSync('src/app/globals.css', css);
console.log('Appended CSS to globals.css');
