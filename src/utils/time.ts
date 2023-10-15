export const getUnixFromDate = (date: Date) => {
    return Math.round(date.getTime() / 1000)
}