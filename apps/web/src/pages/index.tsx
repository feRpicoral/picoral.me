import Navbar from '@components/navbar.component';
import LaptopBlobRaw from '@icons/blobs/laptop.svg';
import TopLeftBlobRaw from '@icons/blobs/top-left.svg';
import LaptopRaw from '@icons/computer.svg';
import { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';

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

const ContentWrapper = styled.div`
    margin: 95px auto;
    max-width: 1220px;
`;

const Home: NextPage = () => (
    <>
        <Head>
            <title>&#128187; &nbsp; Picoral</title>
        </Head>

        <ContentWrapper>
            <Navbar />
        </ContentWrapper>

        <TopLeftBlob />

        <LaptopContainer>
            <LaptopBlob />
            <Laptop />
        </LaptopContainer>
    </>
);

export default Home;
