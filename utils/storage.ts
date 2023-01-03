export type StorageUnitType = 'Base' | 'Decimal' | 'Binary' | 'Bit'

export interface StorageUnitData {
    unit: string;
    title: string;
    type: StorageUnitType;
    exponent: number;
}

export const storageUnitList: StorageUnitData[] = [
    { unit: 'Byte', title: 'Byte', type: 'Base', exponent: 0 },
    { unit: 'Bit', title: 'Bit', type: 'Base', exponent: 0 },

    { unit: 'KB', title: 'Kilobyte', type: 'Decimal', exponent: 3 },
    { unit: 'MB', title: 'Megabyte', type: 'Decimal', exponent: 6 },
    { unit: 'GB', title: 'Gigabyte', type: 'Decimal', exponent: 9 },
    { unit: 'TB', title: 'Terabyte', type: 'Decimal', exponent: 12 },
    { unit: 'PB', title: 'Petabyte', type: 'Decimal', exponent: 15 },

    { unit: 'KiB', title: 'Kibibyte', type: 'Binary', exponent: 10 },
    { unit: 'MiB', title: 'Mebibyte', type: 'Binary', exponent: 20 },
    { unit: 'GiB', title: 'Gibibyte', type: 'Binary', exponent: 30 },
    { unit: 'TiB', title: 'Tebibyte', type: 'Binary', exponent: 40 },
    { unit: 'PiB', title: 'Pebibyte', type: 'Binary', exponent: 50 },

    { unit: 'Kbit', title: 'Kilobit', type: 'Bit', exponent: 3 },
    { unit: 'Mbit', title: 'Megabit', type: 'Bit', exponent: 6 },
    { unit: 'Gbit', title: 'Gigabit', type: 'Bit', exponent: 9 },
    { unit: 'Tbit', title: 'Terabit', type: 'Bit', exponent: 12 },
    { unit: 'Pbit', title: 'Petabit', type: 'Bit', exponent: 15 },
]

function getBaseUnit(unit: StorageUnitData): string {
    switch (unit.type) {
        case 'Base':
            return unit.unit;
        case 'Binary':
        case 'Decimal':
            return 'Byte'
        case 'Bit':
            return 'Bit'
    }
}

export function getStorageUnitData(unit: string): StorageUnitData | undefined {
    return storageUnitList.find((data) => data.unit == unit);
}

function convertBaseUnit(current: number, currentUnit: string, targetUnit: string): number {
    if (currentUnit == targetUnit) {
        return current;
    }
    if (currentUnit == 'Byte' && targetUnit == 'Bit') {
        return current * 8
    } else if (currentUnit == 'Bit' && targetUnit == 'Byte') {
        return current / 8
    } else {
        throw 'Invalid base unit'
    }
}

export function convert(current: number, currentUnit: StorageUnitData, targetUnit: StorageUnitData): number {
    let currentBaseVal;
    switch (currentUnit.type) {
        case 'Base':
            currentBaseVal = current;
            break;
        case 'Decimal':
        case 'Bit':
            currentBaseVal = current * Math.pow(10, currentUnit.exponent)
            break;
        case 'Binary':
            currentBaseVal = current * Math.pow(2, currentUnit.exponent)
            break;
    }
    const currentBaseUnit = getBaseUnit(currentUnit);
    const targetBaseUnit = getBaseUnit(targetUnit);

    const targetBaseVal = convertBaseUnit(currentBaseVal, currentBaseUnit, targetBaseUnit);

    let result: number
    switch (targetUnit.type) {
        case 'Base':
            result = targetBaseVal;
            break;
        case 'Decimal':
        case 'Bit':
            result = targetBaseVal / Math.pow(10, targetUnit.exponent)
            break;
        case 'Binary':
            result = targetBaseVal / Math.pow(2, targetUnit.exponent)
            break;

    }
    return result
}

const format_decimal_unit = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
const format_binary_unit = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

export function formatBytes(bytes: number, k: 1000 | 1024 = 1000, decimals: number = 4) {
    if (!+bytes) return '0 Bytes'

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    let unit;
    switch (k) {
        case 1000:
            unit = format_decimal_unit[i];
            break;
        case 1024:
            unit = format_binary_unit[i];
    }

    const dm = decimals < 0 ? 0 : decimals
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${unit}`
}