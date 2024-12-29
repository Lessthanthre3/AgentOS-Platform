import { Box, HStack, IconButton, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaWindowMinimize, FaWindowMaximize, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useWindowManager from '../../hooks/useWindowManager';

const Window = ({ id, title, icon: Icon, children, position, size, zIndex, isMinimized }) => {
  const { removeWindow, minimizeWindow, updateWindowPosition, updateWindowSize, focusWindow } = useWindowManager();
  const windowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [localPosition, setLocalPosition] = useState(position);
  const [localSize, setLocalSize] = useState(size);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousState, setPreviousState] = useState(null);

  useEffect(() => {
    if (!isDragging) {
      updateWindowPosition(id, localPosition);
    }
  }, [localPosition, isDragging]);

  useEffect(() => {
    if (!isResizing) {
      updateWindowSize(id, localSize);
    }
  }, [localSize, isResizing]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-titlebar')) {
      if (e.detail === 2) {
        // Double click on title bar
        toggleMaximize();
      } else {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - localPosition.x,
          y: e.clientY - localPosition.y,
        });
      }
      focusWindow(id);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setLocalPosition({
        x: Math.max(0, e.clientX - dragOffset.x),
        y: Math.max(0, e.clientY - dragOffset.y),
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      setLocalSize({
        width: Math.max(300, resizeStart.width + deltaX),
        height: Math.max(200, resizeStart.height + deltaY),
      });
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous position and size
      if (previousState) {
        setLocalPosition(previousState.position);
        setLocalSize(previousState.size);
        setPreviousState(null);
      }
    } else {
      // Save current state before maximizing
      setPreviousState({
        position: { ...localPosition },
        size: { ...localSize }
      });
      setLocalPosition({ x: 0, y: 0 });
      setLocalSize({
        width: window.innerWidth,
        height: window.innerHeight - 48, // Account for taskbar
      });
    }
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove]);

  if (isMinimized) return null;

  return (
    <Box
      as={motion.div}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.1 }}
      ref={windowRef}
      position="absolute"
      left={localPosition.x}
      top={localPosition.y}
      width={localSize.width}
      height={localSize.height}
      bg="gray.800"
      borderRadius="md"
      boxShadow="0 0 20px rgba(0, 255, 0, 0.1)"
      border="1px solid"
      borderColor="green.500"
      zIndex={zIndex}
      overflow="hidden"
    >
      {/* Window Title Bar */}
      <HStack
        className="window-titlebar"
        px={4}
        height="32px"
        bg="gray.900"
        onMouseDown={handleMouseDown}
        cursor="move"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="green.500"
      >
        <HStack spacing={2}>
          {Icon && <Icon size={14} color="#48BB78" />}
          <Text fontSize="sm" fontWeight="medium" color="green.300">
            {title}
          </Text>
        </HStack>
        <HStack spacing={1}>
          <IconButton
            icon={<FaWindowMinimize />}
            aria-label="Minimize"
            size="xs"
            variant="ghost"
            colorScheme="green"
            onClick={() => minimizeWindow(id)}
          />
          <IconButton
            icon={<FaWindowMaximize />}
            aria-label="Maximize"
            size="xs"
            variant="ghost"
            colorScheme="green"
            onClick={toggleMaximize}
          />
          <IconButton
            icon={<FaTimes />}
            aria-label="Close"
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={() => removeWindow(id)}
          />
        </HStack>
      </HStack>

      {/* Window Content */}
      <Box p={4} height="calc(100% - 32px)" overflow="auto">
        {children}
      </Box>

      {/* Resize Handle */}
      {!isMaximized && (
        <Box
          position="absolute"
          right={0}
          bottom={0}
          width="15px"
          height="15px"
          cursor="se-resize"
          _before={{
            content: '""',
            position: 'absolute',
            right: '3px',
            bottom: '3px',
            width: '6px',
            height: '6px',
            borderRight: '2px solid',
            borderBottom: '2px solid',
            borderColor: 'green.500',
            opacity: 0.5,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            setResizeStart({
              x: e.clientX,
              y: e.clientY,
              width: localSize.width,
              height: localSize.height,
            });
          }}
        />
      )}
    </Box>
  );
};

export default Window;
