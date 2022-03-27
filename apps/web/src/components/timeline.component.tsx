import React from 'react';
import styled from 'styled-components';

import TimelinePoint, { TimelineItem } from './timeline-point.component';

const Wrapper = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin: 200px 0;
`;

const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => (
    <Wrapper>
        {items.map((item, i) => (
            <TimelinePoint
                key={item.description}
                item={item}
                nextItem={items[i + 1]}
            />
        ))}
    </Wrapper>
);

export default Timeline;
