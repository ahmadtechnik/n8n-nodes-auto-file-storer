import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class AutoFileStorer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Store Files',
		name: 'autoFileStorer',
		group: ['transform'],
		icon: 'file:autoFileStorerIcon.svg',
		version: 1,
		description: 'Store uploaded files on the disk',
		defaults: {
			name: 'Store Files',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Destination Path',
				name: 'destinationPath',
				type: 'string',
				default: path.join(process.cwd(), 'n8n_storage/uploaded_files'),
				placeholder: '/path/to/directory',
				description: `The directory path where to store the files default is ${path.join(process.cwd(), 'n8n_storage/uploaded_files')}`,
				"required": false,
				hint: `
			The folder will be created if it does not exist.
			\nWarn : if any file was not hashed will be overwritten if the file name is the same
			\nWarn: if the app does not have permission to write to the directory, the operation will fail
				`
			},
			{
				displayName: 'Hash Filenames',
				name: 'hashFilenames',
				type: 'boolean',
				default: true,
				"description": 'If true, the file names will be hashed',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let destinationPath = this.getNodeParameter('destinationPath', 0) as string;
		const hashFilenames = this.getNodeParameter('hashFilenames', 0) as boolean;

		if (destinationPath === '') destinationPath = path.join(process.cwd(), 'n8n_storage/uploaded_files');
		if (!fs.existsSync(destinationPath)) fs.mkdirSync(path.resolve(destinationPath), {recursive: true});

		const storedFiles: Array<{
			fileName: string;
			filePath: string,
			fileOriginName: string
		}> = [];

		for (let i = 0; i < items.length; i++) {
			const binaryData = items[i].binary ?? {};
			for (const key of Object.keys(binaryData)) {
				const binary = binaryData[key];
				const originalFileName = binary.fileName || "";

				const finalFileName = hashFilenames
					? crypto
						.createHash('md5')
						.update(originalFileName || '')
						.digest('hex')
					: originalFileName;

				const fileExtension = binary.fileExtension;

				let filename = hashFilenames ? `${finalFileName}.${fileExtension}` : `${originalFileName}`;
				const filePath = path.resolve(destinationPath, filename || '');

				fs.writeFileSync(filePath, Buffer.from(binary.data, 'base64'));

				// Store information about the stored file
				storedFiles.push({
					fileName: filename,
					fileOriginName: originalFileName,
					filePath: filePath
				});
			}

			items[i].json.stored_files = storedFiles;
		}

		return this.prepareOutputData(items);
	}
}
