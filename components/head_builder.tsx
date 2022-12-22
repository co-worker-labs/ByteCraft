import Head from "next/head";
import { ToolData } from "../libs/tools";

export function ToolPageHeadBuilder({ data }: { data: ToolData }) {
    return (
        <Head>
            <title>{data.title}</title>
            <meta name="description" content={data.description} />
            <meta name='keyword' content={data.keywords.join(',')} />
        </Head>
    )
}