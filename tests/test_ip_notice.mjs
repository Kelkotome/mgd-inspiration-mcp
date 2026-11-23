import assert from "node:assert/strict";
import { ipFranchise, withIpNotice, IP_NOTICE_HEAD } from "../src/ip_notice.js";
for (const [q, k] of [["Dota 2", "dark"], ["warhammer 40k space marine poster", "dark"], ["Naruto anime poster", "anime"], ["Disney style logo", "cartoon"], ["Pokémon card layout", "anime"]]) {
  const r = ipFranchise(q); assert.ok(r, q); console.log(q, "→", r.franchise, "|", r.kind.alt);
}
for (const q of ["grimdark fantasy", "anime style illustration", "gym80 brand guidelines", "doomed romance poster", "fraternity", "marvelous serif font"]) assert.equal(ipFranchise(q), null, q);
const res = { content: [{ type: "text", text: "3 results" }] };
withIpNotice(ipFranchise("Dota 2"), res); assert.ok(res.content[0].text.startsWith(IP_NOTICE_HEAD)); withIpNotice(ipFranchise("Dota 2"), res);
assert.equal(res.content[0].text.split(IP_NOTICE_HEAD).length, 2);
console.log(res.content[0].text); console.log("ok");
import { ipStylePool, ipOrder, ipBias } from "../src/ip_notice.js";
assert.equal(ipStylePool("grimdark fantasy"), "alt-grimdark"); assert.equal(ipStylePool("dark fantasy poster"), "alt-grimdark");
assert.equal(ipStylePool("anime style logo"), "alt-anime"); assert.equal(ipStylePool("vintage cartoon characters"), "alt-cartoon");
assert.equal(ipStylePool("fraternity"), null); assert.equal(ipStylePool("minimal poster"), null);
assert.notEqual(ipOrder("naruto"), ipOrder("ghibli")); assert.equal(ipBias("Studio Ghibli"), "landscape"); assert.equal(ipBias("Disney"), "children");
console.log("ok2");
