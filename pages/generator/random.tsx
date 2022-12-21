import styles from '../../styles/generator/Random.module.css'
import 'rc-slider/assets/index.css'
import Slider from 'rc-slider';
import { ChangeEvent, useEffect, useState } from 'react';
import { ComparisonData, len_default, uppercase_checked, lowercase_checked, numbers_checked, symbols_checked, avoid_amibugous_checked, len_max, len_min, printPassword, generateRandom } from '../../libs/generator/random'
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { showToast } from "../../libs/toast";
import Layout from '../../components/layout';
import Head from 'next/head';

const alert_copy_timeout = 3000;
const alert_del_timeout = 3000;
const alert_gen_timeout = 3000;
const alert_comparison_timeout = 3000;

function getPasswordLevelStyle(len: number) {
    let width = undefined;
    let backgroundColor = undefined;
    if (len >= 12) {
        width = '100%';
        backgroundColor = 'green';
    } else if (len >= 10) {
        width = '75%';
        backgroundColor = 'green';
    } else if (len >= 8) {
        width = '50%';
        backgroundColor = 'orange';
    } else if (len >= 6) {
        width = '25%';
        backgroundColor = 'red';
    } else {
        width = '0%';
    }
    return {
        width: width,
        backgroundColor: backgroundColor,
    }
}

function toggleCopyIcon(element: HTMLElement, timeout: number) {
    // bi-clipboard bi-clipboard-check
    element.classList.remove('bi-clipboard');
    element.classList.add('bi-clipboard-check');
    element.classList.add('text-success');
    setTimeout(() => {
        element.classList.remove('bi-clipboard-check');
        element.classList.remove('text-success');
        element.classList.add('bi-clipboard');
    }, timeout);
}

function ComparisonList({ list, delCallback, clearAll }: { list: Array<ComparisonData>, delCallback: (index: number) => void, clearAll: () => void }) {

    function onCopy(e: React.MouseEvent<HTMLElement>, index: number) {
        const iconEle = e.currentTarget.getElementsByTagName('i')[0];
        toggleCopyIcon(iconEle, alert_copy_timeout);
        navigator.clipboard.writeText(list[index].password);
        showToast('Copied', 'success', alert_copy_timeout);
    }

    function onDel(index: number) {
        delCallback(index);
        showToast('Deleted', 'danger', alert_del_timeout);
    }

    function onClearAll() {
        clearAll();
        showToast('Cleared', 'danger', alert_del_timeout);
    }

    function listenComparisonCollapse() {
        const comparisionCollapse = document.getElementById('comparisionCollapse');
        const comparisionCollapseIndict = document.getElementById('comparisionCollapseIndict');
        if (comparisionCollapse && comparisionCollapseIndict) {
            comparisionCollapse.addEventListener('hidden.bs.collapse', event => {
                comparisionCollapseIndict.classList.remove('bi-chevron-double-up');
                comparisionCollapseIndict.classList.add('bi-chevron-double-down');
            })
            comparisionCollapse.addEventListener('shown.bs.collapse', event => {
                comparisionCollapseIndict.classList.remove('bi-chevron-double-down');
                comparisionCollapseIndict.classList.add('bi-chevron-double-up');
            })
        }
    }

    useEffect(() => {
        listenComparisonCollapse();
    }, []);

    return (
        <div className={`row mt-3 justify-content-center`} hidden={list.length == 0}>
            <a className="col-auto text-primary fw-bold" style={{ 'textDecoration': 'none' }} data-bs-toggle="collapse" href="#comparisionCollapse" role="button" aria-expanded="true" aria-controls="comparisionCollapse">
                Comparison<i id='comparisionCollapseIndict' className="ms-2 bi bi-chevron-double-up"></i>
            </a>
            <div className={`collapse show ${styles.comparisonBody}`} id="comparisionCollapse" >
                <div className='text-end me-1'>
                    <a className="col-auto text-danger btn btn-sm" style={{ 'textDecoration': 'none' }} onClick={onClearAll} >
                        Clear All<span className='text-dark ms-1'>({list.length})</span>
                    </a>
                </div>
                <>
                    {
                        list.map((record, index) => {
                            const { width, backgroundColor } = getPasswordLevelStyle(record.password.length);
                            const datetime = new Date(record.timestamp).toLocaleString();
                            return (
                                <div className='mt-2 card position-relative' key={index}>
                                    <div className={`row gx-0 ${styles.comparisonPassword}`}>
                                        <div className='col text-center text-break' dangerouslySetInnerHTML={{ __html: printPassword(record.password) }}>
                                        </div>
                                        <div className='col-auto d-none d-md-flex d-flex justify-content-around align-items-center '>
                                            <button type='button' className='btn btn-sm flex-col' data-toggle="tooltip" data-placement="right" title="Copy"
                                                onClick={(e) => {
                                                    onCopy(e, index);
                                                }}
                                            >
                                                <i className="bi bi-clipboard fs-5"></i>
                                            </button>
                                            <button type='button' className='btn btn-sm flex-col' data-toggle="tooltip" data-placement="right" title="Generate"
                                                onClick={() => {
                                                    onDel(index);
                                                }}
                                            >
                                                <i className="bi bi-trash3 fs-5" ></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="progress w-100 rounded-bottom rounded-0" style={{ 'height': '0.2rem' }}>
                                        <div className="progress-bar" role="progressbar" style={{ width: width, 'backgroundColor': backgroundColor }}></div>
                                    </div>
                                    <div className='row d-flex justify-content-around align-items-center d-md-none'>
                                        <button type='button' className='btn col-3 btn-sm'
                                            onClick={(e) => {
                                                onCopy(e, index);
                                            }}
                                        ><i className="bi bi-clipboard fs-5"></i></button>
                                        <button type='button' className='btn col-3 btn-sm'
                                            onClick={() => {
                                                onDel(index);
                                            }}><i className="bi bi-trash3 fs-5"></i></button>
                                    </div>
                                    <div className='position-absolute top-0 start-0 translate-middle-y badge rounded bg-secondary'>
                                        {datetime}
                                    </div>
                                </div>
                            )
                        })
                    }
                </>
            </div>
        </div>
    )
}

