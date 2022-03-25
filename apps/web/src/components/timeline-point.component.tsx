import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

export interface TimelineItem {
    date: Date;
    description: string;
}

const Wrapper = styled.div`
    display: inline-flex;
    flex-direction: column;
    text-align: center;
`;

const Month = styled.span`
    ${props => props.theme.text.body.sm.xlight}
    display: inline-block;
    margin: 8px 0 4px 0;
`;

const Description = styled.span`
    ${props => props.theme.text.body.sm.regular}
    display: inline-block;
    white-space: pre-line;
`;

const TimelinePoint: React.FC<{ item: TimelineItem }> = ({ item }) => {
    const month = item.date.toLocaleString('en-us', { month: 'long' });

    return (
        <Wrapper>
            <Image
                src={'/timeline-point.svg'}
                width={30}
                height={30}
                alt={''}
            />
            <Month>
                {month} {item.date.getFullYear()}
            </Month>
            <Description>{item.description}</Description>
        </Wrapper>
    );
};

export default TimelinePoint;
