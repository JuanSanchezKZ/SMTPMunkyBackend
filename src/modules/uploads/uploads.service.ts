import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
// ✅ Cambiamos esto para asegurar compatibilidad total en producción
import * as path from 'path'; 

@Injectable()
export class UploadsService {
  private dir: string;

  constructor() {
    // Usamos path.resolve para asegurarnos de que la ruta sea absoluta en Railway
    this.dir = path.resolve(process.env.UPLOAD_DIR || './uploads');
    
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  async saveBuffer(originalName: string, mimeType: string, buf: Buffer) {
    // Si originalName llega como undefined por algún error en el controller,
    // le ponemos un fallback para que el replace no falle.
    const name = originalName || 'archivo_sin_nombre.xlsx';
    
    const id = nanoid(16);
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${id}_${safeName}`;
    
    // Ahora path.join no será undefined
    const fullPath = path.join(this.dir, fileName);
    
    await fs.promises.writeFile(fullPath, buf);
    return { fileId: id, fileName, mimeType, size: buf.length, path: fullPath };
  }

  async readByPath(fullPath: string) {
    try {
      // Verificamos si el path es absoluto o necesita resolverse
      const absolutePath = path.isAbsolute(fullPath) 
        ? fullPath 
        : path.join(this.dir, fullPath);

      return await fs.promises.readFile(absolutePath);
    } catch (error) {
      console.error(`Error al leer el archivo en ${fullPath}:`, error);
      throw new Error('No se pudo encontrar el archivo solicitado. Recordá que Railway limpia los archivos temporales en cada deploy.');
    }
  }
}
