import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {AutoFileStorerConfigs} from "../Common/Common";

let defaultStoragePath = AutoFileStorerConfigs.defaultStoragePath || "";

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
				default: defaultStoragePath,
				placeholder: '/path/to/directory',
				description: `The directory path where to store the files default is ${defaultStoragePath}`,
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
		// Get input data
		const items = this.getInputData();

		// Retrieve parameters
		let destinationPath = this.getNodeParameter('destinationPath', 0) as string;
		const hashFilenames = this.getNodeParameter('hashFilenames', 0) as boolean;

		// Set default destination path if not provided
		if (destinationPath === '') destinationPath = defaultStoragePath;
		if (!fs.existsSync(destinationPath)) fs.mkdirSync(path.resolve(destinationPath), {recursive: true});

		// Array to store information about stored files
		const storedFiles: Array<{
			fileName: string;
			filePath: string,
			fileOriginName: string
		}> = [];

		// Process each item
		for (let i = 0; i < items.length; i++) {
			const binaryData = items[i].binary ?? {};
			for (const key of Object.keys(binaryData)) {
				const binary = binaryData[key];
				const originalFileName = binary.fileName || "";
				const fileExtension = binary.fileExtension || "";

				// Get the current date and time to use in the filename
				const currentDate = new Date().toISOString().replace(/[-:.]/g, '');

				// Generate a hash using the original file name and the current date/time
				const finalFileName = hashFilenames
					? crypto
						.createHash('md5')
						.update(originalFileName + currentDate)
						.digest('hex')
					: originalFileName;

				// Construct the file name with the extension
				const filename = hashFilenames
					? `${finalFileName}.${fileExtension}`
					: `${originalFileName}`;

				// Resolve the complete file path
				const filePath = path.resolve(destinationPath, filename || '');

				// Write the file to the file system
				fs.writeFileSync(filePath, Buffer.from(binary.data, 'base64'));

				// Store information about the stored file
				storedFiles.push({
					fileName: filename,
					fileOriginName: originalFileName,
					filePath: filePath
				});
			}

			// Add the stored files to the output JSON
			items[i].json.stored_files = storedFiles;
		}

		// Return the processed output data
		return this.prepareOutputData(items);
	}
}
