"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class Trace {
    constructor() {
        this.reportUrl = "http://analytics.pip-manager.site/feed";
    }
    openView() {
        const url = this.reportUrl + "?u=/openView";
        axios_1.default.put(url);
    }
}
const trace = new Trace();
exports.default = trace;
//# sourceMappingURL=index.js.map