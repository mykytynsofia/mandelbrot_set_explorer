class ColorManager {
    constructor(backgroundColor, colors, depths) {
        this.backgroundColor = backgroundColor;
        this.colors = colors;
        this.depths = depths;
        this.colorPalette = [this.backgroundColor, ...this.colors];
    }

    getColorForDepth(depth) {
        let index = this.depths.findIndex(d => depth < d);
        if (index === -1) index = this.depths.length
        return this.colorPalette[index];
    }
}

class FractalGenerator {
    constructor(canvasId, width, height, colorManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.colorManager = colorManager;
        this.zoomCenter = { real: -0.7, imag: 0.0 };
        this.zoomWidthScale = 2.7;
        this.aspectRatio = this.width / this.height;
        this.canvas.addEventListener('click', this.handleZoomClick.bind(this));
    }

    drawScene() {
        let realStart = this.zoomCenter.real - this.zoomWidthScale / 2;
        let imagStart = this.zoomCenter.imag + this.zoomWidthScale / (2 * this.aspectRatio);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let divergence = this.calculateDivergence(
                    realStart + x * this.zoomWidthScale / this.width,
                    imagStart - y * this.zoomWidthScale / (this.aspectRatio * this.height),
                    this.colorManager.depths[this.colorManager.depths.length - 1]
                );
                this.ctx.fillStyle = this.colorManager.getColorForDepth(divergence);
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    calculateDivergence(real, imag, maxDepth) {
        let [r, i] = [real, imag];
        for (let step = 0; step < maxDepth; step++) {
            if (r * r + i * i >= 4) return step;
            [r, i] = [r * r - i * i + real, 2 * r * i + imag];
        }
        return maxDepth;
    }

    handleZoomClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickReal = this.zoomCenter.real + (x - this.width / 2) * this.zoomWidthScale / this.width;
        const clickImag = this.zoomCenter.imag - (y - this.height / 2) * this.zoomWidthScale / (this.height * this.aspectRatio);

        this.zoomCenter.real = clickReal;
        this.zoomCenter.imag = clickImag;

        this.zoomWidthScale *= 0.3;

        this.drawScene();
    }
}

class CanvasSetup {
    constructor(fractalGenerator, colorManager) {
        this.fractalGenerator = fractalGenerator;
        this.colorManager = colorManager;
    }

    setup() {
        this.fractalGenerator.canvas.width = this.fractalGenerator.width;
        this.fractalGenerator.canvas.height = this.fractalGenerator.height;
        this.fractalGenerator.drawScene();
        this.setupDepthColorLegends();
    }

    setupDepthColorLegends() {
        const container = document.getElementById('depth-color-indicators');
        container.innerHTML = '';
        this.colorManager.depths.forEach((depth, index) => {
            const color = this.colorManager.colors[index] || this.colorManager.backgroundColor;
            const row = document.createElement('div');
            row.className = 'depth-color-row';
            const colorCell = document.createElement('div');
            colorCell.className = 'depth-color-cell';
            const indicator = document.createElement('span');
            indicator.className = 'depth-color-indicator';
            indicator.style.backgroundColor = color;
            colorCell.appendChild(indicator);

            const depthCell = document.createElement('div');
            depthCell.className = 'depth-color-cell';
            depthCell.textContent = `Depth: ${depth}`;

            row.appendChild(colorCell);
            row.appendChild(depthCell);
            container.appendChild(row);
        });
    }
}
const depths = [2,10, 15, 20, 30, 40, 50, 100, 600, 700, 1200, 1250, 1260, 1300];
const colors = ["#e6e6fa","#b3d1ff", "#ffb3ff", "#ff66ff", "#3385ff", "#b300b3", "#006600", "#9999ff", "#000080", "#6600cc", "#66ff66", "#fa5456", "#cc3300", "#00004d"];
const colorManager = new ColorManager("#000000", colors, depths);
const fractalGenerator = new FractalGenerator("mc", 1100, 850, colorManager);
const canvasSetup = new CanvasSetup(fractalGenerator, colorManager);

window.onload = () => canvasSetup.setup();