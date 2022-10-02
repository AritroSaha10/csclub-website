import Head from "next/head";

export default function TitleHead({ name }: { name: string }) {
    const title = `${name} | FraserCS`;

    return (
        <Head>
            <title>{title}</title>
            <meta property="og:title" content={title} />
            <meta property="twitter:title" content={title} />
        </Head>
    )
}