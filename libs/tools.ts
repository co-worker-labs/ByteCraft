export interface ToolData {
    path: string;
    title: string;
    description: string;
    keywords: string[];
}

export function listMatchedTools(filter: string): ToolData[] {
    if (filter == '') {
        return toolsList;
    }
    filter = filter.toLocaleLowerCase();
    const filterWords = filter.split(/\s+/);
    console.log(filterWords);
    return toolsList.filter((data) => {
        for (var fw of filterWords) {
            let found = data.keywords.filter(it => it.includes(fw));
            console.log(fw + ' => ' + found);
            if (found.length == 0) {
                console.log('return falwe');
                return false;
            }
        }
        return true;
    })
}

const toolsList: ToolData[] = [
    {
        path: '/generator/random',
        title: 'Random Generator',
        description: 'Generate secure, random passwords',
        keywords: ['password', 'generator', 'random']
    },
    {
        path: '/generator/memorable',
        title: 'Memorable Generator',
        description: 'Generate secure, random, memorable passwords',
        keywords: ['password', 'generator', 'memorable', 'random']
    },
]