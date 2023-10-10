import { memo } from 'react';
import "./Breadcrumb.scss"
import { Link, useNavigate } from 'react-router-dom';
import { useFileContext } from '../../../contexts/FileContext';

function Breadcrumb() {
    const { currentPath, setCurrentPath } = useFileContext()
    const pathSegments = currentPath.split('/').filter(segment => segment.trim() !== '')

    return (
        <nav className="Breadcrumb">
            {pathSegments.map((segment, index) => {
                const linkToPath = `/${pathSegments.slice(0, index + 1).join('/')}`
                return (
                    <div className="item" key={index}>
                        {index === 0 ? null : <span className="divider">/</span>}
                        <Link to={linkToPath} onClick={() => setCurrentPath(linkToPath)}>
                            {decodeURIComponent(segment)}
                        </Link>
                    </div>
                )
            })}
        </nav>
    )
};

export default memo(Breadcrumb);