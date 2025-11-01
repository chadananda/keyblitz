import React from 'react';
import { Box, Text } from 'ink';

export default function Feedback({ isCorrect, correctKeys, show }) {
  if (!show) return null;

  return (
    <Box marginTop={2}>
      {isCorrect ? (
        <Text bold color="green">✓ Correct!</Text>
      ) : (
        <Box flexDirection="column" alignItems="center">
          <Text bold color="red">✗ Wrong!</Text>
          <Text color="yellow">Correct answer: {correctKeys}</Text>
        </Box>
      )}
    </Box>
  );
}
