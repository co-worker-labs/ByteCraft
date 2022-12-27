import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useState } from "react";
import { ToolPageHeadBuilder } from "../../components/head_builder";
import Layout from "../../components/layout";
import { showToast } from "../../libs/toast";
import { findTool, ToolData } from "../../libs/tools";
import styles from '../../styles/text/Analytic.module.css'

function TextAnalyticPage({ toolData }: InferGetStaticPropsType<typeof getStaticProps>) {
    const [content, setContent] = useState<string>('');
    const [delimiter, setDelimiter] = useState<string>('');
    const [delimiterCustomFlag, setDelimiterCustomFlag] = useState<boolean>(false);
    const [kilobytesConversion, setKilobytesConversion] = useState<number>(1024);

    function getLines(content: string): string[] {
        return content.split(/\r|\r\n|\n/);
    }

    function getWords(line: string): string[] {
        line = line.trim();
        if (line.length == 0) {
            return [];
        }
        if (delimiterCustomFlag) {
            let myDelimiter = delimiter.trim();
            return line.split(myDelimiter);
        } else {
            return line.split(/\s/);
        }
    }

    function removeEmptyWords(words: string[]): string[] {
        return words.filter(v => v.length != 0);
    }

    function countWords(content: string): number {
        const lines = getLines(content);
        let sum = 0;
        for (var i = 0; i < lines.length; i++) {
            let words = getWords(lines[i]);
            words = removeEmptyWords(words);
            sum += words.length;
        }
        return sum;
    }

    function countLines(content: string, removeEmpty: boolean): number {
        let lines = getLines(content);
        if (removeEmpty) {
            lines = lines.filter(v => v.trim().length > 0);
        }
        return lines.length;
    }

    function countCharacters(content: string): number {
        return content.length;
    }
    function countWordCharacters(content: string): number {
        let sum = 0;
        for (var i = 0; i < content.length; i++) {
            const char = content.charAt(i);
            if (char != ' ' && char != '\r' && char != '\n') {
                sum++;
            }
        }
        return sum;
    }
    function countAlphabets(content: string): number {
        let sum = 0;
        for (var i = 0; i < content.length; i++) {
            const char = content.charAt(i);
            if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
                sum++;
            }
        }
        return sum;
    }

    function formatBytes(bytes: number, decimals = 4) {
        if (!+bytes) return '0 Bytes'

        const k = kilobytesConversion
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    function countLength(content: string): string {
        const length = Buffer.byteLength(content, 'utf-8');
        return formatBytes(length);
    }

    return (
        <>
            <ToolPageHeadBuilder data={toolData} />
            <Layout title={toolData.title}>
                <div className="container py-lg-5 py-3">
                    <div>
                        <span className="h4">Analyze Text Content Instantly</span>
                    </div>
                    <div className="mt-3">
                        <label htmlFor="exampleFormControlTextarea1" className="form-label">Input Content</label>
                        <textarea className="form-control" id="exampleFormControlTextarea1" rows={10} value={content} onChange={(e) => {
                            setContent(e.target.value);
                        }}></textarea>
                    </div>
                    <section id="settings" className="card mt-4">
                        <div className="card-body">
                            <span className='fs-4 fw-bold mt-2'>Customize your analyze</span>
                            <div className='w-100 pt-1 mt-1 bg-light'></div>
                            <div className="mt-3 d-flex align-items-center justify-content-start">
                                <label className="col-auto fw-bolder">Delimiter: </label>
                                <div className="form-check col-auto ms-2">
                                    <input className="form-check-input" type="radio" name="delimiter" id="delimiterSpace" checked={!delimiterCustomFlag} onChange={(e) => {
                                        setDelimiterCustomFlag(!e.target.checked);
                                        setDelimiter('');
                                    }} />
                                    <label className="form-check-label" htmlFor="delimiterSpace">
                                        Space
                                    </label>
                                </div>
                                <div className="form-check col d-flex align-items-center ms-2">
                                    <input className="form-check-input" type="radio" name="delimiter" id="delimiterCustom" checked={delimiterCustomFlag} onChange={(e) => {
                                        setDelimiterCustomFlag(e.target.checked);

                                    }} />
                                    <label className="form-check-label ms-1" htmlFor="delimiterCustom">
                                        Custom
                                    </label>
                                    <input type="text" className="form-control ms-1" id="delimiterCustom" readOnly={!delimiterCustomFlag} value={delimiter} onChange={(e) => {
                                        setDelimiter(e.target.value);
                                    }} />
                                </div>
                            </div>
                            <div className="mt-3 d-flex align-items-center justify-content-start">
                                <label className="col-auto fw-bolder">Kilobytes Conversion: </label>
                                <select className="form-select col ms-2" value={kilobytesConversion} onChange={(e) => {
                                    setKilobytesConversion(parseInt(e.target.value));
                                }}>
                                    <option value="1024">1 K = 1024 Bytes</option>
                                    <option value="1000">1 K = 1000 Bytes</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    <section id="statistic" className="card mt-4">
                        <div className="card-body">
                            <div className='row align-items-center justify-content-between mb-2'>
                                <span className='fs-4 fw-bold col-auto mt-2'>Statistic</span>
                                <button type="button" disabled={countCharacters(content) == 0} className="col-auto btn btn-sm me-3 btn-outline-primary mt-2" data-bs-toggle="modal" data-bs-target="#colorInsightModal">
                                    <i className="bi bi-kanban"></i>
                                </button>
                            </div>
                            <span className='fs-4 fw-bold mt-2'></span>
                            <div className='w-100 pt-1 mt-1 bg-light'></div>
                            <div className="row">
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="contentSize" className="form-label">Content Size</label>
                                    <input type="text" className="form-control" readOnly id="contentSize" value={countLength(content)} />
                                </div>
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="characterCount" className="form-label">Number of characters</label>
                                    <input type="number" className="form-control" readOnly id="characterCount" value={countCharacters(content)} />
                                </div>
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="characterCount" className="form-label">Number of word characters</label>
                                    <input type="number" className="form-control" readOnly id="characterCount" value={countWordCharacters(content)} />
                                </div>
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="wordCount" className="form-label">Number of alphabet</label>
                                    <input type="number" className="form-control" readOnly id="wordCount" value={countAlphabets(content)} />
                                </div>
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="lineCount" className="form-label">Number of lines</label>
                                    <input type="number" className="form-control" readOnly id="lineCount" value={countLines(content, false)} />
                                </div>
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="lineCount" className="form-label">Number of lines<span className="text-primary"> (without empty)</span></label>
                                    <input type="number" className="form-control" readOnly id="lineCount" value={countLines(content, true)} />
                                </div>
                                <div className="mt-3 col-12 col-lg-6">
                                    <label htmlFor="alphabetCount" className="form-label">Number of words</label>
                                    <input type="number" className="form-control" readOnly id="alphabetCount" value={countWords(content)} />
                                </div>
                            </div>
                        </div>
                    </section>
                    <div>
                        <div className="modal fade" id="colorInsightModal" tabIndex={-1} aria-labelledby="colorInsightModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="colorInsightModalLabel">Color Insight</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className={`modal-body ${styles.colorInsight}`}>
                                        {
                                            getLines(content).map((line, index) => {
                                                const words = getWords(line);
                                                let tmpDelimiter: string = ' ';
                                                if (delimiterCustomFlag) {
                                                    tmpDelimiter = delimiter.trim();
                                                }
                                                if (tmpDelimiter.length == 0) {
                                                    tmpDelimiter = ' ';
                                                }
                                                return (
                                                    <p key={index} className={`rounded ${styles.colorInsightParagraph}`}>
                                                        {
                                                            words.map((word, wi) => {
                                                                return (
                                                                    <span key={index + '_span_' + wi}>
                                                                        {
                                                                            wi != 0 && <span key={index + '_delimiter_' + wi} className={styles.colorInsightDelimiter}>{tmpDelimiter}</span>
                                                                        }
                                                                        {
                                                                            word.length != 0 && (
                                                                                <span key={index + '_word_' + wi} className={`btn ${styles.colorInsightWord}`} onClick={() => {
                                                                                    showToast('Paragraph: <span class="text-danger fw-bold">'
                                                                                        + (index + 1)
                                                                                        + '</span>, Word: <span class="text-danger fw-bold">'
                                                                                        + (wi + 1) + '</span><br/>'
                                                                                        + '<span class="' + styles.colorInsightWord + '">' + word + '</span>',
                                                                                        'info', 2000, 'wordInsightInfo');
                                                                                }}>{word}</span>
                                                                            )
                                                                        }
                                                                    </span>
                                                                )
                                                            })
                                                        }
                                                    </p>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export const getStaticProps: GetStaticProps = async (context) => {
    const toolData: ToolData = findTool('/text/analytic');
    return {
        props: {
            toolData,
        }
    }
}

export default TextAnalyticPage 