export class Url {
    static get query() {
        const obj = {};

        window.location.search.substr(1).split('&').forEach((str) => {
            const pair = str.split('=');
            obj[pair[0]] = decodeURIComponent(pair[1]);
        });

        return obj;
    }
}
