import './RouteInfo.css';

function RouteInfo(props)
{
    const styles = {
        backgroundColor: "hsl(200, 100%, 50%)",
        color: "black",
        padding: "10px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        textAlign: "center",
        margin: "0 auto",
        width: "fit-content",
    }

    return (
        <div className="route-info">
            <div className="route-header">
                <h1>Route {props.routeNum}:</h1>
                {props.onDelete && (
                    <button 
                        onClick={props.onDelete}
                        className="delete-btn"
                        title="Delete this route"
                    >
                        ✕
                    </button>
                )}
            </div>
            <h2>{props.startLocation} to {props.endLocation}</h2>
            
            <h2>Cities along route: </h2>
            {props.cities && props.cities.length > 0 ? (
                <p style={styles}>{props.cities.join(', ')}</p>
            ) : (
                <p>No cities along route</p>
            )}
        </div>
    );
}

export default RouteInfo