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
				default: '',
				placeholder: '/path/to/store/files',
				description: 'The directory path where to store the files',
				required: true,
			},
			{
				displayName: 'Hash Filenames',
				name: 'hashFilenames',
				type: 'boolean',
				default: false,
				description: 'If true, the file names will be hashed',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		// Get node parameters
		const destinationPath = this.getNodeParameter('destinationPath', 0) as string;
		const hashFilenames = this.getNodeParameter('hashFilenames', 0) as boolean;

		const storedFiles: Array<{ fileName: string; filePath: string }> = [];

		for (let i = 0; i < items.length; i++) {
			const binaryData = items[i].binary ?? {};
			for (const key of Object.keys(binaryData)) {
				const binary = binaryData[key];
				const originalFileName = binary.fileName;

				// Create the destination file name (hash if necessary)
				const finalFileName = hashFilenames
					? crypto
							.createHash('md5')
							.update(originalFileName || '')
							.digest('hex')
					: originalFileName;

				// Store the file in the given path
				const filePath = path.join(destinationPath, finalFileName || '');
				fs.writeFileSync(filePath, Buffer.from(binary.data, 'base64'));

				// Store information about the stored file
				storedFiles.push({
					fileName: finalFileName || '',
					filePath,
				});
			}

			// Add the stored_files array to the output
			items[i].json.stored_files = storedFiles;
		}

		return this.prepareOutputData(items);
	}
}
