export interface FileType {
    id: number;
    name: string;
    content: Blob;
    path: string;
    date: Date;
    type: string;
    size: number;
}