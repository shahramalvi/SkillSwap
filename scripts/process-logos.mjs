import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets =
  process.env.LOGO_ASSETS_DIR ??
  "C:\\Users\\shahr\\.cursor\\projects\\c-Users-shahr-OneDrive-Desktop-skillswap\\assets";

/**
 * Make near-black (or near-white) pixels fully transparent.
 * @param {"black" | "white"} key
 */
async function keyBackground(inputPath, outputPath, key) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    let transparent = false;
    if (key === "black") {
      // Remove black matte; keep navy (#0D1B3E) and lighter logo colors
      transparent = r < 28 && g < 28 && b < 28;
    } else {
      transparent = r > 248 && g > 248 && b > 248;
    }

    if (transparent) {
      pixels[i + 3] = 0;
    } else if (a < 255) {
      pixels[i + 3] = a;
    }
  }

  const keyed = await sharp(pixels, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  await sharp(keyed).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`${path.basename(outputPath)}: ${meta.width}x${meta.height} alpha=${meta.hasAlpha}`);
}

const jobs = [
  {
    in: path.join(assets, "c__Users_shahr_OneDrive_Desktop_skillswap_l1.png"),
    out: path.join(root, "public", "logo-l1.png"),
    key: "black",
  },
  {
    in: path.join(assets, "c__Users_shahr_OneDrive_Desktop_skillswap_l2.png"),
    out: path.join(root, "public", "logo-l2.png"),
    key: "black",
  },
];

for (const { in: input, out, key } of jobs) {
  await keyBackground(input, out, key);
}
