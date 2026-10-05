import { useState, useEffect } from 'react';

function Api() {
    const [apiStatus, setApiStatus] = useState('Checking...');
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const checkApi = async () => {
            try {
                const response = await fetch("http://localhost:3000/settings", { method: "GET" });
                if (response.ok) {
                    setApiStatus('Online');
                    setIsOnline(true);
                } else {
                    setApiStatus('Error');
                    setIsOnline(false);
                }
            } catch (error) {
                setApiStatus('Offline');
                setIsOnline(false);
                console.log('API check failed:', error);
            }
        };

        checkApi();
        const interval = setInterval(checkApi, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='card-content'>
            <h2 className="card-title">API Status</h2>
            <div className="status-display">
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
                <span className="status-text">{apiStatus}</span>
            </div>
            <p className="status-description">
                {isOnline ? 'Server is running and responding' : 'Server is not accessible'}
            </p>
        </div>
    );
}

export default Api;