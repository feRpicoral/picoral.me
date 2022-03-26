import Timeline from '@components/timeline.component';
import { TimelineItem } from '@components/timeline-point.component';
import ExperienceBlob from '@icons/blobs/experience.svg';
import React from 'react';
import styled from 'styled-components';

import ContentWrapper from './content-wrapper.component';
import SectionTitle from './section-title.component';

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

const Title = styled.div`
    text-align: right;
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
            <ContentWrapper>
                <Title>
                    <SectionTitle>Experience</SectionTitle>
                </Title>

                <Timeline items={items} />
            </ContentWrapper>

            <Blob />
        </RelativeWrapper>
    );
};

export default Experience;
