import { memo } from 'react'
import "./File.scss"
import { FileType } from '../../types/index.ts';

interface FileProps {
    file: FileType;
}

function File({ file }: FileProps) {
    
    function formatDate(date: Date) {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
      
        const amPm = hours >= 12 ? 'pm' : 'am'; // Convert to 12-hour format
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours; // Convert 0 to 12
      
        const formattedDay = day;
        const formattedMonth = month;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Pad minutes with leading zeros if needed
      
        return `${formattedDay}/${formattedMonth}/${year} ${hours}:${formattedMinutes}${amPm}`;
      }
      
      const dateToFormat = file.date;
      const formattedDate = formatDate(dateToFormat);

    return (
        <div className="File">
            <p className="file-name">{file.name}</p>
            <p>{file.type}</p>
            <p>{file.extension}</p>
            <p>{file.size}</p>
            <p>{formattedDate}</p>
        </div>
    )
}

export default memo(File)