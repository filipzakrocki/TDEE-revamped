import React from 'react';
import {
    Container,
    Heading,
    Text,
    VStack,
    Box,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Card,
    CardBody,
    HStack,
    Link,
} from '@chakra-ui/react';
import { HelpCircle, Mail, Calculator, Scale, Database, User, Rocket, Heart } from 'lucide-react';
import { config } from '../../config';

interface FaqItem {
    question: string;
    body: string;
    icon: React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "What is this?",
        body: "This application is a calculator that finds out your average Total Daily Energy Expenditure (TDEE) by tracking your caloric consumption and weekly weight change. It relies on the principle that 7,700 kcal equals approximately 1 kg of body weight (or 3,500 kcal per 1 lb). With an accurate TDEE number, you can precisely determine your caloric requirements for effective weight loss or weight gain. The tool allows you to set your goal weight and desired weekly change rate.",
        icon: <Calculator size={18} />
    },
    {
        question: "How does it work?",
        body: "The calculator uses the energy balance equation: if you eat more calories than you burn, you gain weight; if you eat less, you lose weight. By tracking your daily calories and weekly weight changes, we can reverse-engineer your actual TDEE. For example, if you ate 2,000 kcal/day and lost 0.5 kg that week, your true TDEE was approximately 2,000 + (0.5 × 1,100) = 2,550 kcal. The more weeks of data you provide, the more accurate your TDEE becomes. The app then uses this to calculate exactly how many calories you should eat daily to reach your goal weight at your desired pace.",
        icon: <HelpCircle size={18} />
    },
    {
        question: "Should I enter today's calories or yesterday's?",
        body: "It's up to you! Both approaches will eventually average out to your current TDEE. A common method is to weigh yourself in the morning and enter the previous day's calories. This way, your morning weight reflects the result of yesterday's caloric consumption.",
        icon: <Scale size={18} />
    },
    {
        question: "How is my data saved?",
        body: "Your data is saved in two ways: (a) locally in your browser's storage, and (b) on Firebase if you're signed in. The app automatically saves your data with each change you make. Your data is tied to your account, so you can access it from any device when logged in.",
        icon: <Database size={18} />
    },
    {
        question: "Who created this?",
        body: "I'm just a developer who enjoys fitness, nutrition science, and building useful tools. I created this app to help with my own diet tracking and decided to share it with others who might find it helpful.",
        icon: <User size={18} />
    },
    {
        question: "Will there be more features?",
        body: "Yes! Planned features include: data visualization and charts, weight/calorie heatmaps, CSV export functionality, mobile-friendly improvements, and possibly MyFitnessPal integration. Stay tuned!",
        icon: <Rocket size={18} />
    },
    {
        question: "How can I support this project?",
        body: "If you find this tool helpful, you can support its development by spreading the word or providing feedback. For questions, suggestions, or anything else, feel free to reach out!",
        icon: <Heart size={18} />
    }
];

const Faq: React.FC = () => {
    return (
        <Container maxW="container.md" py={6}>
            {/* Header */}
            <VStack spacing={2} mb={8} align="start">
                <Heading size="md" color={config.black}>
                    Help & FAQ
                </Heading>
                <Text color="gray.600" fontSize="sm">
                    Everything you need to know about using the TDEE Calculator
                </Text>
            </VStack>

            {/* Quick Start Card */}
            <Card bg={config.test5} color="white" shadow="lg" mb={6}>
                <CardBody>
                    <VStack align="start" spacing={3}>
                        <Heading size="sm">Quick Start Guide</Heading>
                        <VStack align="start" spacing={2} fontSize="sm" opacity={0.95}>
                            <HStack>
                                <Box 
                                    bg="whiteAlpha.300" 
                                    borderRadius="full" 
                                    w={6} h={6} 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    1
                                </Box>
                                <Text>Go to <strong>Setup</strong> and enter your starting weight, goal, and weekly target</Text>
                            </HStack>
                            <HStack>
                                <Box 
                                    bg="whiteAlpha.300" 
                                    borderRadius="full" 
                                    w={6} h={6} 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    2
                                </Box>
                                <Text>Each day, log your <strong>weight</strong> and <strong>total calories</strong> consumed</Text>
                            </HStack>
                            <HStack>
                                <Box 
                                    bg="whiteAlpha.300" 
                                    borderRadius="full" 
                                    w={6} h={6} 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    3
                                </Box>
                                <Text>After 2-3 weeks, you'll have an accurate <strong>TDEE</strong> calculation</Text>
                            </HStack>
                            <HStack>
                                <Box 
                                    bg="whiteAlpha.300" 
                                    borderRadius="full" 
                                    w={6} h={6} 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    4
                                </Box>
                                <Text>Follow your <strong>daily target</strong> to reach your goal weight</Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* FAQ Accordion */}
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                <CardBody p={0}>
                    <Accordion allowMultiple>
                        {FAQ_ITEMS.map((item, index) => (
                            <AccordionItem 
                                key={index} 
                                border="none"
                                borderBottom={index < FAQ_ITEMS.length - 1 ? "1px solid" : "none"}
                                borderColor="gray.100"
                            >
                                <AccordionButton 
                                    py={4} 
                                    px={5}
                                    _hover={{ bg: config.test2 }}
                                    _expanded={{ bg: 'gray.50' }}
                                >
                                    <HStack flex="1" textAlign="left" spacing={3}>
                                        <Box color={config.test5}>
                                            {item.icon}
                                        </Box>
                                        <Text fontWeight="medium" fontSize="sm">
                                            {item.question}
                                        </Text>
                                    </HStack>
                                    <AccordionIcon color={config.test4} />
                                </AccordionButton>
                                <AccordionPanel pb={5} px={5} pt={2}>
                                    <Box pl={8} pr={4}>
                                        <Text fontSize="sm" color="gray.600" lineHeight="tall">
                                            {item.body}
                                        </Text>
                                    </Box>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardBody>
            </Card>

            {/* Contact Section */}
            <Card bg={config.backgroundNav} mt={6} shadow="sm">
                <CardBody>
                    <VStack spacing={2}>
                        <HStack spacing={2}>
                            <Mail size={16} color={config.test4} />
                            <Text fontSize="sm" color="gray.600">
                                Have questions or suggestions?
                            </Text>
                        </HStack>
                        <Link 
                            href="mailto:zakrofil@gmail.com" 
                            color={config.test5}
                            fontWeight="medium"
                            fontSize="sm"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            zakrofil@gmail.com
                        </Link>
                    </VStack>
                </CardBody>
            </Card>
        </Container>
    );
};

export default Faq;
