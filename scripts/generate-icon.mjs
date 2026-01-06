import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, '..', 'build');
const inputImage = path.join(buildDir, 'icon.jpg');
const pngOutput = path.join(buildDir, 'icon.png');
const icoOutput = path.join(buildDir, 'icon.ico');

async function generateIcons() {
    console.log('🎨 Generating icons from admin panel logo...');

    // First convert JPG to PNG with 256x256 size (standard for Windows icons)
    console.log('📐 Converting to 256x256 PNG...');
    await sharp(inputImage)
        .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(pngOutput);
    console.log('✅ Created icon.png');

    // Generate multiple sizes for ICO
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = await Promise.all(
        sizes.map(size =>
            sharp(inputImage)
                .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .png()
                .toBuffer()
        )
    );

    // Convert to ICO
    console.log('🔄 Converting to ICO...');
    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(icoOutput, icoBuffer);
    console.log('✅ Created icon.ico');

    console.log('\n✨ Icons generated successfully!');
    console.log(`   📁 ${pngOutput}`);
    console.log(`   📁 ${icoOutput}`);
}

generateIcons().catch(console.error);
