import AboutMe from '@components/about-me.component';
import Home from '@components/home.component';
import { NextPage } from 'next';
import Head from 'next/head';

const Index: NextPage = () => (
    <>
        <Head>
            <title>&#128187; &nbsp; Picoral</title>
        </Head>

        <Home />
        <AboutMe />
    </>
);

export default Index;
