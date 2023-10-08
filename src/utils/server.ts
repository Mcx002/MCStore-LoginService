class ServerLifetime {
    startTime: number = 0

    setStartTime(val: number) {
        this.startTime = val
    }

    getTimestamp(): number {
        const currentTime = new Date().getTime()
        return Math.round((currentTime - this.startTime) / 1000)
    }
}

export const serverLifetime = new ServerLifetime()