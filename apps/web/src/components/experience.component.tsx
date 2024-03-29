import ExperienceBlob from '@icons/blobs/experience.svg';
import React from 'react';
import styled from 'styled-components';

import ContentWrapper from './content-wrapper.component';
import SectionTitle from './section-title.component';
import Timeline from './timeline.component';
import { TimelineItem } from './timeline-point.component';

const RelativeWrapper = styled.div`
    position: relative;
    margin-top: 160px;
`;

const Blob = styled(ExperienceBlob)`
    position: absolute;
    z-index: -1;
    right: 0;
    top: -250px;
`;

const Title = styled(SectionTitle)`
    text-align: right;
    width: 100%;
`;

const Experience: React.FC = () => {
    const items: TimelineItem[] = [
        {
            date: new Date(2020, 10),
            description: 'Founded\nStockvio'
        },
        {
            date: new Date(2021, 5),
            description: 'Joined\nPoatek'
        },
        {
            date: new Date(2022, 1),
            description: 'Stepped\ndown as CEO\nof Stockvio'
        },
        {
            date: new Date(2022, 5),
            description: 'Left\nPoatek'
        },
        {
            date: new Date(2022, 7),
            description: 'Started\nstudying at\nCU Boulder'
        }
    ];

    return (
        <RelativeWrapper>
            <ContentWrapper id={'experience'}>
                <Title>Experience</Title>

                <Timeline items={items} />
            </ContentWrapper>

            <Blob />
        </RelativeWrapper>
    );
};

export default Experience;
