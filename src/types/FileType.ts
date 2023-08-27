export interface FileType {
    id: string;
    name: string;
    content: Blob;
    path: string;
    type: string;
    extension: string;
    size: number;
    date: Date;
}