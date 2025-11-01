import React from 'react';
import { Box, Text } from 'ink';

export default function Stats({ progress, commands, onClose }) {
  const commandStats = progress?.commandStats || {};
  const globalStats = progress?.globalStats || {};

  const masteredCommands = Object.values(commandStats).filter(c => c.level === 5).length;
  const totalCommands = commands.length;
  const averageLevel = totalCommands > 0
    ? Object.values(commandStats).reduce((sum, c) => sum + (c.level || 0), 0) / totalCommands
    : 0;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <Box flexDirection="column" padding={2}>
      <Box marginBottom={2}>
        <Text bold color="cyan">Statistics</Text>
      </Box>
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="yellow">Overall Progress</Text>
        <Text>Total Commands: {globalStats.totalCommands || 0}</Text>
        <Text>Total Score: {globalStats.totalScore || 0}</Text>
        <Text>Best Combo: {globalStats.bestCombo || 0}</Text>
        <Text>Total Time: {formatTime(globalStats.totalTime || 0)}</Text>
      </Box>
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="magenta">Mastery</Text>
        <Text>Mastered: {masteredCommands}/{totalCommands}</Text>
        <Text>Average Level: {averageLevel.toFixed(1)}</Text>
        <Text>Progress: {totalCommands > 0 ? Math.round((masteredCommands / totalCommands) * 100) : 0}%</Text>
      </Box>
      <Box marginTop={2}>
        <Text dimColor>Press ESC to return to game</Text>
      </Box>
    </Box>
  );
}
