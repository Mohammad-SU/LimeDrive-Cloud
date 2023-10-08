export interface FolderType {
    id: string; // d_ prefix will be added to its frontend id ('d' standing for directory) to avoid conflicts with file id's
    name: string;
    cloud_path: string;
    app_path: string;
    date: Date;
}