import TimelinePoint, {
    TimelineItem
} from '@components/timeline-point.component';
import React from 'react';

const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
    const x = 1;

    return <TimelinePoint item={items[0]} />;
};

export default Timeline;
