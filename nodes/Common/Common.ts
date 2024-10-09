import * as path from 'path';

/**
 * Configuration settings for the AutoFileStorer node.
 */
export const AutoFileStorerConfigs = {
	defaultStoragePath: path.join(process.cwd(), 'n8n_storage/uploaded_files'),
}

/**
 * Get the MIME type based on the file extension.
 * @param filePath The full path or filename of the file.
 * @returns The MIME type as a string, or 'application/octet-stream' as the default if unknown.
 */
export function getMimeType(filePath: string): string {
	// Extract the file extension
	const ext = path.extname(filePath).toLowerCase();

	// Map of file extensions to MIME types
	const mimeTypes: { [key: string]: string } = {
		'.txt': 'text/plain',
		'.html': 'text/html',
		'.htm': 'text/html',
		'.css': 'text/css',
		'.js': 'application/javascript',
		'.json': 'application/json',
		'.xml': 'application/xml',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.bmp': 'image/bmp',
		'.webp': 'image/webp',
		'.svg': 'image/svg+xml',
		'.ico': 'image/x-icon',
		'.mp4': 'video/mp4',
		'.mp3': 'audio/mpeg',
		'.wav': 'audio/wav',
		'.pdf': 'application/pdf',
		'.zip': 'application/zip',
		'.tar': 'application/x-tar',
		'.gz': 'application/gzip',
		'.rar': 'application/vnd.rar',
		'.7z': 'application/x-7z-compressed',
		'.doc': 'application/msword',
		'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'.xls': 'application/vnd.ms-excel',
		'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'.ppt': 'application/vnd.ms-powerpoint',
		'.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		// Add more extensions and MIME types as needed
	};

	// Return the corresponding MIME type or a default MIME type if unknown
	return mimeTypes[ext] || 'application/octet-stream';
}
