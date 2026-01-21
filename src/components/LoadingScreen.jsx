import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner-inner"></div>
                </div>
                <div className="loading-text">
                    <span className="letter">C</span>
                    <span className="letter">o</span>
                    <span className="letter">n</span>
                    <span className="letter">s</span>
                    <span className="letter">i</span>
                    <span className="letter">s</span>
                    <span className="letter">t</span>
                    <span className="letter">e</span>
                    <span className="letter">n</span>
                    <span className="letter">c</span>
                    <span className="letter">y</span>
                </div>
                <p className="loading-subtext">Preparing your productivity dashboard...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
