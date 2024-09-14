import { test, expect } from "vitest";
import { parseRobotsTxt } from "./index";

test("invalid robots.txt", () => {
    const instance = parseRobotsTxt("");
    expect(instance.groups).toStrictEqual([]);

    const instance2 = parseRobotsTxt(`
    
    `);
    expect(instance2.groups).toStrictEqual([]);

    const instance3 = parseRobotsTxt(`
    Allow: /me
    `);
    expect(instance3.groups).toStrictEqual([]);

    const instance4 = parseRobotsTxt(`
    User-Agent: *
    `);
    expect(instance4.groups[0]).toMatchObject({
        ua: ["*"],
        allows: [],
        disallows: [],
        customRules: {},
    });
});

test("google sample robots.txt", () => {
    const data = `  
            # yo
    
            User-Agent: *
            Disallow: *.gif$
            Disallow: /example/
            Allow: /publications/

            User-Agent: foobot
            Disallow:/
            Allow:/example/page.html
            Allow:/example/allowed.gif
            
            # yoyo

            User-Agent: barbot
            User-Agent: bazbot
            Disallow: /example/page.html

            User-Agent: quxbot

            
    `;
    const instance = parseRobotsTxt(data);
    expect(instance.groups[0]).toMatchObject({
        ua: ["*"],
        allows: ["/publications/"],
        disallows: ["*.gif$", "/example/"],
        customRules: {},
    });
    expect(instance.groups[1]).toMatchObject({
        ua: ["foobot"],
        allows: ["/example/page.html", "/example/allowed.gif"],
        disallows: ["/"],
        customRules: {},
    });
    expect(instance.groups[2]).toMatchObject({
        ua: ["barbot", "bazbot"],
        allows: [],
        disallows: ["/example/page.html"],
        customRules: {},
    });
    expect(instance.groups[3]).toMatchObject({
        ua: ["quxbot"],
        allows: [],
        disallows: [],
        customRules: {},
    });
});

test("robots.txt with custom rules", () => {
    const data = `  
            # yo
    
            User-Agent: *
            Disallow: *.gif$
            Disallow: /example/
            Allow: /publications/

            User-Agent: foobot
            Disallow:/
            crawl-delay: 10
            Allow:/example/page.html
            Allow:/example/allowed.gif
            
            # yoyo

            User-Agent: barbot
            User-Agent: bazbot
            Disallow: /example/page.html

            User-Agent: quxbot
    `;
    const instance = parseRobotsTxt(data);
    expect(instance.groups[1]).toMatchObject({
        ua: ["foobot"],
        allows: ["/example/page.html", "/example/allowed.gif"],
        disallows: ["/"],
        customRules: {
            "crawl-delay": "10",
        },
    });
});

test("robots.txt with additional keys", () => {
    const data = `  
            # yo
    
            User-Agent: *
            Disallow: *.gif$
            Disallow: /example/
            Allow: /publications/

            User-Agent: foobot
            Disallow:/
            crawl-delay: 10
            Allow:/example/page.html
            Allow:/example/allowed.gif
            
            # yoyo

            User-Agent: barbot
            User-Agent: bazbot
            Disallow: /example/page.html

            Sitemap: abc
            Sitemap: def
    `;
    const instance = parseRobotsTxt(data);
    expect(instance.groups[1]).toMatchObject({
        ua: ["foobot"],
        allows: ["/example/page.html", "/example/allowed.gif"],
        disallows: ["/"],
        customRules: {
            "crawl-delay": "10",
        },
    });
    expect(instance.additions).toContainEqual(["Sitemap", "abc"]);
    expect(instance.additions).toContainEqual(["Sitemap", "def"]);
});
