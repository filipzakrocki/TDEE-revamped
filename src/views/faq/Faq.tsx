import React from 'react';
import { Container, Card, Flex } from '@chakra-ui/react';
import { config } from '../../config';

const Faq: React.FC = () => {
    return (
        <Container minW={'100%'}>
                        FAQ - for frequently asked questions and explanation of the app

                        for now palette check
                        <Flex flexWrap={'wrap'}>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.green}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.red}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.purple}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.orange}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.test1}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.test2}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.test3}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.test5}></Card>
                            <Card style={{height: '100px', width: '300px', margin: '20px'}} bg={config.test4}></Card>

                        </Flex>


        </Container>
    );
};

export default Faq;