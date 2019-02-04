class Semver {
    show(timestamp: number) {
        const date = new Date(timestamp * 1000);

        const days = date.toLocaleDateString();
        const time = date.toLocaleTimeString();

        return `${days} ${time}`;
    }
}

const semver = new Semver();

export {semver as Semver};
