import RawBlob from '@icons/blobs/about-me.svg';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import ContentWrapper from './content-wrapper.component';
import SectionTitle from './section-title.component';

const RelativeWrapper = styled.div`
    margin-top: 300px;
    position: relative;
`;

const Blob = styled(RawBlob)`
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
`;

const Text = styled.p`
    ${props => props.theme.text.body.xl.light}
    margin-top: 0;
    max-width: 882px;

    &:not(:last-of-type) {
        margin-bottom: 40px;
    }
`;

// for some reason styled(SectionTitle) is not working
// thus I went with this wrapper for now
const Title = styled.div`
    span {
        margin-bottom: 50px;
    }
`;

const AboutMe: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ref = useRef<HTMLDivElement>(null!);

    // calculates the needed offset to push the content
    // outside the viewport and applies it
    useEffect(() => {
        const el = ref.current;
        const offset = window.innerHeight - el.getBoundingClientRect().y;

        // TODO: Uncomment this and fix bug where scroll is added on top of current
        //  scroll if the user refreshes the page
        // el.style.paddingTop = `${offset}px`;
    }, []);

    return (
        <RelativeWrapper>
            <ContentWrapper>
                <Title ref={ref}>
                    <SectionTitle>About Me</SectionTitle>
                </Title>

                <Text>
                    I’m a Brazilian full-stack web developer with vast
                    experience in multiple technologies, currently studying
                    Computer Science, BS in the University of Colorado -
                    Boulder.
                </Text>
                <Text>
                    As an international student in the middle of the COVID-19
                    pandemic, I had to defer my enrolment with CU Boulder for
                    two years. In the meantime, I co-founded and was the CEO of
                    a startup called Stockvio.
                </Text>
                <Text>
                    At Stockvio, we developed an algorithm to automatically
                    calculate your taxes over capital gains in the Brazilian
                    stock market, a service that wasn’t available so far.
                </Text>
            </ContentWrapper>

            <Blob />
        </RelativeWrapper>
    );
};

export default AboutMe;
