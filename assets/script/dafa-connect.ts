class DafaConnect {

    isDafaconnect() {
        return navigator.userAgent.match("DafaConnect");
    }
}

const dafaconnect = new DafaConnect();

export {dafaconnect as DafaConnect};
