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
exports.DataProvider = exports.DataItem = void 0;
const vscode = require("vscode");
class DataItem extends vscode.TreeItem {
    constructor(label, version, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.description = version;
        this.iconPath = new vscode.ThemeIcon('circle-outline');
        this.tooltip = `${label}@${version}`;
    }
}
exports.DataItem = DataItem;
class DataProvider {
    constructor(pip) {
        this.pip = pip;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element) {
                return Promise.resolve([]);
            }
            else {
                const packageList = yield this.pip.getPackageList();
                const datalist = packageList.map((info) => {
                    return new DataItem(info.name, info.version);
                });
                return Promise.resolve(datalist);
            }
        });
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=dataProvider.js.map