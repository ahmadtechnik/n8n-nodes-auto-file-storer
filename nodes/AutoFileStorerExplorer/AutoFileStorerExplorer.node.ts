import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription, NodeOperationError,
} from 'n8n-workflow';

import * as fs from 'fs';
import * as path from 'path';
import {AutoFileStorerConfigs, getMimeType} from "../Common/Common";

let defaultStoragePath = AutoFileStorerConfigs.defaultStoragePath || "";

export class AutoFileStorerExplorer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Explore Stored Files',
		name: 'autoFileStorerExplorer',
		icon: 'file:autoFileStorerExplorerIcon.svg',
		group: ['transform'],
		version: 1,
		description: 'Explore files stored in a directory',
		defaults: {
			name: 'Explore Stored Files',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Directory Path',
				name: 'directoryPath',
				type: 'string',
				default: defaultStoragePath,
				placeholder: '/path/to/directory',
				"description": 'The directory path where the files are stored.',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const directoryPath = this.getNodeParameter('directoryPath', 0) as string;
		let files: string[] = [];

		try {
			files = fs.readdirSync(directoryPath);
		} catch (error) {
			throw new NodeOperationError(this, `Failed to read directory: ${error.message}`);
		}

		const returnData = files.map(file => {
			const filePath = path.join(directoryPath, file);
			const stats = fs.statSync(filePath);
			return {
				json: {
					fileName: file,
					filePath: filePath,
					fileMimeType: getMimeType(filePath) || 'unknown',
					fileSize: stats.size,
					lastModifiedDate: stats.mtime,
				}
			};
		});

		return this.prepareOutputData(returnData);
	}
}
