import Timeline from '@components/timeline.component';
import { TimelineItem } from '@components/timeline-point.component';
import ExperienceBlob from '@icons/blobs/experience.svg';
import React from 'react';
import styled from 'styled-components';

import ContentWrapper from './content-wrapper.component';
import SectionTitle from './section-title.component';

const RelativeWrapper = styled.div`
    //margin-top: -100px;
    position: relative;
`;

const Blob = styled(ExperienceBlob)`
    position: absolute;
    z-index: -1;
    right: 0;
`;

const Title = styled.div`
    span {
        margin-top: 250px;
        float: right;
    }
`;
const Experience: React.FC = () => {
    const items: TimelineItem[] = [
        {
            date: new Date(2020, 10),
            description: 'Founded\nStockvio'
        },
        {
            date: new Date(2021, 5),
            description: 'Joined Poatek'
        },
        {
            date: new Date(2022, 1),
            description: 'Stepped down as CEO of Stockvio'
        },
        {
            date: new Date(2022, 5),
            description: 'Left Poatek'
        },
        {
            date: new Date(2022, 7),
            description: 'Started studying at CU Boulder'
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
