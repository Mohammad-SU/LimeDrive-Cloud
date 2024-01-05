export interface FolderType {
    id: string; // d_ prefix are added to their frontend ids ('d' standing for directory) to help avoid conflicts and confusion with file id's
    name: string;
    app_path: string;
    type?: undefined;
    date: Date;
}