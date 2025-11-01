import React, { useState, useEffect } from 'react';
import { Box, useInput, useApp } from 'ink';
import PackSelector from './PackSelector.js';
import Header from './Header.js';
import Footer from './Footer.js';
import CommandCard from './CommandCard.js';
import Feedback from './Feedback.js';
import GroupIntro from './GroupIntro.js';
import Stats from './Stats.js';

export default function App({ packId, onQuit }) {
  const { exit } = useApp();
  const [screen, setScreen] = useState(packId ? 'game' : 'selector');
  const [selectedPack, setSelectedPack] = useState(packId);
  const [gameState, setGameState] = useState(null);

  const handlePackSelect = (id) => {
    setSelectedPack(id);
    setScreen('game');
    // Initialize game state here
  };

  const handleQuit = () => {
    onQuit?.();
    exit();
  };

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      handleQuit();
    }
  });

  if (screen === 'selector') {
    return <PackSelector onSelect={handlePackSelect} />;
  }

  if (screen === 'game') {
    return (
      <Box flexDirection="column">
        <Header
          packName={selectedPack}
          currentGroup={0}
          totalGroups={1}
          sessionTime={0}
          combo={0}
        />
        <Box>
          {/* Game content here - will be filled by game controller */}
        </Box>
        <Footer
          accuracy={100}
          score={0}
          masteredCount={0}
          totalCommands={10}
        />
      </Box>
    );
  }

  return null;
}
