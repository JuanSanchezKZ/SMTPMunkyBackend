import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import path from 'path';

@Injectable()
export class UploadsService {
  private dir: string;

  constructor() {
    this.dir = process.env.UPLOAD_DIR || './uploads';
    fs.mkdirSync(this.dir, { recursive: true });
  }

  async saveBuffer(originalName: string, mimeType: string, buf: Buffer) {
    const id = nanoid(16);
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${id}_${safeName}`;
    const fullPath = path.join(this.dir, fileName);
    await fs.promises.writeFile(fullPath, buf);
    return { fileId: id, fileName, mimeType, size: buf.length, path: fullPath };
  }

  async readByPath(fullPath: string) {
    return fs.promises.readFile(fullPath);
  }
}
