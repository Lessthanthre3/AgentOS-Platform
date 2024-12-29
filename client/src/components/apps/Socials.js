import { Box, VStack, HStack, Text, Link, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaTwitter, FaTelegram, FaExternalLinkAlt } from 'react-icons/fa';

const SocialLink = ({ icon, label, href }) => (
  <Link
    href={href}
    isExternal
    _hover={{ textDecoration: 'none' }}
    width="100%"
  >
    <HStack
      p={4}
      spacing={4}
      borderRadius="md"
      transition="all 0.2s"
      _hover={{
        bg: 'whiteAlpha.100',
        transform: 'translateX(5px)',
      }}
    >
      <Icon as={icon} boxSize={6} color="green.400" />
      <Text flex="1" color="white">{label}</Text>
      <Icon as={FaExternalLinkAlt} color="green.400" opacity={0.5} />
    </HStack>
  </Link>
);

const Socials = () => {
  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" color="green.300" fontWeight="bold" mb={4}>
          Connect With Us
        </Text>

        <VStack
          spacing={2}
          align="stretch"
          borderRadius="lg"
          bg="gray.800"
          borderWidth="1px"
          borderColor="green.500"
          overflow="hidden"
        >
          <SocialLink
            icon={FaTwitter}
            label="Follow us on X (Twitter)"
            href="https://x.com/aiagentsmith"
          />
          <Box borderBottom="1px solid" borderColor="whiteAlpha.100" />
          <SocialLink
            icon={FaTelegram}
            label="Join our Telegram"
            href="https://t.me/AgentSmithAI"
          />
        </VStack>

        <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
          Stay updated with the latest news and announcements
        </Text>
      </VStack>
    </Box>
  );
};

export default Socials;
