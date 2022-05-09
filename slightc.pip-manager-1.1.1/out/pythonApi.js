"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonExtensionReady = void 0;
const vscode = require("vscode");
const localize_1 = require("./i18n/localize");
function pythonExtensionReady() {
    return __awaiter(this, void 0, void 0, function* () {
        const pythonExt = vscode.extensions.getExtension('ms-python.python');
        if (!pythonExt) {
            vscode.window.showErrorMessage(localize_1.i18n.localize('pip-manager.tip.installPython', 'Please install python extension'));
            return Promise.reject();
        }
        if (!pythonExt.isActive) {
            yield pythonExt.exports.ready;
        }
        function getPythonPath() {
            var _a;
            if (!pythonExt) {
                return '';
            }
            const executionDetails = pythonExt.exports.settings.getExecutionDetails();
            return ((_a = executionDetails === null || executionDetails === void 0 ? void 0 : executionDetails.execCommand) === null || _a === void 0 ? void 0 : _a[0]) || '';
        }
        const pythonPath = getPythonPath();
        const onPythonPathChange = (callback) => {
            return pythonExt.exports.settings.onDidChangeExecutionDetails(() => {
                const pythonPath = getPythonPath();
                return callback(pythonPath);
            });
        };
        return [pythonPath, onPythonPathChange, pythonExt];
    });
}
exports.pythonExtensionReady = pythonExtensionReady;
//# sourceMappingURL=pythonApi.js.map