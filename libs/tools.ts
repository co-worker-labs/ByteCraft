export interface ToolData {
    path: string;
    title: string;
    description: string;
    searchKeys: string[];
    keywords: string[];
}

export function findTool(path: string): ToolData {
    const result = toolsList.find((v) => v.path === path);
    if (!result) {
        throw 'Invalid page path: ' + path;
    }
    return result;
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
            let found = data.searchKeys.filter(it => it.includes(fw));
            console.log(fw + ' => ' + found);
            if (found.length == 0) {
                return false;
            }
        }
        return true;
    })
}

export const toolsList: ToolData[] = [
    {
        path: '/generator/password',
        title: 'Password Generator',
        description: 'Generate secure, random, memorable passwords to stay safe online.',
        searchKeys: ['password', 'generator', 'random', 'memorable', 'pin'],
        keywords: ['password', 'generator', 'random', 'memorable', 'pin', 'gen', 'pass', 'text'],
    },
]