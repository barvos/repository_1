"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IExtensionContext = exports.IOutputChannel = void 0;
const instantiation_1 = require("./instantiation/common/instantiation");
exports.IOutputChannel = instantiation_1.createDecorator('outputChannel');
exports.IExtensionContext = instantiation_1.createDecorator('extensionContext');
//# sourceMappingURL=types.js.map