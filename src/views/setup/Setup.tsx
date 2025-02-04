import React from 'react';

const Setup: React.FC = () => {
    return (
        <div>
            Setup - Maybe this is where all the setup will happen:
            <ul>
                <li>Start date</li>
                <li>Goal weight</li>
                <li>Goal rate - weekly weight change</li>
                <li>show required daily kcal change</li>
                <li>Calculate #last weeks</li>
            </ul>
            <div>Extras?</div>
            <ul>
                <li>Setup Tdee?</li>
            </ul>
        </div>
    );
};

export default Setup;