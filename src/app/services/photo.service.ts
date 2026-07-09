import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

/**
 * Handles the "Victory Photo" a user attaches to a visited area.
 * Files are stored in Firebase Storage under victory-photos/{uid}/{codigo};
 * the returned download URL is what the API persists.
 */
@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private auth = inject(Auth);
  private storage = inject(Storage);

  /** 5 MB — keeps uploads snappy and Storage costs sane. */
  static readonly MAX_BYTES = 5 * 1024 * 1024;
  static readonly ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /** Uploads the file for the given area and resolves with its public download URL. */
  async upload(codigo: string, file: File): Promise<string> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('not_authenticated');

    const storageRef = ref(this.storage, this.pathFor(uid, codigo));
    await uploadBytes(storageRef, file, { contentType: file.type });
    return getDownloadURL(storageRef);
  }

  /** Removes the stored photo for an area. Missing objects are treated as success. */
  async remove(codigo: string): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('not_authenticated');

    try {
      await deleteObject(ref(this.storage, this.pathFor(uid, codigo)));
    } catch (err: any) {
      if (err?.code !== 'storage/object-not-found') throw err;
    }
  }

  private pathFor(uid: string, codigo: string): string {
    return `victory-photos/${uid}/${codigo}`;
  }
}
