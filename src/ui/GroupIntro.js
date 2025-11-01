import React from 'react';
import { Box, Text } from 'ink';

export default function GroupIntro({ group, onContinue }) {
  return (
    <Box flexDirection="column" alignItems="center" padding={4}>
      <Box marginBottom={2}>
        <Text bold color="cyan">{group.name}</Text>
      </Box>
      <Box marginBottom={3}>
        <Text color="gray">{group.description}</Text>
      </Box>
      <Box marginBottom={2}>
        <Text color="yellow">{group.commands.length} commands to master</Text>
      </Box>
      <Box>
        <Text dimColor>Press any key to continue...</Text>
      </Box>
    </Box>
  );
}
