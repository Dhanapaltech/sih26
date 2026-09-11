import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface UploadResult {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
}

export const storageService = {
  async uploadFile(
    bucket: 'avatars' | 'challenge-media' | 'project-files' | 'documents' | 'certificates',
    pathPrefix: string,
    file: File
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${pathPrefix}/${timestamp}_${cleanName}`;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.storage.from(bucket).upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
          return {
            fileName: file.name,
            filePath: data.path,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            publicUrl: urlData.publicUrl,
          };
        }
      } catch (err) {
        console.warn(`Storage upload to ${bucket} failed, using local object URL:`, err);
      }
    }

    // Demo/Local Object URL fallback
    let localUrl = '';
    try {
      localUrl = URL.createObjectURL(file);
    } catch {
      localUrl = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80`;
    }

    return {
      fileName: file.name,
      filePath: storagePath,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      publicUrl: localUrl,
    };
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
