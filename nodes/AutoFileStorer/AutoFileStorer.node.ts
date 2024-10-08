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
				default: './n8n_storage/uploaded_files',
				placeholder: '/path/to/directory',
				description: 'The directory path where to store the files default is ./n8n_storage/uploaded_files',
				"required": false,
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

		const destinationPath = this.getNodeParameter('destinationPath', 0) as string;
		const hashFilenames = this.getNodeParameter('hashFilenames', 0) as boolean;

		// create directory if not exists
		if (!fs.existsSync(destinationPath)) fs.mkdirSync(destinationPath, { recursive: true });

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

				const filePath = path.join(destinationPath, finalFileName || '');

				let filename = hashFilenames ?  `${finalFileName}.${fileExtension}` : `${originalFileName}`;

				fs.writeFileSync(filename, Buffer.from(binary.data, 'base64'));

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
