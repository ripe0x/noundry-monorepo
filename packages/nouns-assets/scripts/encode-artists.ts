import { PNGCollectionEncoder } from '@nouns/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import { readPngImage } from './utils';
// import { palette } from '../src/image-data.json';
import { palette } from '../src/original-palette.json';

const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const parseTraitName = (partName: string): string =>
  capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1));

const DESTINATION = path.join(__dirname, '../src/image-data.json');
const ISSUES_DESTINATION = path.join(__dirname, '../src/issue-traits.json');


/**
 * @notice creates an additional art json file. it assumes it's not the first one.
 *   it also assumes the existing palette from the first one has all the needed colors.
 * @sourceFolder a folder containing subfolders with the names: ['1-bodies', '2-accessories', '3-heads', '4-glasses']
 * @destinationFilepath where to save the new json file
 */
// const encode = async (sourceFolder: string, destinationFilepath: string) => {
const encode = async () => {
  const encoder = new PNGCollectionEncoder(palette);
  const partfolders = ['1-bodies', '2-accessories', '3-heads', '4-glasses'];
  const issueTraits = [];
  for (const folder of partfolders) {
    const folderpath = path.join(__dirname, '../images/noundry', folder);
    let files = await fs.readdir(folderpath);
    // filter hidden files
    files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
    console.log('files', files);
    
    const trimmedFileNames = files.map((file) => {
      const filenameIndex = file.indexOf("_");
      const filename = file.substring(filenameIndex + 1);
      const data = {
        name: parseTraitName(filename),
        filename: file,
      }
      return data;
    }) 
    

    const sortedFiles = trimmedFileNames.sort((a, b) => {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      
      // names must be equal
      return 0;
    });

    console.log('sortedFiles', sortedFiles);
    // for (const file of files) {
    for (const file of sortedFiles) {
      // console.log(file);
      // file naming pattern: artist_trait-type-trait-name.png
      const artist = file.filename.split("_")[0];
      const filenameIndex = file.filename.indexOf("_");
      const filename = file.filename.substring(filenameIndex + 1).replace(/\.[^/.]+$/, "");
      const image = await readPngImage(path.join(folderpath, file.filename));
      const paletteIsAMatch = encoder.checkColors(filename, image);
      if (paletteIsAMatch) {
        encoder.encodeImageArtist(filename, image, folder.replace(/^\d-/, ''), artist && artist); 
      } else {
        console.log('this image  has a color that doesnt match the original palette.');
        issueTraits.push(file);
      }
    }
  }
  
//   // For artist folder approach
//   for (const artist of artists ) {
//     for (const folder of partfolders) {
//         const folderpath = path.join(__dirname, '../images/artists', artist, '/', folder);
//         let files = await fs.readdir(folderpath);
//         files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
//         for (const file of files) {
//         //   if (file === '.gitkeep') {
//         //     continue;
//         //   }
//           const image = await readPngImage(path.join(folderpath, file));
//           encoder.encodeImageWithArtist(file.replace(/\.png$/, ''), image, folder.replace(/^\d-/, ''), artist);
//         }
//       }
//   }
//   for (const folder of partfolders) {
//     const folderpath = path.join(__dirname, '../images/noundry-more', folder);
//     const files = await fs.readdir(folderpath);
//     for (const file of files) {
//       if (file === '.gitkeep') {
//         continue;
//       }
//       const image = await readPngImage(path.join(folderpath, file));
//       encoder.encodeImage(file.replace(/\.png$/, ''), image, folder.replace(/^\d-/, ''));
//     }
//   }

  // if (JSON.stringify(encoder.data.palette) !== JSON.stringify(palette)) {
  //   console.log('Palette changed! Aborting');

  //   await fs.writeFile('original_palette.json', JSON.stringify(palette, null, 2));
  //   await fs.writeFile('new_palette.json', JSON.stringify(encoder.data.palette, null, 2));

  //   throw new Error(`Palette changed, expected to stay the same`);
  // }

  await fs.writeFile(
    DESTINATION,
    JSON.stringify(
      {
        // images: encoder.data.images,
        bgcolors: ['d5d7e1', 'e1d7d5'],
        ...encoder.data,
      },
      null,
      2,
    ),
  );
  await fs.writeFile(
    ISSUES_DESTINATION,
    JSON.stringify(
      {
        images: issueTraits,
      },
      null,
      2,
    ),
  );
};

encode();
