import React from 'react';
import MagicPictureTalk from './MagicPictureTalk';
import SoundPop from './SoundPop';
import CalmBubbles from './CalmBubbles';
import GoodChoiceCity from './GoodChoiceCity';
import TracePath from './TracePath';

import { GameEngine } from './GameEngine';

const GameLauncher = ({ gameType, onComplete, onExit }) => {
    const getGameContent = () => {
        switch (gameType) {
            case 'picture-talk':
                return <MagicPictureTalk onComplete={onComplete} onExit={onExit} />;
            case 'sound-pop':
                return <SoundPop onComplete={onComplete} onExit={onExit} />;
            case 'calm-bubbles':
                return <CalmBubbles onExit={onExit} />;
            case 'aba-choice':
                return <GoodChoiceCity onComplete={onComplete} onExit={onExit} />;
            case 'ot-trace':
                return <TracePath onComplete={onComplete} onExit={onExit} />;
            default:
                return (
                    <div className="text-center">
                        <p className="text-neutral-500">Game type "{gameType}" not implemented yet.</p>
                        <button onClick={onExit} className="mt-4 text-primary-600 font-bold">Go Back</button>
                    </div>
                );
        }
    };

    const getTitle = () => {
        switch (gameType) {
            case 'picture-talk': return 'Magic Picture Talk';
            case 'sound-pop': return 'Sound Pop Adventure';
            case 'calm-bubbles': return 'Calm Bubble World';
            case 'aba-choice': return 'Good Choice City';
            case 'ot-trace': return 'Tracing Fun';
            default: return 'NeuroBridge Play';
        }
    };

    return (
        <GameEngine title={getTitle()} onExit={onExit}>
            {getGameContent()}
        </GameEngine>
    );
};

export default GameLauncher;
