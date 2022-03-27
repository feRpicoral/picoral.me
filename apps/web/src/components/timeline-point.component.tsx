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

const IconWrapper = styled.div`
    position: relative;
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

// TODO: Add lines between points in the timeline
const Line = styled.div`
    position: absolute;
    top: 45%;
    left: 65%;
    min-width: 200px;
    border-bottom: 1px solid black;
`;

export interface TimelinePointProps {
    item: TimelineItem;
    nextItem?: TimelineItem;
}

const TimelinePoint: React.FC<TimelinePointProps> = ({ item, nextItem }) => {
    const month = item.date.toLocaleString('en-us', { month: 'long' });

    const daysToNextItem =
        nextItem !== undefined
            ? // @ts-ignore Date.prototype.valueOf() is called by JS for us here
              Math.abs((item.date - nextItem.date) / 86_400_000)
            : undefined;

    return (
        <Wrapper>
            <IconWrapper>
                <Image
                    src={'/timeline-point.svg'}
                    width={30}
                    height={30}
                    alt={''}
                />
                {/* <Line />*/}
            </IconWrapper>

            <Month>
                {month} {item.date.getFullYear()}
            </Month>
            <Description>{item.description}</Description>
        </Wrapper>
    );
};

export default TimelinePoint;
