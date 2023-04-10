import { ImageData } from '@nouns/sdk/src/image/types';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Appends an image-data.json file to an existing one.
 * The purpose is for the webapp to have one file with all the art, not split to pages like in the contracts storage
 */

const BASE = path.join(__dirname, '../src/image-data.json');
const NEW = path.join(__dirname, '../src/image-data-artists.json');
const DESTINATION = path.join(__dirname, '../src/image-data-new.json');

// const merge = async (baseFile: string, newFile: string, destinationFile: string) => {
const merge = async () => {
  const baseData: ImageData = JSON.parse((await fs.readFile(BASE)).toString());
  const newData: ImageData = JSON.parse((await fs.readFile(NEW)).toString());

  for (const [k, v] of Object.entries(newData.images)) {
    baseData.images[k].push(...v);
  }

  await fs.writeFile(DESTINATION, JSON.stringify(baseData, null, 2));
  console.log(`Wrote merged file to: ${DESTINATION}`);
};

merge();
