import React from 'react';
import { Grid, GridItem, Box, Container } from '@chakra-ui/react';

const Analysis: React.FC = () => {
    return (
        <Container minW={'100%'}>
        <Grid templateColumns="repeat(2, 1fr)" gap={6} h={'100%'}>
            <GridItem >
                <Box bg="purple.200" h="100%">
                    Weekly heatmap goes here, maybe with modes to see particular months / weeks / quarters. Worst offending weekdays etc.
                </Box>
            </GridItem>
            <GridItem >
                <Box bg="blue.100" h="33%">
                    Linear chart of weight (vs projection?) goes here
                </Box>
                <Box bg="red.100" h="33%" mt={4}>
                    Linear chart of kcal goes here
                </Box>
                <Box bg="yellow.100" h="33%" mt={4}>
                    Linear chart of TDEE goes here
                </Box>
            </GridItem>
        </Grid>
        </Container>
    );
};

export default Analysis;

// views in weekly/daily mode for charts?