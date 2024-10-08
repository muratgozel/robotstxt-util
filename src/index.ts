export class RobotsTxt {
    groups: RobotsTxtGroup[] = [];
    additions: [string, string][] = [];

    _newGroup(userAgents: string | string[]) {
        const group = new RobotsTxtGroup(
            typeof userAgents === "string" ? [userAgents] : userAgents,
        );
        this.groups.push(group);
        return group;
    }

    newGroup(userAgent: string) {
        if (this.groups.some(({ ua }) => ua.includes(userAgent))) {
            const index = this.groups.findIndex(({ ua }) =>
                ua.includes(userAgent),
            );
            return this.groups[index]!;
        } else {
            return this._newGroup(userAgent);
        }
    }

    findGroup(userAgent: string) {
        if (this.groups.some(({ ua }) => ua.includes(userAgent))) {
            const index = this.groups.findIndex(({ ua }) =>
                ua.includes(userAgent),
            );
            return this.groups[index]!;
        } else {
            return undefined;
        }
    }

    add(key: string, value: string) {
        this.additions.push([key, value]);
    }

    json() {
        return {
            groups: this.groups,
            additions: this.additions,
        };
    }

    txt() {
        const groups = this.groups
            .map((group) => {
                const lines: string[] = [];
                group.ua.map((ua) => lines.push(`user-agent: ${ua}`));
                group.allows.map((allow) => lines.push(`allow: ${allow}`));
                group.disallows.map((disallow) =>
                    lines.push(`disallow: ${disallow}`),
                );
                Object.keys(group.customRules).map((key) =>
                    lines.push(`${key}: ${group.customRules[key]}`),
                );
                return lines.join("\r\n");
            })
            .join("\r\n\r\n");

        const additions = this.additions
            .map((arr) => `${arr[0]}: ${arr[1]}`)
            .join("\r\n");

        return `${groups}\r\n\r\n${additions}`;
    }
}

export class RobotsTxtGroup {
    ua: string[];
    allows: string[];
    disallows: string[];
    customRules: Record<string, string>;

    constructor(
        ua: string[],
        allows: string[] = [],
        disallows: string[] = [],
        customRules: Record<string, string> = {},
    ) {
        this.ua = ua;
        this.allows = allows;
        this.disallows = disallows;
        this.customRules = customRules;
    }

    addUserAgent(userAgent: string) {
        this.ua.push(userAgent);
    }

    allow(path: string) {
        this.allows.push(path);
    }

    disallow(path: string) {
        this.disallows.push(path);
    }

    addCustomRule(key: string, value: string) {
        this.customRules[key] = value;
    }
}

export function parseRobotsTxt(data: string) {
    const robotstxt = new RobotsTxt();
    const lines = data.split(/\r?\n/).map((line) => trimLine(line));

    let didContentStart = false;
    let group: InstanceType<typeof RobotsTxtGroup> | null = null;
    for (const line of lines) {
        if (canSkipLine(line)) continue;

        if (!didContentStart) {
            if (!/^(user-agent)/i.test(line)) {
                if (robotstxt.groups.length > 0 && isLineParsable(line)) {
                    const firstLineParsed = parseLine(line);
                    robotstxt.add(firstLineParsed.key, firstLineParsed.value);
                }
                continue;
            }

            const firstLineParsed = parseLine(line);
            verifyUserAgentToken(firstLineParsed.key, firstLineParsed.value);
            group = robotstxt.newGroup(firstLineParsed.value);
            didContentStart = true;
            continue;
        }

        if (!line) {
            group = null;
            didContentStart = false;
            continue;
        }

        const { key, value } = parseLine(line);

        if (isUserAgentToken(key)) group!.addUserAgent(value);
        else if (isAllowToken(key)) group!.allow(value);
        else if (isDisallowToken(key)) group!.disallow(value);
        else group!.addCustomRule(key, value);
    }

    return robotstxt;

    function isUserAgentToken(key: string) {
        return key.toLowerCase() === "user-agent";
    }

    function isAllowToken(key: string) {
        return key.toLowerCase() === "allow";
    }

    function isDisallowToken(key: string) {
        return key.toLowerCase() === "disallow";
    }

    function verifyUserAgentToken(key: string, value: string) {
        if (key.toLowerCase() === "user-agent" && value.length > 0) return true;
        throw new Error(
            `The group should start with "user-agent" and have a value.`,
        );
    }

    function isLineParsable(line: string) {
        const i = line.indexOf(":");

        return !(i === -1 || line.length < i + 1);
    }

    function parseLine(line: string) {
        const i = line.indexOf(":");

        if (i === -1 || line.length < i + 1) {
            throw new Error(`Couldn't parse the line: "${line}".`);
        }

        const key = trimLine(line.slice(0, i));
        const value = trimLine(line.slice(i + 1));
        return { key, value };
    }

    function canSkipLine(line: string) {
        // ignore line if it starts with "#"
        return line.startsWith("#");
    }

    function trimLine(line: string) {
        // removes white spaces and tabs from beginning and end of the line
        return line.replace(/^[\t\s]+/, "").replace(/[\t\s]+$/, "");
    }
}
