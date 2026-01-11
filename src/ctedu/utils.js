export function formatPeriod(period){
    const [year, month, date] = period.split("-").map(d => parseInt(d));
    return new Date(year,month - 1, date).toLocaleDateString()
}

export const baseUrl = "https://www.cermatdata.cz/ctedu";
export const relativeBaseUrl = "/ctedu";