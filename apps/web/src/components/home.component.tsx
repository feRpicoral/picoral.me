import LaptopBlobRaw from '@icons/blobs/laptop.svg';
import TopLeftBlobRaw from '@icons/blobs/top-left.svg';
import LaptopRaw from '@icons/computer.svg';
import React from 'react';
import styled from 'styled-components';

import ContentWrapper from './content-wrapper.component';
import Navbar from './navbar.component';

const TitleWrapper = styled.div`
    margin-top: 200px;
`;

const Title = styled.h1`
    font-family: 'Comfortaa', cursive;
    font-style: normal;
    font-weight: 300;
    font-size: 64px;
    line-height: 71px;
    margin: 0;
`;

const SubTitle = styled.h3`
    ${props => props.theme.text.body.xl.xlight}
    margin: 10px 0 0 0;
`;

const TopLeftBlob = styled(TopLeftBlobRaw)`
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
`;

const LaptopBlob = styled(LaptopBlobRaw)`
    position: absolute;
    right: 0;
    z-index: -2;
`;

const Laptop = styled(LaptopRaw)`
    width: 500px;
    margin-top: 60%;
`;

const LaptopContainer = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    z-index: -1;
`;

const Home: React.FC = () => (
    <ContentWrapper>
        <Navbar />
        <TitleWrapper>
            <Title>Hi, I&apos;m Picoral</Title>
            <SubTitle>I enjoy building things</SubTitle>
        </TitleWrapper>

        <TopLeftBlob />

        <LaptopContainer>
            <LaptopBlob />
            <Laptop />
        </LaptopContainer>
    </ContentWrapper>
);

export default Home;
