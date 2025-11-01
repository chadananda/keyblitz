import React, { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { getPack } from './packs/index.js';
import { Storage } from './utils/storage.js';
import { selectNextCommand } from './core/queue.js';
import { updateCommandState, initializeCommandState, shouldReviewCommand } from './core/srs.js';
import { calculateScore, updateCombo } from './core/scorer.js';
import { getTimeLimit, createTimer } from './core/timer.js';
import { InputBuffer, parseKeyNotation } from './utils/keyparser.js';
import Header from './ui/Header.js';
import Footer from './ui/Footer.js';
import CommandCard from './ui/CommandCard.js';
import Feedback from './ui/Feedback.js';
import GroupIntro from './ui/GroupIntro.js';
import Stats from './ui/Stats.js';

export function GameController({ packId }) {
  const { exit } = useApp();
  const [pack, setPack] = useState(null);
  const [storage, setStorage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentCommand, setCurrentCommand] = useState(null);
  const [inputBuffer] = useState(() => new InputBuffer(2000));
  const [sessionState, setSessionState] = useState({
    startTime: Date.now(),
    combo: 0,
    score: 0,
    correct: 0,
    total: 0
  });
  const [screen, setScreen] = useState('game');
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, correctKeys: '' });
  const [timeRemaining, setTimeRemaining] = useState(5.0);
  
  const timerRef = useRef(null);
  
  useEffect(() => {
    try {
      const loadedPack = getPack(packId);
      setPack(loadedPack);
      
      const storageInstance = new Storage(packId);
      setStorage(storageInstance);
      
      let savedProgress = storageInstance.loadProgress();
      
      const allCommands = loadedPack.groups.flatMap(g => g.commands);
      if (!savedProgress.commandStats) {
        savedProgress.commandStats = {};
      }
      allCommands.forEach(cmd => {
        if (!savedProgress.commandStats[cmd.keys]) {
          savedProgress.commandStats[cmd.keys] = initializeCommandState(cmd);
        }
      });
      
      setProgress(savedProgress);
      storageInstance.saveProgress(savedProgress);
      
      selectNext(savedProgress, allCommands);
    } catch (error) {
      console.error('Failed to initialize game:', error);
      exit();
    }
  }, [packId, exit]);
  
  const selectNext = (currentProgress, commands) => {
    const commandsWithState = commands.map(cmd => ({
      ...cmd,
      ...(currentProgress.commandStats[cmd.keys] || initializeCommandState(cmd))
    }));
    
    const next = selectNextCommand(commandsWithState, 0);
    if (next) {
      setCurrentCommand(next);
      const timeLimit = getTimeLimit(next);
      setTimeRemaining(timeLimit);
      
      if (timerRef.current) {
        timerRef.current.stop();
      }
      timerRef.current = createTimer(timeLimit, 
        (remaining) => setTimeRemaining(remaining),
        () => handleTimeout()
      );
      timerRef.current.start();
    }
  };
  
  const handleTimeout = () => {
    handleAnswer(false);
  };
  
  const handleAnswer = (isCorrect) => {
    if (!currentCommand || !storage || !progress) return;
    
    if (timerRef.current) {
      timerRef.current.stop();
    }
    
    const updatedCommand = updateCommandState(currentCommand, isCorrect);
    const newProgress = { ...progress };
    newProgress.commandStats[currentCommand.keys] = updatedCommand;
    
    const newCombo = updateCombo(isCorrect, sessionState.combo);
    const points = isCorrect ? calculateScore(timeRemaining, getTimeLimit(currentCommand), currentCommand.level, sessionState.combo) : 0;
    
    setSessionState({
      ...sessionState,
      combo: newCombo,
      score: sessionState.score + points,
      correct: sessionState.correct + (isCorrect ? 1 : 0),
      total: sessionState.total + 1
    });
    
    newProgress.globalStats = {
      ...newProgress.globalStats,
      totalCommands: (newProgress.globalStats?.totalCommands || 0) + 1,
      totalScore: (newProgress.globalStats?.totalScore || 0) + points,
      bestCombo: Math.max(newProgress.globalStats?.bestCombo || 0, newCombo),
      totalTime: Date.now() - sessionState.startTime
    };
    
    setProgress(newProgress);
    storage.saveProgress(newProgress);
    
    setFeedback({ 
      show: true, 
      isCorrect, 
      correctKeys: currentCommand.keys 
    });
    
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false, correctKeys: '' });
      
      const allCommands = pack.groups.flatMap(g => g.commands);
      selectNext(newProgress, allCommands);
    }, isCorrect ? 500 : 1000);
  };
  
  useInput((input, key) => {
    if (key.escape || input === 'q') {
      exit();
    } else if (input === 's') {
      setScreen('stats');
    } else if (screen === 'stats' && key.escape) {
      setScreen('game');
    } else if (screen === 'game' && currentCommand) {
      inputBuffer.addKey(input);
      
      if (inputBuffer.matches(currentCommand.keys)) {
        handleAnswer(true);
        inputBuffer.clear();
      }
    }
  });
  
  if (!pack || !progress) {
    return <Text>Loading...</Text>;
  }
  
  if (screen === 'stats') {
    return <Stats progress={progress} commands={pack.groups.flatMap(g => g.commands)} onClose={() => setScreen('game')} />;
  }
  
  const accuracy = sessionState.total > 0 ? Math.round((sessionState.correct / sessionState.total) * 100) : 100;
  const sessionTime = Date.now() - sessionState.startTime;
  
  const targetText = currentCommand && pack.targetGenerators?.[currentCommand.targetType]
    ? pack.targetGenerators[currentCommand.targetType]()
    : '';
  
  return (
    <Box flexDirection="column">
      <Header 
        packName={pack.name}
        currentGroup={progress.currentGroup}
        totalGroups={pack.groups.length}
        sessionTime={sessionTime}
        combo={sessionState.combo}
      />
      
      <Box flexDirection="column" flexGrow={1} justifyContent="center" alignItems="center">
        {currentCommand && (
          <>
            <CommandCard command={currentCommand} targetText={targetText} />
            <Box marginTop={1}>
              <Text color="yellow">⏱  {timeRemaining.toFixed(1)}s remaining</Text>
            </Box>
          </>
        )}
        
        <Feedback 
          isCorrect={feedback.isCorrect}
          correctKeys={feedback.correctKeys}
          show={feedback.show}
        />
      </Box>
      
      <Footer 
        accuracy={accuracy}
        score={sessionState.score}
        masteredCount={Object.values(progress.commandStats).filter(c => c.level === 5).length}
        totalCommands={pack.groups.flatMap(g => g.commands).length}
      />
    </Box>
  );
}

export function startGame(packId) {
  return render(<GameController packId={packId} />);
}
