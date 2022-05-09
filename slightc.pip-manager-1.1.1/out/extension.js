"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const packageDataProvider_1 = require("./packageDataProvider");
const pythonApi_1 = require("./pythonApi");
const packageManager_1 = require("./packageManager");
const localize_1 = require("./i18n/localize");
const axios_1 = require("axios");
const path = require("path");
const serviceCollection_1 = require("./instantiation/common/serviceCollection");
const instantiationService_1 = require("./instantiation/common/instantiationService");
const types_1 = require("./types");
const trace_1 = require("./trace");
let CommandTool = class CommandTool {
    constructor(_context) {
        this._context = _context;
        this.map = new Map();
    }
    registerEmptyCommand(name) {
        this.map.set(name, vscode.commands.registerCommand(name, () => { }));
    }
    registerEmptyCommands(names) {
        names.forEach((name) => {
            this.registerEmptyCommand(name);
        });
    }
    disposeEmptyCommand(name) {
        const command = this.map.get(name);
        if (command) {
            command.dispose();
        }
    }
    registerCommand(name, callback, thisArg) {
        this.disposeEmptyCommand(name);
        this._context.subscriptions.push(vscode.commands.registerCommand(name, callback, thisArg));
    }
};
CommandTool = __decorate([
    __param(0, types_1.IExtensionContext),
    __metadata("design:paramtypes", [Object])
], CommandTool);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // start register services
        const services = new serviceCollection_1.ServiceCollection();
        const instantiationService = new instantiationService_1.InstantiationService(services);
        const outputChannel = vscode.window.createOutputChannel('Pip Manager');
        outputChannel.clear();
        services.set(types_1.IExtensionContext, context);
        services.set(types_1.IOutputChannel, outputChannel);
        const commandTool = instantiationService.createInstance(CommandTool);
        commandTool.registerEmptyCommands([
            'pip-manager.addPackage',
            'pip-manager.refreshPackage',
            'pip-manager.searchPackage',
        ]);
        const [pythonPath, onPythonPathChange] = yield pythonApi_1.pythonExtensionReady();
        outputChannel.appendLine('Pip Manager Start');
        const pip = instantiationService.createInstance(packageManager_1.PackageManager, pythonPath);
        services.set(packageManager_1.IPackageManager, pip);
        const packageDataProvider = instantiationService.createInstance(packageDataProvider_1.PackageDataProvider);
        // after services registered
        function addPackage(name) {
            return __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    outputChannel.clear();
                    yield vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: localize_1.i18n.localize('pip-manager.tip.addPackage', 'installing package %0%', `${name}`),
                        cancellable: true,
                    }, (progress, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                        yield pip.addPackage(name, cancelToken);
                        packageDataProvider.refresh();
                    }));
                }
            });
        }
        function updatePackage(name) {
            return __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    outputChannel.clear();
                    yield vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: localize_1.i18n.localize('pip-manager.tip.updatePackage', 'update package %0%', `${name}`),
                        cancellable: true,
                    }, (progress, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                        yield pip.updatePackage(name, cancelToken);
                        packageDataProvider.refresh();
                    }));
                }
            });
        }
        function checkRemovePackage(name) {
            if (packageManager_1.necessaryPackage.includes(name)) {
                vscode.window.showWarningMessage(localize_1.i18n.localize('pip-manager.tip.disableRemove', 'package %0% cannot remove', `${packageManager_1.necessaryPackage}`));
                return false;
            }
            return true;
        }
        // ======================
        context.subscriptions.push(onPythonPathChange((pythonPath) => {
            pip.updatePythonPath(pythonPath);
            packageDataProvider.refresh();
        }));
        const pipManagerTreeView = vscode.window.createTreeView('pip-manager-installed', {
            treeDataProvider: packageDataProvider,
        });
        pipManagerTreeView.onDidChangeVisibility((e) => {
            if (e.visible) {
                trace_1.default.openView();
            }
        });
        context.subscriptions.push(pipManagerTreeView);
        commandTool.registerCommand('pip-manager.refreshPackage', () => {
            packageDataProvider.refresh();
        });
        commandTool.registerCommand('pip-manager.addPackage', (name) => __awaiter(this, void 0, void 0, function* () {
            let value = '';
            if (name) {
                value = name;
            }
            else {
                value = (yield vscode.window.showInputBox({ title: localize_1.i18n.localize('pip-manager.input.addPackage', 'input install package name') })) || '';
            }
            yield addPackage(value);
        }));
        commandTool.registerCommand('pip-manager.updatePackage', (e) => __awaiter(this, void 0, void 0, function* () {
            if (!(e === null || e === void 0 ? void 0 : e.name)) {
                return;
            }
            yield updatePackage(e.name);
        }));
        commandTool.registerCommand('pip-manager.removePackage', (e) => __awaiter(this, void 0, void 0, function* () {
            let value = '';
            if (!e) {
                value = (yield vscode.window.showInputBox({ title: localize_1.i18n.localize('pip-manager.input.removePackage', 'input remove package name') })) || '';
            }
            else {
                value = e.name;
            }
            if (!(value && checkRemovePackage(value.split('==')[0]))) {
                return false;
            }
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize_1.i18n.localize('pip-manager.tip.removePackage', 'remove package %0%', `${value}`),
            }, () => __awaiter(this, void 0, void 0, function* () {
                yield pip.removePackage(value);
                packageDataProvider.refresh();
            }));
            return true;
        }));
        commandTool.registerCommand('pip-manager.packageDescription', (e) => __awaiter(this, void 0, void 0, function* () {
            let value = '';
            if (!e) {
                value = (yield vscode.window.showInputBox({ title: localize_1.i18n.localize('pip-manager.input.packageDescription', 'input find package name') })) || '';
            }
            else {
                value = e.name;
            }
            if (!value) {
                return;
            }
            vscode.env.openExternal(vscode.Uri.parse(`https://pypi.org/project/${value}/`));
        }));
        commandTool.registerCommand('pip-manager.copyPackageName', (e) => __awaiter(this, void 0, void 0, function* () {
            if (!e) {
                return;
            }
            const value = e.name;
            if (!value) {
                return;
            }
            yield vscode.env.clipboard.writeText(value);
        }));
        commandTool.registerCommand('pip-manager.installRequirements', (e) => __awaiter(this, void 0, void 0, function* () {
            if (!e) {
                return;
            }
            const filePath = e.fsPath;
            if (!filePath) {
                return;
            }
            outputChannel.clear();
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize_1.i18n.localize('pip-manager.tip.addPackageFromFile', 'installing package in %0%', path.basename(filePath)),
                cancellable: true,
            }, (progress, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                yield pip.addPackageFromFile(filePath, cancelToken);
                packageDataProvider.refresh();
            }));
        }));
        commandTool.registerCommand('pip-manager.searchPackage', () => __awaiter(this, void 0, void 0, function* () {
            const qPick = vscode.window.createQuickPick();
            let rBusy = 0;
            let timer;
            let lastCancelToken;
            qPick.busy = true;
            qPick.show();
            const defaultTitle = localize_1.i18n.localize('pip-manager.pick.search.defaultTitle', 'search from PyPI');
            qPick.title = defaultTitle;
            qPick.placeholder = localize_1.i18n.localize('pip-manager.pick.search.placeholder', 'input to search');
            const btnTable = {
                dot: { iconPath: new vscode.ThemeIcon('debug-stackframe-dot') },
                left: { iconPath: new vscode.ThemeIcon('arrow-left'), tooltip: localize_1.i18n.localize('pip-manager.pick.search.preBtn', 'pre page') },
                right: { iconPath: new vscode.ThemeIcon('arrow-right'), tooltip: localize_1.i18n.localize('pip-manager.pick.search.nextBtn', 'next page') },
            };
            function clearSteps() {
                qPick.step = 0;
                qPick.totalSteps = 0;
                qPick.buttons = [];
            }
            function setStep(step, totalSteps) {
                qPick.step = step;
                if (totalSteps) {
                    qPick.totalSteps = totalSteps;
                }
                let preBtn, nextBtn;
                if (qPick.step === 1) {
                    preBtn = btnTable.dot;
                }
                else {
                    preBtn = btnTable.left;
                }
                if (qPick.step === qPick.totalSteps) {
                    nextBtn = btnTable.dot;
                }
                else {
                    nextBtn = btnTable.right;
                }
                qPick.buttons = [preBtn, nextBtn];
            }
            function updateItemList(value, page, clear = true) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (lastCancelToken) {
                        lastCancelToken.cancel();
                    }
                    const cancelToken = new vscode.CancellationTokenSource();
                    lastCancelToken = cancelToken;
                    rBusy++;
                    qPick.busy = !!rBusy;
                    try {
                        if (value) {
                            qPick.title = localize_1.i18n.localize('pip-manager.pick.search.resultTitle', 'search for %0%', `${value}`);
                            ;
                        }
                        else {
                            qPick.title = defaultTitle;
                        }
                        if (clear) {
                            clearSteps();
                        }
                        else {
                            setStep(page);
                        }
                        const data = yield pip.searchFromPyPi(value, page, cancelToken.token);
                        qPick.items = data.list;
                        setStep(page, data.totalPages);
                        qPick.step = page;
                        qPick.totalSteps = data.totalPages;
                    }
                    catch (err) {
                        if (!axios_1.default.isCancel(err)) {
                            qPick.title = localize_1.i18n.localize('pip-manager.pick.search.noResultTitle', 'no search result');
                            qPick.items = [];
                            qPick.step = 0;
                            qPick.totalSteps = 0;
                        }
                    }
                    cancelToken.dispose();
                    rBusy--;
                    qPick.busy = !!rBusy;
                });
            }
            qPick.onDidChangeValue((value) => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    updateItemList(value, 1);
                }, 300);
            });
            qPick.onDidChangeSelection((data) => {
                const item = data[0];
                qPick.hide();
                const value = item.label;
                addPackage(value);
            });
            qPick.onDidTriggerButton((e) => {
                if (e === btnTable.left) {
                    updateItemList(qPick.value, (qPick.step || 0) - 1, false);
                }
                if (e === btnTable.right) {
                    updateItemList(qPick.value, (qPick.step || 0) + 1, false);
                }
            });
            qPick.onDidHide(() => {
                qPick.dispose();
                lastCancelToken === null || lastCancelToken === void 0 ? void 0 : lastCancelToken.dispose();
            });
            updateItemList('', 1);
        }));
        commandTool.registerCommand('pip-manager.pickPackageVersion', (e) => __awaiter(this, void 0, void 0, function* () {
            let pack = '';
            if (!e) {
                pack = (yield vscode.window.showInputBox({ title: localize_1.i18n.localize('pip-manager.input.pickPackageVersion', 'input pick version package name') })) || '';
            }
            else {
                pack = e.name;
            }
            pack = pack.split('==')[0];
            if (!(pack)) {
                return false;
            }
            let versionList = [];
            outputChannel.clear();
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize_1.i18n.localize('pip-manager.tip.pickPackageVersion', 'check %0% version', `${pack}`),
                cancellable: true,
            }, (progress, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                versionList = yield pip.getPackageVersionList(pack, cancelToken);
            }));
            if (!versionList.length) {
                vscode.window.showInformationMessage(localize_1.i18n.localize('pip-manager.tip.noPackageVersion', 'no found version for %0%', `${pack}`));
                return;
            }
            const quickPickItems = versionList.map((item) => {
                const picked = ((e === null || e === void 0 ? void 0 : e.version) && (e === null || e === void 0 ? void 0 : e.version) === item) || false;
                return {
                    label: item,
                    alwaysShow: true,
                    description: picked ?
                        localize_1.i18n.localize('pip-manager.tip.currentVersion', '%0% current version', pack) :
                        undefined,
                    picked,
                };
            });
            const selectedVersion = yield new Promise((resolve, reject) => {
                const qPick = vscode.window.createQuickPick();
                let value = null;
                qPick.title = localize_1.i18n.localize('pip-manager.tip.selectPackageVersion', 'select install version for %0%', `${pack}`);
                qPick.placeholder = e === null || e === void 0 ? void 0 : e.version;
                qPick.items = quickPickItems;
                qPick.activeItems = quickPickItems.filter((item) => item.picked);
                qPick.onDidChangeSelection((e) => {
                    value = e[0];
                    qPick.hide();
                });
                qPick.onDidHide(() => {
                    resolve(value);
                    qPick.dispose();
                });
                qPick.show();
            });
            if (selectedVersion && selectedVersion.label !== (e === null || e === void 0 ? void 0 : e.version)) {
                vscode.commands.executeCommand('pip-manager.addPackage', `${pack}==${selectedVersion.label}`);
            }
        }));
        return { pip };
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map