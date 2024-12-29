import { Box, Flex, Progress, Text, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const CourseCard = ({ 
  title, 
  progress, 
  level = 'BEGINNER',
  onClick 
}) => {
  const getLevelColor = (level) => {
    switch(level.toUpperCase()) {
      case 'BEGINNER':
        return 'green.400';
      case 'INTERMEDIATE':
        return 'yellow.400';
      case 'ADVANCED':
        return 'red.400';
      default:
        return 'gray.400';
    }
  };

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        bg="brand.background.secondary"
        borderColor="brand.primary"
        borderWidth="1px"
        borderRadius="md"
        p={4}
        cursor="pointer"
        onClick={onClick}
        position="relative"
        _hover={{
          boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
        }}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Text color="brand.text.primary" fontWeight="bold">
            {title}
          </Text>
          <Badge
            bg={`${getLevelColor(level)}20`}
            color={getLevelColor(level)}
            px={2}
            py={1}
            borderRadius="sm"
            fontSize="xs"
          >
            {level}
          </Badge>
        </Flex>

        <Box>
          <Text color="brand.text.secondary" fontSize="sm" mb={2}>
            Progress: {progress}%
          </Text>
          <Progress
            value={progress}
            size="sm"
            borderRadius="full"
            bg="brand.background.tertiary"
            sx={{
              '& > div': {
                background: 'linear-gradient(90deg, #00FF41 0%, #00BB41 100%)',
              },
            }}
          />
        </Box>

        {/* Matrix-style decorative elements */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          opacity={0.1}
          bgGradient="linear(to-r, transparent, brand.primary, transparent)"
          animation="pulse 2s infinite"
        />
      </Box>
    </MotionBox>
  );
};

export default CourseCard;
