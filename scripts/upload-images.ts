/**
 * Upload all local images to Cloudinary
 * Run: bun run upload:images
 * 
 * Prerequisites:
 * 1. Create a Cloudinary account at https://cloudinary.com
 * 2. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 * 
 * This script will:
 * 1. Read all images from /public/images/
 * 2. Upload them to Cloudinary with proper folder structure
 * 3. Output a JSON mapping of local paths → Cloudinary URLs
 * 4. Optionally update the database with the new URLs
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

interface UploadResult {
  localPath: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
}

async function uploadDirectory(
  dirPath: string,
  cloudinaryFolder: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subResults = await uploadDirectory(
        fullPath,
        `${cloudinaryFolder}/${entry.name}`
      );
      results.push(...subResults);
    } else if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(entry.name)) {
      const publicId = `${cloudinaryFolder}/${path.parse(entry.name).name}`;
      const localPath = `/images/${path.relative(path.join(process.cwd(), 'public'), fullPath).replace(/\\/g, '/')}`;

      console.log(`Uploading: ${localPath} → ${publicId}`);

      try {
        const result = await cloudinary.uploader.upload(fullPath, {
          public_id: publicId,
          folder: 'grosirpj',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        });

        results.push({
          localPath,
          cloudinaryUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
        });

        console.log(`  ✅ ${result.secure_url}`);
      } catch (error) {
        console.error(`  ❌ Failed: ${entry.name}`, error);
      }
    }
  }

  return results;
}

async function main() {
  console.log('🚀 Uploading images to Cloudinary...\n');

  // Check configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary not configured!');
    console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    process.exit(1);
  }

  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`Source: ${PUBLIC_IMAGES_DIR}\n`);

  const results = await uploadDirectory(PUBLIC_IMAGES_DIR, 'grosirpj');

  console.log(`\n✅ Uploaded ${results.length} images to Cloudinary`);

  // Save mapping to JSON file
  const mappingPath = path.join(process.cwd(), 'cloudinary-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`📄 Mapping saved to: ${mappingPath}`);

  // Output SQL update statements for the database
  console.log('\n📋 SQL Update Statements:');
  console.log('---');
  
  for (const result of results) {
    if (result.localPath.includes('/categories/')) {
      console.log(`UPDATE Category SET image = '${result.cloudinaryUrl}' WHERE image = '${result.localPath}';`);
    } else if (result.localPath.includes('/products/')) {
      console.log(`UPDATE Product SET images = '${result.cloudinaryUrl}' WHERE images = '${result.localPath}';`);
    } else if (result.localPath.includes('hero-banner')) {
      console.log(`-- Hero banner: ${result.cloudinaryUrl}`);
    }
  }
  console.log('---');
}

main().catch(console.error);