function Generator() {
    const [characters, setCharacters] = useState<number>(uppercase_checked | lowercase_checked | numbers_checked | symbols_checked);
    const [passwordLength, setPasswordLength] = useState<number>(len_default);
    const [password, setPassword] = useState<string>('');
    const [comparisons, setComparisons] = useState<ComparisonData[]>([]);

    function bitOperate(currentValue: number, checked: boolean, checkedValue: number) {
        if (checked) {
            return currentValue | checkedValue;
        } else {
            return currentValue & (~checkedValue);
        }
    }

    function onCheckBoxChange(event: ChangeEvent<HTMLInputElement>) {
        const name = event.target.name;
        const checked = event.target.checked;

        let chars = characters;
        switch (name) {
            case "uppercase":
                chars = bitOperate(chars, checked, uppercase_checked);
                break;
            case "lowercase":
                chars = bitOperate(chars, checked, lowercase_checked);
                break;
            case "symbols":
                chars = bitOperate(chars, checked, symbols_checked);
                break;
            case "numbers":
                chars = bitOperate(chars, checked, numbers_checked);
                break;
            case "avoidAmibugous":
                chars = bitOperate(chars, checked, avoid_amibugous_checked);
                break;
            default:
                console.error("Invalid checkbox name: " + name);
                return;
        }
        if (chars != 0 && chars != avoid_amibugous_checked) {
            setCharacters(chars);
        }
    }

    function copyAction() {
        navigator.clipboard.writeText(password);
        const icons = document.getElementsByClassName('copyIcon');
        if (icons) {
            for (var i = 0; i < icons.length; i++) {
                toggleCopyIcon(icons.item(i) as HTMLElement, alert_copy_timeout);
            }
        }
        showToast('Copied', 'success', alert_copy_timeout);
    }

    function generateAction() {
        const password = generateRandom(characters, passwordLength);
        setPassword(password);
        showToast('Generated', 'info', alert_gen_timeout, 'generatedAlert');
    }

    useEffect(() => {
        // update level indict
        const el = document.getElementById('passLevelIndict');
        if (el) {
            const { width, backgroundColor } = getPasswordLevelStyle(passwordLength);
            if (width) {
                el.style.width = width;
            }
            if (backgroundColor) {
                el.style.backgroundColor = backgroundColor;
            }
        }

        // generate password
        const password = generateRandom(characters, passwordLength);
        setPassword(password);

    }, [passwordLength, characters])

    function addComparisionAction() {
        if (comparisons.length == 0 || comparisons[0].password != password) {
            const comparisonsTemp = [{
                password: password,
                characters: characters,
                timestamp: new Date().getTime(),
            }];
            comparisonsTemp.push(...comparisons);
            setComparisons(comparisonsTemp);
        }

        const bagIcons = document.getElementsByClassName('bagIcon');
        if (bagIcons) {
            for (var i = 0; i < bagIcons.length; i++) {
                let bagIcon = bagIcons.item(i) as HTMLElement;
                bagIcon.classList.add('text-success');
                setTimeout(() => {
                    bagIcon.classList.remove('text-success');
                }, alert_comparison_timeout);
            }
        }
        showToast('Saved to comparision', 'success', alert_comparison_timeout);
    }

    return (
        <section id="generator" className={`container-fluid ${styles.generator}`}>
            <div className='container py-4'>
                <div className='row justify-content-center'>
                    <div className='col-12 col-lg-8 px-0'>
                        <div className='row justify-content-center text-center text-dark'>
                            <div className='col-12 col-md-10'>
                                <p className='fw-bold fs-2'>Need a password? Try it.</p>
                                <p className='fs-4 fw-light fst-italic' >Generate secure, random passwords to stay safe online.</p>
                            </div>
                        </div>
                        <div className='bg-white text-dark mt-3 card'>
                            <div className={`row gx-0 ${styles.passDisplay} position-relative`}>
                                <div className='col text-center text-break' dangerouslySetInnerHTML={{ __html: printPassword(password) }}>
                                </div>
                                <div className='col-auto d-none d-md-flex d-flex justify-content-around align-items-center '>
                                    <button type='button' className='btn btn-sm flex-col' onClick={copyAction} data-toggle="tooltip" data-placement="right" title="Copy">
                                        <i className="copyIcon bi bi-clipboard fs-3"></i>
                                    </button>
                                    <button type='button' className='btn btn-sm flex-col' onClick={generateAction} data-toggle="tooltip" data-placement="right" title="Generate">
                                        <i className="bi bi-arrow-clockwise fs-3"></i>
                                    </button>
                                </div>
                                <button style={{ 'fontSize': '1.3rem' }} type='button' className='py-0 btn btn-sm col-auto position-absolute bottom-0 end-0' onClick={addComparisionAction} data-toggle="tooltip" data-placement="right" title="Compare">
                                    <i className="bagIcon bi bi-save"></i>
                                </button>
                            </div>
                            <div className="progress w-100 rounded-bottom rounded-0" style={{ 'height': '0.6rem' }}>
                                <div className="progress-bar" role="progressbar" id='passLevelIndict' aria-valuemin={0} aria-valuemax={100}></div>
                            </div>
                        </div>
                        <div className='row mt-4 d-flex justify-content-around align-items-center d-md-none'>
                            <button type='button' className='btn btn-lg  col-10  btn-primary rounded-pill fw-bold' onClick={generateAction}>Generate Password</button>
                            <button type='button' className='btn btn-lg  col-10  btn-danger rounded-pill fw-bold mt-3' onClick={copyAction}> Copy Password</button>
                        </div>
                        <div className='mt-4 bg-white text-dark card p-4'>
                            <p className='fs-4 fw-bold'>Customize your password</p>
                            <div className='w-100 pt-1 bg-light'></div>
                            <div className='row px-3'>
                                <div className='col-lg-6 col-12 mt-3 gx-0'>
                                    <label className='fs-5'>Password Length</label>
                                    <div className='row justify-content-start align-items-center mt-2'>
                                        <div className='col-4'>
                                            <input type="number" className="form-control form-control-lg" step={1} min={len_min} max={len_max} value={passwordLength} onChange={(e) => {
                                                setPasswordLength(parseInt(e.target.value));
                                            }} />
                                        </div>
                                        <div className='col-7'>
                                            <Slider min={len_min} max={len_max} step={1} value={passwordLength}
                                                railStyle={{ 'backgroundColor': 'light', 'height': '6px' }}
                                                trackStyle={{ 'backgroundColor': '#dd2222', 'height': '6px' }}
                                                handleStyle={{
                                                    'backgroundColor': '#dd2222',
                                                    'height': '30px',
                                                    'width': '30px',
                                                    'marginTop': '-12px',
                                                    'marginLeft': '-12px',
                                                    'border': '0',
                                                    'transform': 'none',
                                                    'opacity': '100'
                                                }}
                                                onChange={(value) => setPasswordLength(value as number)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6 col-12 mt-3 ${styles.checkbox}`}>
                                    <div className='row justify-content-start'>
                                        <div className="form-check form-control-lg col-6 d-flex align-items-center">
                                            <input className='form-check-input' type="checkbox" checked={(characters & uppercase_checked) != 0} id="uppercaseCheck" name='uppercase' onChange={onCheckBoxChange} />
                                            <label className="form-check-label" htmlFor="uppercaseCheck">Uppercase</label>
                                        </div>
                                        <div className="form-check form-control-lg col-6 d-flex align-items-center">
                                            <input className='form-check-input' type="checkbox" checked={(characters & lowercase_checked) != 0} id="lowercaseCheck" name='lowercase' onChange={onCheckBoxChange} />
                                            <label className="form-check-label" htmlFor="lowercaseCheck">Lowercase</label>
                                        </div>
                                        <div className="form-check form-control-lg col-6 d-flex align-items-center">
                                            <input className='form-check-input' type="checkbox" checked={(characters & numbers_checked) != 0} id="numbersCheck" name='numbers' onChange={onCheckBoxChange} />
                                            <label className="form-check-label" htmlFor="numbersCheck">Numbers</label>
                                        </div>
                                        <div className="form-check form-control-lg col-6 d-flex align-items-center">
                                            <input className='form-check-input' type="checkbox" checked={(characters & symbols_checked) != 0} id="symoblsCheck" name='symbols' onChange={onCheckBoxChange} />
                                            <label className="form-check-label" htmlFor="symoblsCheck">Symobls</label>
                                        </div>
                                        <div className="form-check form-control-lg col-auto d-flex align-items-center">
                                            <input className='form-check-input' type="checkbox" checked={(characters & avoid_amibugous_checked) != 0} id="avoidAmibugousCheck" name='avoidAmibugous' onChange={onCheckBoxChange} />
                                            <label className="form-check-label" htmlFor="avoidAmibugousCheck">Avoid Amibugous</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row mt-4 justify-content-center d-none d-md-flex'>
                            <button type='button' className='btn btn-lg col-md-7 col-lg-4 col-10  btn-danger rounded-pill fw-bold' onClick={copyAction}>Copy Password</button>
                        </div>
                        <div className='row mt-4 justify-content-center'>
                            <button type='button' className='btn btn-lg col-md-7 col-lg-4 col-10  btn-dark rounded-pill fw-bold' onClick={(e) => {
                                navigator.clipboard.writeText('');
                                showToast('Cleared clipboard', 'danger', 3000);
                            }}>Clear Clipboard</button>
                        </div>

                        <ComparisonList list={comparisons}
                            delCallback={(index) => {
                                const temp = comparisons.slice(0, index);
                                temp.push(...comparisons.slice(index + 1));
                                setComparisons(temp);
                            }}
                            clearAll={() => {
                                setComparisons([]);
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

interface QuestionData {
    title: string;
    body: string;
}

function Question({ data }: { data: QuestionData[] }) {
    return (
        <section className='container pt-5 text-center col-lg-10 col-12'>
            <p className='fw-bold fs-1'>
                What makes a password strong?
            </p>
            <div className='row justify-content-center mt-5'>
                <div className="col-12 col-lg-8 accordion" id="questionCollapse">
                    <>
                        {
                            data.map((v, index) => {
                                const headerId = 'collapse-' + index + '-header';
                                const collapseId = 'collapse-' + index;
                                return (
                                    <div className="accordion-item text-start" key={index}>
                                        <h2 className="accordion-header" id={headerId}>
                                            <button className={'accordion-button fw-bold' + (index == 0 ? '' : ' collapsed')} type="button" data-bs-toggle="collapse" data-bs-target={'#' + collapseId} aria-expanded={index === 0 ? 'true' : 'false'} aria-controls={collapseId}>
                                                {v.title}
                                            </button>
                                        </h2>
                                        <div id={collapseId} className={'accordion-collapse collapse' + (index == 0 ? ' show' : '')} aria-labelledby={headerId} data-bs-parent="#questionCollapse">
                                            <div className="accordion-body">
                                                <p style={{ 'textIndent': '2rem', 'lineHeight': '1.8rem' }}>{v.body}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </>
                </div>
            </div>
        </section>
    )
}

function RandomPage({ questions }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <>
            <Head>
                <title>W3tools | Random Generator</title>
                <meta name="description" content="Generate secure, random passwords to stay safe online." />
                <meta name='keyword' content='random, generator, password, pin, gen, gen-pass, pass' />
            </Head>
            <Layout asideAds={false}>
                <Generator />
                <Question data={questions} />
            </Layout>
        </>
    )
}

export const getStaticProps: GetStaticProps = async (context) => {
    const questions: QuestionData[] = [
        {
            'title': 'Strong passwords are unique and random.',
            'body': 'Humans aren\'t very good at coming up with passwords that are either of those things, let alone both. So we created the Strong Password Generator to create secure passwords for you. 81% of data breaches are caused by reused or weak passwords, so random, unique passwords are your best defense against online threats.',
        },
        {
            'title': 'Why should my password be unique?',
            'body': "If you use the same password for both your email account and your bank account login, an attacker only needs to steal one password to get access to both accounts, doubling your exposure. If you've used that same password for 14 different accounts, you're making the attacker's job very, very easy. You can protect yourself by using a generator to create unique passwords that are easy to remember.",
        },
        {
            'title': 'Why should my password be random?',
            'body': "Random passwords are hard to guess and harder for computer programs to crack. If there's a discernible pattern, the odds of an attacker using a brute force attack and gaining access to your account goes up exponentially. Random passwords might contain a jumble of unrelated characters, but combining unrelated words also works. That's how the Strong Password Generator creates passwords that are easy to remember but still cryptographically strong.",
        },
    ];
    return {
        props: {
            questions,
        }
    }
}

export default RandomPage;