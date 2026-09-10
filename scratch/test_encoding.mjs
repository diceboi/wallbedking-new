const sample = "Wallbedking Morphy Lit Escamotable â€“ SystÃ¨me Modulaire Multifonction SizeFlex &amp; TypeFlex, Lit Murphy Gain de Place Ã‰volutif avec Modules Sofa/Bureau/Lit SuperposÃ©, Garantie Ã\xa0 Vie";
// Replace &#xa0; or \xa0
const s = sample.replace(/&#xa0;/g, "\xa0");
const fixed = Buffer.from(s, "latin1").toString("utf8");
console.log("Original:", sample);
console.log("Fixed:   ", fixed);
