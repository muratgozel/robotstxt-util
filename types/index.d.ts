export declare class RobotsTxt {
    state: State;
    reGroupSep: RegExp;
    validRuleNames: string[];
    validShareFormats: string[];
    constructor(data?: string);
    newGroup(name: string, rules?: never[]): {
        allow: (p: string | string[]) => void;
        disallow: (p: string | string[]) => void;
    };
    newProduct(key: string, value: string): this;
    load(obj: StateData): this;
    share(format?: string): string | StateData;
    dump(): string;
    parse(data: string): this;
    valid(): boolean;
    clean(data: string): string;
}
interface State {
    data: StateData;
    valid: boolean;
}
interface StateData {
    groups: Record<string, StateDataGroup>;
    additional: Record<string, any>[];
}
interface StateDataGroup {
    rules: Record<string, any>[];
}
export {};
