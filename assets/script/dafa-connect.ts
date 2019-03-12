class DafaConnect {

    isDafaconnect() {
        if (navigator.userAgent.match("DafaConnect")) {
            return true;
        }

        return false;
    }
}

const dafaconnect = new DafaConnect();

export {dafaconnect as DafaConnect};
