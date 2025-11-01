import React from 'react';
import { Box, Text } from 'ink';

export default function Footer({ accuracy, score, masteredCount, totalCommands }) {
  return (
    <Box borderStyle="single" borderColor="cyan" padding={1} marginTop={1}>
      <Box justifyContent="space-between" width="100%">
        <Text color="green">Accuracy: {accuracy}%</Text>
        <Text color="yellow">Score: {score}</Text>
        <Text color="magenta">Mastered: {masteredCount}/{totalCommands}</Text>
      </Box>
    </Box>
  );
}
