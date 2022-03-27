import RawBlob from '@icons/blobs/technologies.svg';
import React from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';

import Card, { CardProps } from './card.component';
import ContentWrapper from './content-wrapper.component';
import SectionTitle from './section-title.component';
import SliderArrow from './slider-arrow.component';

const RelativeWrapper = styled.div`
    position: relative;
`;

const Blob = styled(RawBlob)`
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
`;

const StyledSlider = styled(Slider)`
    margin-top: 100px;

    .slick-slide,
    .slick-slide img {
        height: 286px;
    }

    .slick-dots {
        height: 5px;
    }

    .slick-list {
        // 9% is the magic number to show only three cards at any given moment
        // while on center mode
        padding: 0 9% !important;
    }

    .slick-next::before,
    .slick-prev::before {
        display: none;
    }
`;

const Technologies: React.FC = () => {
    const cards: CardProps[] = [
        {
            title: 'Angular',
            description:
                'I used Angular & AngularJS during my time at Poatek. During that year, I was the main developer at the creation of a new dashboard for a capital management firm.',
            logoPath: '/logos/angular.svg',
            logoSize: {
                width: 65,
                height: 69
            }
        },
        {
            title: 'Next',
            description:
                'For the most time I’ve been using React, I’ve used Next as well. I use this framework in most of my projects; it was also used in the frontend of Stockvio. ',
            logoPath: '/logos/next.svg',
            logoSize: {
                width: 90,
                height: 54
            }
        },
        {
            title: 'React',
            description:
                'I have 3+ years of experience with React. From simple UIs like this one to the most complex applications, React is always my to-go frontend tool.',
            logoPath: '/logos/react.svg',
            logoSize: {
                width: 70,
                height: 63
            }
        },
        {
            title: 'Nest',
            description:
                'After years developing APIs directly with ExpressJS, I’ve migrated to NestJS. With 1+ year of experience, Nest is my favorite backend framework.',
            logoPath: '/logos/nest.svg',
            logoSize: {
                width: 70,
                height: 70
            }
        },
        {
            title: 'Node',
            description:
                'For the 4+ years I have been developing web apps, NodeJS was always my choice for backend.',
            logoPath: '/logos/node.svg',
            logoSize: {
                width: 70,
                height: 63
            }
        },
        {
            title: 'Postgres',
            description:
                'Since I’ve started using the Prisma ORM - around 1.5+ years from now - Postgres started being my database of choice.',
            logoPath: '/logos/postgres.svg',
            logoSize: {
                width: 65,
                height: 73
            }
        },
        {
            title: 'MongoDB',
            description:
                'During the year I worked at Poatek, I used MongoDB to perform queries with advance aggregation pipelines. I’ve also used Mongo before in some personal projects.',
            logoPath: '/logos/mongo.svg',
            logoSize: {
                width: 120,
                height: 60
            }
        }
    ];

    return (
        <RelativeWrapper>
            <ContentWrapper id={'technologies'}>
                <SectionTitle>Technologies</SectionTitle>
                <StyledSlider
                    centerMode={true}
                    infinite={true}
                    dots={true}
                    slidesToShow={3}
                    speed={500}
                    swipeToSlide={true}
                    initialSlide={2}
                    prevArrow={<SliderArrow type={'prev'} />}
                    nextArrow={<SliderArrow type={'next'} />}
                >
                    {cards.map(card => (
                        <Card
                            title={card.title}
                            description={card.description}
                            logoPath={card.logoPath}
                            logoSize={card.logoSize}
                            key={card.title}
                        />
                    ))}
                </StyledSlider>
            </ContentWrapper>
            <Blob />
        </RelativeWrapper>
    );
};

export default Technologies;
