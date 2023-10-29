import { memo } from 'react';
import "./Breadcrumb.scss"
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
    path: string;
    setPath: React.Dispatch<React.SetStateAction<string>>; // Define the type for setPath as a state updater for a string
    btnType?: boolean
}

function Breadcrumb({ path, setPath, btnType }: BreadcrumbProps) {
    const pathSegments = path.split('/').filter(segment => segment.trim() !== '')

    return (
        <nav className="Breadcrumb">
            {pathSegments.map((segment, index) => {
                const linkToPath = `/${pathSegments.slice(0, index + 1).join('/')}`
                const commonAttributes = {
                    onClick: () => {
                        if (path !== linkToPath) {
                            setPath(linkToPath.substring(1) + "/");
                        }
                    }
                };

                return (
                    <div className="item" key={index}>
                        {index === 0 ? null : <span className="divider">/</span>}

                        {btnType ? 
                            <button className="text-btn" {...commonAttributes}>
                                {decodeURIComponent(segment)}
                            </button>
                            : 
                            <Link to={linkToPath} {...commonAttributes}>
                                {decodeURIComponent(segment)}
                            </Link>
                        }
                    </div>
                )
            })}
        </nav>
    )
};

export default memo(Breadcrumb);