import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { listPacks } from '../packs/index.js';

export default function PackSelector({ onSelect }) {
  const packs = listPacks();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(packs.length - 1, selectedIndex + 1));
    } else if (key.return) {
      onSelect(packs[selectedIndex].id);
    }
  });

  return (
    <Box flexDirection="column" padding={2}>
      <Text bold color="cyan">Select a keybinding pack to train:</Text>
      <Box flexDirection="column" marginTop={1}>
        {packs.map((pack, index) => (
          <Box key={pack.id} marginY={0}>
            <Text color={index === selectedIndex ? 'cyan' : 'white'}>
              {index === selectedIndex ? '▶ ' : '  '}
              <Text bold>{pack.name}</Text> - {pack.description} ({pack.commandCount} commands)
            </Text>
          </Box>
        ))}
      </Box>
      <Text dimColor marginTop={1}>Use ↑↓ arrows to select, Enter to confirm</Text>
    </Box>
  );
}
