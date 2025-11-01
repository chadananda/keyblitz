import React from 'react';
import { Box, Text } from 'ink';

export default function CommandCard({ command, targetText }) {
  if (!command) return null;

  return (
    <Box flexDirection="column" alignItems="center" padding={2}>
      <Box marginBottom={1}>
        <Text bold color={command.color || 'white'}>{command.concept}</Text>
      </Box>
      <Box marginBottom={2}>
        <Text bold color="cyan">Press: {command.keys}</Text>
      </Box>
      {targetText && (
        <Box borderStyle="round" padding={1} borderColor="gray">
          <Text color="gray">{targetText}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color="gray" dimColor>Level {command.level} • {command.successes || 0}/3 successes</Text>
      </Box>
    </Box>
  );
}
