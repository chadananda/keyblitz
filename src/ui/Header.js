import React from 'react';
import { Box, Text } from 'ink';

export default function Header({ packName, currentGroup, totalGroups, sessionTime, combo }) {
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box borderStyle="single" borderColor="cyan" padding={1}>
      <Box flexDirection="column" width="100%">
        <Box justifyContent="space-between">
          <Text bold color="cyan">{packName}</Text>
          <Text color="gray">Group {currentGroup + 1}/{totalGroups}</Text>
        </Box>
        <Box justifyContent="space-between" marginTop={1}>
          <Text color="yellow">⏱  {formatTime(sessionTime)}</Text>
          {combo > 0 && (
            <Text bold color="magenta">🔥 {combo}x Combo</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
