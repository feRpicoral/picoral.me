import TimelinePoint, {
    TimelineItem
} from '@components/timeline-point.component';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin-top: 100px;
`;

const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
    const x = 1;

    return (
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
};

export default Timeline;
