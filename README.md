# AutoFileStorer Node

## Overview

The **AutoFileStorer** node is designed to store binary files from an n8n workflow to the local file system. It allows users to upload files, optionally hash the filenames for uniqueness, and save them in a specified directory on disk.

## Features

*   **File Storage**: Upload and store binary files to a specified directory on the file system.
*   **Optional Filename Hashing**: Choose whether to hash the filenames before saving to ensure unique and anonymized filenames.
*   **File Metadata**: Provides metadata about the stored files, including the file's original name and its storage path.

## Node Properties

### 1\. Destination Path

*   **Name**: `destinationPath`
*   **Type**: `string`
*   **Default**: `./n8n_storage/uploaded_files`
*   **Placeholder**: `/path/to/directory`
*   **Description**: Specifies the directory path where the uploaded files will be stored. If not provided, the default directory is `./n8n_storage/uploaded_files` relative to the current working directory of n8n. You can specify an absolute path or a relative path.
*   **Example**:
	*   `/usr/local/n8n/uploads/`
	*   `./n8n_storage/my_files`
*   **Required**: No

### 2\. Hash Filenames

*   **Name**: `hashFilenames`
*   **Type**: `boolean`
*   **Default**: `true`
*   **Description**: If enabled (`true`), the filenames will be hashed using the MD5 algorithm before being saved. This is useful for ensuring that filenames are unique and anonymized. If disabled (`false`), the original filenames will be used.

## Input/Output

### Inputs

**Binary Data**: This node expects binary data as input. The binary data can be passed from another node that handles file uploads (e.g., from an HTTP request or a file upload node).

### Outputs

**Stored File Metadata**: The node outputs an array of stored file metadata in a new field named `stored_files`. Each file's metadata includes:

*   `fileName`: The full path to the stored file, including the file extension.
*   `fileOriginName`: The original name of the file before storage.
*   `filePath`: The directory path where the file was saved (without the extension).

**Example Output**:

```

{
  "stored_files": [
    {
      "fileName": "/path/to/directory/hashedfilename.txt",
      "fileOriginName": "example.txt",
      "filePath": "/path/to/directory/hashedfilename"
    }
  ]
}
    
```

## How the Node Works

1.  **Receive Binary Data**: The node accepts binary data from a previous node in the workflow, such as files uploaded via HTTP or other methods.
2.  **Process Each File**: The node loops through the input data and processes each binary file.
3.  **Filename Handling**: Depending on the `hashFilenames` parameter:
	*   If hashing is enabled, the node hashes the original filename using the MD5 algorithm and stores the file with the hashed name.
	*   If hashing is disabled, the original filename is used.
4.  **Store the File**: The file is written to the specified `destinationPath`. If no path is specified, the default path `./n8n_storage/uploaded_files` is used.
5.  **Output Metadata**: The node outputs metadata about the stored files, including the original and stored filenames.

## Example Usage

### Use Case 1: Store Files with Hashed Filenames

In this example, the node will store the uploaded files in the default directory with hashed filenames to ensure anonymity and uniqueness:

*   **Destination Path**: `./n8n_storage/uploaded_files`
*   **Hash Filenames**: `true` (default)

### Use Case 2: Store Files Without Hashing

If you want to store files with their original filenames:

*   **Destination Path**: `/usr/local/n8n/uploads`
*   **Hash Filenames**: `false`

In this case, the files will be saved in `/usr/local/n8n/uploads` with their original names.

## Error Handling

*   **Invalid Destination Path**: If the destination path is invalid or inaccessible, the node will throw an error. Ensure that the directory exists and that the n8n process has write permissions.
*   **Binary Data Missing**: If no binary data is passed to the node, it will not execute properly. Ensure that the previous node provides binary data.

## Limitations

*   **File Overwriting**: If the `hashFilenames` option is disabled and a file with the same name already exists in the destination folder, the new file will overwrite the existing file. Use hashing to avoid this.
*   **File Extension**: The node will retain the original file extension when saving the file to disk.

## Conclusion

The **AutoFileStorer** node is a powerful tool for saving uploaded files locally on the server while optionally hashing filenames for uniqueness and security. It's useful in workflows where you need to persist files received from various sources, such as APIs or user uploads.
