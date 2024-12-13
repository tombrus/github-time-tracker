class Bar {
    Bar(max: number) {

    }

    barProgress(progress: number) {

    }
}

export class Progress {
    messages: string[] = [];

    public async newMessage(message: string) {
        this.messages.push(message);
    }

    public async newBar(max: number) {

    }

    public async barProgress(progress: number) {

    }
}
