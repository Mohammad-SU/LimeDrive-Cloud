import "./LoadingPage.scss"
import LoadingBar from "../LoadingBar-COMPS/LoadingBar";

interface LoadingPageProps {
    message: string;
    loading: boolean;
}

function LoadingPage(props: LoadingPageProps) {
    return (
        <div className="LoadingPage">
            <div className="wrapper">
                <p>{props.message}</p>
                <LoadingBar loading={props.loading} />
            </div>
        </div>
    )
}

export default LoadingPage;