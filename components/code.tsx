import { ReactNode } from "react";
import styles from './Code.module.css'

export type CodeType = 'comment' | 'keyword' | 'punctuation' | 'operator' | 'string'

export function CodeItem({ type, data, children }: { type: CodeType, data?: ReactNode, children?: ReactNode }) {
    let stl;
    switch (type) {
        case 'comment':
            stl = styles.comment;
            break;
        case 'keyword':
            stl = styles.keyword;
            break;
        case 'operator':
            stl = styles.operator;
            break;
        case 'punctuation':
            stl = styles.punctuation;
            break;
        case 'string':
            stl = styles.string;
            break;
    }
    return <span className={stl}>{data}{children}</span>
}

export function CodeFunc({ name, children }: { name: ReactNode, children?: ReactNode }) {
    return (
        <>
            <span className={styles.function}>{name}</span>
            <CodeItem type="punctuation" data='(' />
            {children}
            <CodeItem type="punctuation" data=')' />
        </>
    )
}

export function CodeSnipt({ children }: { children?: ReactNode }) {
    return (
        <pre className={`${styles.main} rounded`}>
            <code>
                {children}
            </code>
        </pre>
    )
}
